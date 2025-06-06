import { logger } from '../config/logger.js';

// Mock data storage (replace with actual database)
const chatSessions = [];
const messages = [];

const chatController = {
  // Send message to AI
  sendMessage: async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      const userId = req.user.id;

      // Create new session if not provided
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        currentSessionId = `session_${Date.now()}_${userId}`;
        chatSessions.push({
          id: currentSessionId,
          userId,
          createdAt: new Date().toISOString(),
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          isActive: true,
        });
      }

      // Save user message
      const userMessage = {
        id: `msg_${Date.now()}_user`,
        sessionId: currentSessionId,
        userId,
        content: message,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };
      messages.push(userMessage);

      // Mock AI response (replace with actual OpenAI integration)
      const aiResponse = await generateAIResponse(message);
      
      const aiMessage = {
        id: `msg_${Date.now()}_ai`,
        sessionId: currentSessionId,
        userId,
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      messages.push(aiMessage);

      logger.info(`Chat message processed for user ${userId}`);

      res.json({
        message: 'Message sent successfully',
        sessionId: currentSessionId,
        userMessage,
        aiMessage,
      });
    } catch (error) {
      logger.error('Send message error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to send message',
      });
    }
  },

  // Get user's chat sessions
  getSessions: async (req, res) => {
    try {
      const userId = req.user.id;
      const userSessions = chatSessions.filter(session => session.userId === userId);

      res.json({
        sessions: userSessions.map(session => ({
          id: session.id,
          title: session.title,
          createdAt: session.createdAt,
          isActive: session.isActive,
        })),
      });
    } catch (error) {
      logger.error('Get sessions error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get sessions',
      });
    }
  },

  // Get specific chat session
  getSession: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const session = chatSessions.find(
        s => s.id === sessionId && s.userId === userId
      );

      if (!session) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Session not found',
        });
      }

      const sessionMessages = messages.filter(m => m.sessionId === sessionId);

      res.json({
        session: {
          id: session.id,
          title: session.title,
          createdAt: session.createdAt,
          isActive: session.isActive,
        },
        messages: sessionMessages.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: msg.timestamp,
        })),
      });
    } catch (error) {
      logger.error('Get session error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get session',
      });
    }
  },

  // Delete chat session
  deleteSession: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const sessionIndex = chatSessions.findIndex(
        s => s.id === sessionId && s.userId === userId
      );

      if (sessionIndex === -1) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Session not found',
        });
      }

      // Remove session and its messages
      chatSessions.splice(sessionIndex, 1);
      const messageIndices = messages
        .map((msg, index) => msg.sessionId === sessionId ? index : -1)
        .filter(index => index !== -1)
        .reverse(); // Reverse to avoid index shifting

      messageIndices.forEach(index => messages.splice(index, 1));

      logger.info(`Chat session deleted: ${sessionId}`);

      res.json({
        message: 'Session deleted successfully',
      });
    } catch (error) {
      logger.error('Delete session error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete session',
      });
    }
  },

  // Submit feedback for AI response
  submitFeedback: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { messageId, rating, comment } = req.body;
      const userId = req.user.id;

      // In a real implementation, store feedback in database
      logger.info(`Feedback submitted for message ${messageId} by user ${userId}`);

      res.json({
        message: 'Feedback submitted successfully',
      });
    } catch (error) {
      logger.error('Submit feedback error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to submit feedback',
      });
    }
  },
};

// Mock AI response generator (replace with OpenAI integration)
const generateAIResponse = async (userMessage) => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const responses = [
    "Thank you for sharing that with me. It sounds like you're going through a challenging time. Can you tell me more about what's been on your mind?",
    "I understand that you're feeling this way. It's important to acknowledge these feelings. What do you think might be contributing to how you're feeling right now?",
    "That's a very insightful observation. Many people experience similar feelings. Have you noticed any patterns in when these feelings tend to arise?",
    "I appreciate you opening up about this. It takes courage to share personal experiences. What would be most helpful for you to focus on right now?",
    "It sounds like you're being very reflective about your situation. That's a positive step. What are some small things that have helped you feel better in the past?",
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};

export { chatController };