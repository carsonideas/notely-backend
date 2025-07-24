

import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import AuthenticatedRequest from '../types/AuthenticatedRequest';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';

const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
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
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to retrieve profile' });
  }
};

const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { firstName, lastName, username, email, avatar } = req.body;
    const userId = req.user!.id;

    // Validate firstName and lastName if provided
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

    // Check if username or email already exists (excluding current user)
    if (username || email) {
      const existingUser = await prisma.user.findFirst({
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

    // Prepare update data
    const updateData: any = {
      lastProfileUpdate: new Date()
    };

    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (lastName !== undefined) updateData.lastName = lastName.trim();
    if (username !== undefined) updateData.username = username.trim();
    if (email !== undefined) updateData.email = email.trim();
    if (avatar !== undefined) updateData.avatar = avatar?.trim() || null;

    const updatedUser = await prisma.user.update({
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
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

const uploadAvatar = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Get current user to check for existing avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true }
    });

    // Upload new image to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'notely/avatars');

    // Update user's avatar URL in database
    const updatedUser = await prisma.user.update({
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

    // Delete old avatar from Cloudinary if it exists
    if (currentUser?.avatar) {
      try {
        // Extract public_id from the URL
        const urlParts = currentUser.avatar.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = `notely/avatars/${publicIdWithExtension.split('.')[0]}`;
        await deleteFromCloudinary(publicId);
      } catch (deleteError) {
        console.error('Error deleting old avatar:', deleteError);
        // Don't fail the request if old image deletion fails
      }
    }

    res.status(200).json({
      message: 'Avatar uploaded successfully',
      user: updatedUser,
      avatarUrl: uploadResult.url
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
};

const updatePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        lastProfileUpdate: new Date()
      }
    });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ message: "Failed to update password" });
  }
};

const getUserNotes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const notes = await prisma.entry.findMany({
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
  } catch (error) {
    console.error('Get user notes error:', error);
    res.status(500).json({ message: 'Failed to retrieve user notes' });
  }
};

export default {
  getProfile,
  updateProfile,
  uploadAvatar,
  updatePassword,
  getUserNotes
};
