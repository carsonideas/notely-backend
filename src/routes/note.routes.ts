import express from 'express';
import noteController from '../controllers/note.controller';
import authenticateToken from '../middlewares/auth';
// import { upload } from '../controllers/noteController';
// import noteController from '../controllers/note.controller';

// import {
//   getNotes,
//   getNoteById,
//   createNote,
//   updateNote,
//   deleteNote,
//   upload
// } from '../controllers/note.controller';

const router = express.Router();

// Protected routes (authentication required) - Notes should be private to users
router.get('/', authenticateToken, noteController.getAllNotes);
router.get('/trash', authenticateToken, noteController.getDeletedNotes);
router.get('/:noteId', authenticateToken, noteController.getNote);
router.post('/', authenticateToken, noteController.createNote);
router.put('/:noteId', authenticateToken, noteController.updateNote);
router.patch('/:noteId', authenticateToken, noteController.updateNote);
router.patch('/restore/:noteId', authenticateToken, noteController.restoreNote);
router.delete('/:noteId', authenticateToken, noteController.deleteNote);
// router.post('/notes', upload.single('image'), noteController.createNote);
export default router;

