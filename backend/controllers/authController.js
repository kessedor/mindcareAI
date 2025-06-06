import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger } from '../config/logger.js';

// Mock user storage (replace with actual database)
const users = [];

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });
};

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = users.find(user => user.email === email);
      if (existingUser) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'User already exists with this email',
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = {
        id: users.length + 1,
        email,
        name,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      users.push(user);

      // Generate tokens
      const tokenPayload = { id: user.id, email: user.email, name: user.name };
      const token = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
        token,
        refreshToken,
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to register user',
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = users.find(user => user.email === email);
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password',
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password',
        });
      }

      // Generate tokens
      const tokenPayload = { id: user.id, email: user.email, name: user.name };
      const token = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      logger.info(`User logged in: ${email}`);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
        token,
        refreshToken,
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to login',
      });
    }
  },

  // Refresh token
  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Refresh token required',
        });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const tokenPayload = { id: decoded.id, email: decoded.email, name: decoded.name };
      const newToken = generateToken(tokenPayload);

      res.json({
        message: 'Token refreshed successfully',
        token: newToken,
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid refresh token',
      });
    }
  },

  // Get user profile
  getProfile: async (req, res) => {
    try {
      const user = users.find(user => user.id === req.user.id);
      
      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get profile',
      });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { name } = req.body;
      const userIndex = users.findIndex(user => user.id === req.user.id);
      
      if (userIndex === -1) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      users[userIndex].name = name || users[userIndex].name;
      users[userIndex].updatedAt = new Date().toISOString();

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: users[userIndex].id,
          email: users[userIndex].email,
          name: users[userIndex].name,
          createdAt: users[userIndex].createdAt,
          updatedAt: users[userIndex].updatedAt,
        },
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update profile',
      });
    }
  },

  // Logout user
  logout: async (req, res) => {
    try {
      // In a real implementation, you might want to blacklist the token
      logger.info(`User logged out: ${req.user.email}`);
      
      res.json({
        message: 'Logout successful',
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to logout',
      });
    }
  },

  // Delete user account
  deleteAccount: async (req, res) => {
    try {
      const userIndex = users.findIndex(user => user.id === req.user.id);
      
      if (userIndex === -1) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      users.splice(userIndex, 1);
      logger.info(`User account deleted: ${req.user.email}`);

      res.json({
        message: 'Account deleted successfully',
      });
    } catch (error) {
      logger.error('Delete account error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete account',
      });
    }
  },

  // Forgot password
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      
      // In a real implementation, you would:
      // 1. Check if user exists
      // 2. Generate reset token
      // 3. Send reset email
      
      logger.info(`Password reset requested for: ${email}`);
      
      res.json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to process password reset request',
      });
    }
  },

  // Reset password
  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      // In a real implementation, you would:
      // 1. Verify reset token
      // 2. Hash new password
      // 3. Update user password
      
      logger.info('Password reset completed');
      
      res.json({
        message: 'Password reset successful',
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to reset password',
      });
    }
  },
};

export { authController };