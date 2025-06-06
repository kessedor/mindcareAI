import { logger } from '../config/logger.js';

const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Default error
  let error = {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
  };

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.statusCode = 400;
    error.message = 'Invalid ID format';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error.statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.statusCode = 400;
    const messages = Object.values(err.errors).map(val => val.message);
    error.message = messages.join(', ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.statusCode = 401;
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.statusCode = 401;
    error.message = 'Token expired';
  }

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(error.statusCode).json({
    error: error.statusCode >= 500 ? 'Internal Server Error' : err.name || 'Error',
    message: error.message,
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
};

export { errorHandler };