import express from 'express';
import { therapyController } from '../controllers/therapyController.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Validation for scheduling therapy
const validateScheduleTherapy = [
  body('therapistId')
    .notEmpty()
    .withMessage('Therapist ID is required'),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required'),
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/)
    .withMessage('Valid time format is required (e.g., 10:00 AM)'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  handleValidationErrors,
];

// Therapy routes
router.post('/schedule', validateScheduleTherapy, therapyController.scheduleSession);
router.get('/sessions', therapyController.getSessions);
router.put('/sessions/:sessionId/cancel', therapyController.cancelSession);

export default router;