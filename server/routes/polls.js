import express from 'express';
import { 
  createPoll, 
  votePoll, 
  getPoll, 
  getPolls 
} from '../controllers/pollController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, requireRole(['faculty', 'admin', 'hod']), createPoll);
router.post('/:pollId/vote', authenticateToken, requireRole(['student']), votePoll);
router.get('/:pollId', authenticateToken, getPoll);
router.get('/group/:groupId', authenticateToken, getPolls);

export default router;