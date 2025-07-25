"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../utils/prisma"));
const getAllNotes = async (req, res) => {
    try {
        const { search } = req.query;
        const notes = await prisma_1.default.entry.findMany({
            where: {
                isDeleted: false,
                ...(search && {
                    OR: [
                        {
                            title: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                        {
                            content: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                        {
                            synopsis: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                        {
                            author: {
                                username: {
                                    contains: search,
                                    mode: 'insensitive',
                                },
                            },
                        },
                    ],
                }),
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.status(200).json({
            message: 'Notes retrieved successfully',
            notes,
        });
    }
    catch (error) {
        console.error('Get all notes error:', error);
        res.status(500).json({
            message: 'An error occurred while retrieving notes. Please try again later.',
        });
    }
};
const getNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        console.log('Get note request received for ID:', noteId);
        if (!noteId) {
            console.error('Get note error: Note ID is required');
            return res.status(400).json({ message: 'Note ID is required' });
        }
        console.log('Fetching note from database...');
        const note = await prisma_1.default.entry.findUnique({
            where: { id: noteId },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        console.log('Note fetched:', note ? 'Found' : 'Not found');
        if (!note) {
            console.error('Get note error: Note not found');
            return res.status(404).json({ message: 'Note not found' });
        }
        if (note.isDeleted) {
            console.error('Get note error: Note has been deleted');
            return res.status(404).json({ message: 'Note has been deleted' });
        }
        console.log('Returning note successfully');
        res.status(200).json({
            message: 'Note retrieved successfully',
            note,
        });
    }
    catch (error) {
        console.error('Get note error - Full error details:', {
            error: error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        });
        res.status(500).json({
            message: 'An error occurred while retrieving the note. Please try again later.',
        });
    }
};
const createNote = async (req, res) => {
    try {
        console.log('Create note request received:', {
            body: req.body,
            headers: req.headers
        });
        const { title, synopsis, content, user } = req.body;
        const authorId = user?.id;
        if (!user || !authorId) {
            console.error('Create note error: User not authenticated');
            return res.status(401).json({ message: 'User not authenticated' });
        }
        if (!title || typeof title !== 'string' || !title.trim()) {
            console.error('Create note error: Title is required');
            return res.status(400).json({ message: 'Title is required' });
        }
        if (!synopsis || typeof synopsis !== 'string' || !synopsis.trim()) {
            console.error('Create note error: Synopsis is required');
            return res.status(400).json({ message: 'Synopsis is required' });
        }
        if (!content || typeof content !== 'string' || !content.trim()) {
            console.error('Create note error: Content is required');
            return res.status(400).json({ message: 'Content is required' });
        }
        if (title.trim().length < 3 || title.trim().length > 100) {
            console.error('Create note error: Title length invalid');
            return res.status(400).json({ message: 'Title must be between 3 and 100 characters' });
        }
        if (synopsis.trim().length < 10 || synopsis.trim().length > 200) {
            console.error('Create note error: Synopsis length invalid');
            return res.status(400).json({ message: 'Synopsis must be between 10 and 200 characters' });
        }
        if (content.trim().length < 10) {
            console.error('Create note error: Content too short');
            return res.status(400).json({ message: 'Content must be at least 10 characters long' });
        }
        console.log('Creating note with data:', {
            title: title.trim(),
            synopsis: synopsis.trim(),
            content: content.trim().substring(0, 100) + '...',
            authorId
        });
        const note = await prisma_1.default.entry.create({
            data: {
                title: title.trim(),
                synopsis: synopsis.trim(),
                content: content.trim(),
                authorId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        console.log('Note created successfully:', note.id);
        res.status(201).json({
            message: 'Note created successfully',
            note,
        });
    }
    catch (error) {
        console.error('Create note error - Full error details:', {
            error: error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : undefined
        });
        res.status(500).json({
            message: 'An error occurred while creating the note. Please try again later.',
        });
    }
};
const updateNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { title, synopsis, content, user } = req.body;
        const userId = user?.id;
        if (!noteId) {
            return res.status(400).json({ message: 'Note ID is required' });
        }
        if (!user || !userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        if (!title?.trim()) {
            return res.status(400).json({ message: 'Title is required' });
        }
        if (!synopsis?.trim()) {
            return res.status(400).json({ message: 'Synopsis is required' });
        }
        if (!content?.trim()) {
            return res.status(400).json({ message: 'Content is required' });
        }
        const existingNote = await prisma_1.default.entry.findUnique({
            where: { id: noteId },
        });
        if (!existingNote || existingNote.isDeleted) {
            return res.status(404).json({ message: 'Note not found or has been deleted' });
        }
        if (existingNote.authorId !== userId) {
            return res.status(403).json({ message: 'You do not have permission to update this note' });
        }
        const updatedNote = await prisma_1.default.entry.update({
            where: { id: noteId },
            data: {
                title: title.trim(),
                synopsis: synopsis.trim(),
                content: content.trim(),
                updatedAt: new Date(),
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        res.status(200).json({
            message: 'Note updated successfully',
            note: updatedNote,
        });
    }
    catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({
            message: 'An error occurred while updating the note. Please try again later.',
        });
    }
};
const deleteNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { user } = req.body;
        const userId = user?.id;
        if (!noteId) {
            return res.status(400).json({ message: 'Note ID is required' });
        }
        if (!user || !userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const existingNote = await prisma_1.default.entry.findUnique({
            where: { id: noteId },
        });
        if (!existingNote || existingNote.isDeleted) {
            return res.status(404).json({ message: 'Note not found or has been deleted' });
        }
        if (existingNote.authorId !== userId) {
            return res.status(403).json({ message: 'You do not have permission to delete this note' });
        }
        await prisma_1.default.entry.update({
            where: { id: noteId },
            data: {
                isDeleted: true,
                updatedAt: new Date(),
            },
        });
        res.status(200).json({ message: 'Note deleted successfully' });
    }
    catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({
            message: 'An error occurred while deleting the note. Please try again later.',
        });
    }
};
const getDeletedNotes = async (req, res) => {
    try {
        const { user } = req.body;
        const userId = user?.id;
        if (!user || !userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const deletedNotes = await prisma_1.default.entry.findMany({
            where: {
                isDeleted: true,
                authorId: userId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        res.status(200).json({
            message: 'Deleted notes retrieved successfully',
            notes: deletedNotes,
        });
    }
    catch (error) {
        console.error('Get deleted notes error:', error);
        res.status(500).json({
            message: 'An error occurred while retrieving deleted notes. Please try again later.',
        });
    }
};
const restoreNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { user } = req.body;
        const userId = user?.id;
        if (!noteId) {
            return res.status(400).json({ message: 'Note ID is required' });
        }
        if (!user || !userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const existingNote = await prisma_1.default.entry.findUnique({
            where: { id: noteId },
        });
        if (!existingNote) {
            return res.status(404).json({ message: 'Note not found' });
        }
        if (existingNote.authorId !== userId) {
            return res.status(403).json({ message: 'You do not have permission to restore this note' });
        }
        if (!existingNote.isDeleted) {
            return res.status(400).json({ message: 'Note is not deleted' });
        }
        const restoredNote = await prisma_1.default.entry.update({
            where: { id: noteId },
            data: {
                isDeleted: false,
                updatedAt: new Date(),
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        res.status(200).json({
            message: 'Note restored successfully',
            note: restoredNote,
        });
    }
    catch (error) {
        console.error('Restore note error:', error);
        res.status(500).json({
            message: 'An error occurred while restoring the note. Please try again later.',
        });
    }
};
exports.default = {
    getAllNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote,
    getDeletedNotes,
    restoreNote,
};
//# sourceMappingURL=note.controller.js.map