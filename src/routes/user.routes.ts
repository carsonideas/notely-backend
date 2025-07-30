

import express from 'express';
import userController from '../controllers/user.controller';
import authenticateToken from '../middlewares/auth';
import { upload } from '../utils/cloudinary';

const router = express.Router();


//fekwfngfoj3n
// Profile routes
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);

// Avatar upload route
router.post('/avatar', authenticateToken, upload.single('avatar'), userController.uploadAvatar);

// Password update route
router.put('/password', authenticateToken, userController.updatePassword);

// User notes route
router.get('/notes', authenticateToken, userController.getUserNotes);

// Legacy route for backward compatibility
router.patch('/', authenticateToken, userController.updateProfile);
router.patch('/password', authenticateToken, userController.updatePassword);

export default router;
