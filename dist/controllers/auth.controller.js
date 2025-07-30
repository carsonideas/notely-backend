"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const hashPassword_1 = require("../utils/hashPassword");
const register = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }
        if (!firstName || !lastName) {
            return res.status(400).json({ message: 'First name and last name are required' });
        }
        const existingUser = await prisma_1.default.user.findFirst({
            where: {
                OR: [{ email }, { username }]
            }
        });
        if (existingUser) {
            return res.status(400).json({
                message: existingUser.email === email
                    ? 'Email already registered'
                    : 'Username already taken'
            });
        }
        const hashedPassword = await (0, hashPassword_1.hashPassword)(password);
        const user = await prisma_1.default.user.create({
            data: {
                username: username.trim(),
                email: email.trim(),
                password: hashedPassword,
                firstName: firstName.trim(),
                lastName: lastName.trim()
            },
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
                dateJoined: true,
                lastProfileUpdate: true
            }
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({ user, token });
    }
    catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ message: 'Failed to register user' });
    }
};
const login = async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;
        if (!emailOrUsername || !password) {
            return res.status(400).json({ message: 'Email/Username and password are required' });
        }
        const user = await prisma_1.default.user.findFirst({
            where: {
                OR: [{ email: emailOrUsername }, { username: emailOrUsername }]
            }
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isValid = await (0, hashPassword_1.comparePassword)(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...userWithoutPassword } = user;
        return res.status(200).json({ user: userWithoutPassword, token });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Failed to login' });
    }
};
const logout = (_req, res) => {
    return res.status(200).json({ message: 'Logged out (token cleared on client)' });
};
exports.default = { register, login, logout };
//# sourceMappingURL=auth.controller.js.map