import { body, validationResult } from 'express-validator';
import { logger } from '../config/logger.js';

// Generic validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Validation errors:', errors.array());
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errors.array(),
    });
  }
  
  next();
};

// Auth validation rules
const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  handleValidationErrors,
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

// Chat validation rules
const validateChatMessage = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  body('sessionId')
    .optional()
    .isUUID()
    .withMessage('Session ID must be a valid UUID'),
  handleValidationErrors,
];

// Journal validation rules
const validateJournalEntry = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be between 1 and 10000 characters'),
  body('mood')
    .optional()
    .isIn(['excellent', 'good', 'neutral', 'anxious', 'sad'])
    .withMessage('Mood must be one of: excellent, good, neutral, anxious, sad'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
  handleValidationErrors,
];

// Mood validation rules
const validateMoodEntry = [
  body('mood')
    .isInt({ min: 1, max: 10 })
    .withMessage('Mood must be an integer between 1 and 10'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be no more than 1000 characters'),
  body('factors')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Factors must be an array with maximum 20 items'),
  body('factors.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each factor must be between 1 and 50 characters'),
  handleValidationErrors,
];

// ID validation
const validateObjectId = [
  body('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors,
];

export {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateChatMessage,
  validateJournalEntry,
  validateMoodEntry,
  validateObjectId,
};