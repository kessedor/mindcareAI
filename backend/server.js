import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import * as Sentry from '@sentry/node';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import middleware
import { corsMiddleware } from './middleware/cors.js';
import { authMiddleware } from './middleware/auth.js';
import { validationMiddleware } from './middleware/validation.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './config/logger.js';

// Import routes
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import journalRoutes from './routes/journal.js';
import moodRoutes from './routes/mood.js';

// Import database configuration
import { connectDatabase } from './config/database.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
});

const app = express();
const PORT = process.env.PORT || 5000;

// Sentry request handler must be the first middleware
app.use(Sentry.Handlers.requestHandler());

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS middleware
app.use(corsMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Sentry test endpoint
app.get('/debug-sentry', (req, res) => {
  throw new Error('Sentry backend test error - This is intentional for testing purposes');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);
app.use('/api/journal', authMiddleware, journalRoutes);
app.use('/api/mood', authMiddleware, moodRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found on this server.',
  });
});

// Sentry error handler must be before any other error middleware
app.use(Sentry.Handlers.errorHandler());

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌍 Health check: http://localhost:${PORT}/health`);
      logger.info(`🐛 Sentry test: http://localhost:${PORT}/debug-sentry`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    Sentry.captureException(error);
    process.exit(1);
  }
};

startServer();

export default app;