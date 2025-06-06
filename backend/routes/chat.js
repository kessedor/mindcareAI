import express from 'express';
import { chatController } from '../controllers/chatController.js';
import { validateChatMessage } from '../middleware/validation.js';

const router = express.Router();

// Chat routes
router.post('/message', validateChatMessage, chatController.sendMessage);
router.get('/sessions', chatController.getSessions);
router.get('/sessions/:sessionId', chatController.getSession);
router.delete('/sessions/:sessionId', chatController.deleteSession);
router.post('/sessions/:sessionId/feedback', chatController.submitFeedback);

export default router;