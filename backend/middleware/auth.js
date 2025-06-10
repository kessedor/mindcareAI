import jwt from 'jsonwebtoken';
import { logger } from '../config/logger.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization header provided',
      });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
    }

    // For testing purposes, allow mock token
    if (token === 'mock-token-for-testing') {
      req.user = {
        id: 'test-user-123',
        email: 'test@example.com',
        name: 'Test User',
      };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired',
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
};

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      
      if (token) {
        // For testing purposes, allow mock token
        if (token === 'mock-token-for-testing') {
          req.user = {
            id: 'test-user-123',
            email: 'test@example.com',
            name: 'Test User',
          };
          return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
        };
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't reject on error
    logger.warn('Optional auth middleware warning:', error.message);
    next();
  }
};

const adminAuthMiddleware = async (req, res, next) => {
  try {
    // First run regular auth middleware
    await new Promise((resolve, reject) => {
      authMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user has admin role
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required',
      });
    }

    next();
  } catch (error) {
    logger.error('Admin auth middleware error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authorization failed',
    });
  }
};

export { authMiddleware, optionalAuthMiddleware, adminAuthMiddleware };