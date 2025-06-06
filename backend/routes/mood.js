import express from 'express';
import { moodController } from '../controllers/moodController.js';
import { validateMoodEntry } from '../middleware/validation.js';

const router = express.Router();

// Mood tracking routes
router.get('/entries', moodController.getMoodEntries);
router.get('/entries/:entryId', moodController.getMoodEntry);
router.post('/entries', validateMoodEntry, moodController.createMoodEntry);
router.put('/entries/:entryId', validateMoodEntry, moodController.updateMoodEntry);
router.delete('/entries/:entryId', moodController.deleteMoodEntry);

// Mood analytics
router.get('/stats', moodController.getStats);
router.get('/trends', moodController.getTrends);
router.get('/insights', moodController.getInsights);

export default router;