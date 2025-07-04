import express from 'express';
import { aiChatController } from '../controllers/aiChatController.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Validation for chat messages
const validateChatMessage = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  body('conversationId')
    .optional()
    .isString()
    .withMessage('Conversation ID must be a string'),
  handleValidationErrors,
];

// Test endpoints
router.get('/test', aiChatController.test);
router.get('/test-connection', aiChatController.testConnection);

// AI Chat routes
router.post('/message', validateChatMessage, aiChatController.sendMessage);
router.get('/conversations', aiChatController.getConversations);
router.get('/conversations/:conversationId', aiChatController.getConversation);
router.delete('/conversations/:conversationId', aiChatController.deleteConversation);

// Advanced features
router.post('/summarize', aiChatController.summarizeConversation);
router.get('/analytics', aiChatController.getAnalytics);

export default router;