import { logger } from '../config/logger.js';

// Mock therapy sessions storage
const therapySessions = [];

const therapyController = {
  // Schedule therapy session
  scheduleSession: async (req, res) => {
    try {
      const { therapistId, date, time, notes } = req.body;
      const userId = req.user.id;

      // Validate input
      if (!therapistId || !date || !time) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Therapist ID, date, and time are required',
        });
      }

      // Create session
      const session = {
        id: `session_${Date.now()}_${userId}`,
        userId,
        therapistId,
        date,
        time,
        notes: notes || '',
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      };

      therapySessions.push(session);

      logger.info(`Therapy session scheduled: ${session.id}`);

      res.status(201).json({
        message: 'Therapy session scheduled successfully',
        session: {
          id: session.id,
          therapistId: session.therapistId,
          date: session.date,
          time: session.time,
          status: session.status,
          createdAt: session.createdAt,
        },
      });
    } catch (error) {
      logger.error('Schedule session error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to schedule therapy session',
      });
    }
  },

  // Get user's therapy sessions
  getSessions: async (req, res) => {
    try {
      const userId = req.user.id;
      const userSessions = therapySessions.filter(session => session.userId === userId);

      res.json({
        sessions: userSessions.map(session => ({
          id: session.id,
          therapistId: session.therapistId,
          date: session.date,
          time: session.time,
          status: session.status,
          createdAt: session.createdAt,
        })),
      });
    } catch (error) {
      logger.error('Get sessions error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get therapy sessions',
      });
    }
  },

  // Cancel therapy session
  cancelSession: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const sessionIndex = therapySessions.findIndex(
        session => session.id === sessionId && session.userId === userId
      );

      if (sessionIndex === -1) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Therapy session not found',
        });
      }

      therapySessions[sessionIndex].status = 'cancelled';
      therapySessions[sessionIndex].updatedAt = new Date().toISOString();

      logger.info(`Therapy session cancelled: ${sessionId}`);

      res.json({
        message: 'Therapy session cancelled successfully',
      });
    } catch (error) {
      logger.error('Cancel session error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to cancel therapy session',
      });
    }
  },
};

export { therapyController };