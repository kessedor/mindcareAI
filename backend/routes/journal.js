import express from 'express';
import { journalController } from '../controllers/journalController.js';
import { validateJournalEntry } from '../middleware/validation.js';

const router = express.Router();

// Journal routes
router.get('/entries', journalController.getEntries);
router.get('/entries/:entryId', journalController.getEntry);
router.post('/entries', validateJournalEntry, journalController.createEntry);
router.put('/entries/:entryId', validateJournalEntry, journalController.updateEntry);
router.delete('/entries/:entryId', journalController.deleteEntry);

// Additional journal features
router.get('/stats', journalController.getStats);
router.get('/search', journalController.searchEntries);
router.get('/export', journalController.exportEntries);

export default router;