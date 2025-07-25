"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const cloudinary_1 = require("../utils/cloudinary");
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                email: true,
                avatar: true,
                dateJoined: true,
                lastProfileUpdate: true
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            message: 'Profile retrieved successfully',
            user
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Failed to retrieve profile' });
    }
};
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, username, email, avatar } = req.body;
        const userId = req.user.id;
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (firstName !== undefined) {
            if (!firstName.trim() || firstName.trim().length < 2) {
                return res.status(400).json({ message: 'First name must be at least 2 characters long' });
            }
            if (!nameRegex.test(firstName.trim())) {
                return res.status(400).json({ message: 'First name can only contain letters and spaces' });
            }
        }
        if (lastName !== undefined) {
            if (!lastName.trim() || lastName.trim().length < 2) {
                return res.status(400).json({ message: 'Last name must be at least 2 characters long' });
            }
            if (!nameRegex.test(lastName.trim())) {
                return res.status(400).json({ message: 'Last name can only contain letters and spaces' });
            }
        }
        if (username || email) {
            const existingUser = await prisma_1.default.user.findFirst({
                where: {
                    AND: [
                        { id: { not: userId } },
                        {
                            OR: [
                                ...(email ? [{ email: email.trim() }] : []),
                                ...(username ? [{ username: username.trim() }] : [])
                            ]
                        }
                    ]
                }
            });
            if (existingUser) {
                return res.status(400).json({
                    message: existingUser.email === email ? "Email already exists" : "Username already exists"
                });
            }
        }
        const updateData = {
            lastProfileUpdate: new Date()
        };
        if (firstName !== undefined)
            updateData.firstName = firstName.trim();
        if (lastName !== undefined)
            updateData.lastName = lastName.trim();
        if (username !== undefined)
            updateData.username = username.trim();
        if (email !== undefined)
            updateData.email = email.trim();
        if (avatar !== undefined)
            updateData.avatar = avatar?.trim() || null;
        const updatedUser = await prisma_1.default.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                email: true,
                avatar: true,
                dateJoined: true,
                lastProfileUpdate: true
            }
        });
        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
};
const uploadAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }
        const currentUser = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { avatar: true }
        });
        const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, 'notely/avatars');
        const updatedUser = await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                avatar: uploadResult.url,
                lastProfileUpdate: new Date()
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                email: true,
                avatar: true,
                dateJoined: true,
                lastProfileUpdate: true
            }
        });
        if (currentUser?.avatar) {
            try {
                const urlParts = currentUser.avatar.split('/');
                const publicIdWithExtension = urlParts[urlParts.length - 1];
                const publicId = `notely/avatars/${publicIdWithExtension.split('.')[0]}`;
                await (0, cloudinary_1.deleteFromCloudinary)(publicId);
            }
            catch (deleteError) {
                console.error('Error deleting old avatar:', deleteError);
            }
        }
        res.status(200).json({
            message: 'Avatar uploaded successfully',
            user: updatedUser,
            avatarUrl: uploadResult.url
        });
    }
    catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({ message: 'Failed to upload avatar' });
    }
};
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                password: hashedNewPassword,
                lastProfileUpdate: new Date()
            }
        });
        res.status(200).json({ message: "Password updated successfully" });
    }
    catch (error) {
        console.error("Update password error:", error);
        res.status(500).json({ message: "Failed to update password" });
    }
};
const getUserNotes = async (req, res) => {
    try {
        const userId = req.user.id;
        const notes = await prisma_1.default.entry.findMany({
            where: {
                authorId: userId,
                isDeleted: false
            },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        username: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json({
            message: "User notes retrieved successfully",
            notes
        });
    }
    catch (error) {
        console.error('Get user notes error:', error);
        res.status(500).json({ message: 'Failed to retrieve user notes' });
    }
};
exports.default = {
    getProfile,
    updateProfile,
    uploadAvatar,
    updatePassword,
    getUserNotes
};
//# sourceMappingURL=user.controller.js.map