import express from 'express';
import { authController } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.use(authMiddleware);
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.post('/logout', authController.logout);
router.delete('/account', authController.deleteAccount);

export default router;