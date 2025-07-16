import express from 'express';
import { 
  createGroup, 
  getGroups, 
  getGroup, 
  addMember, 
  removeMember, 
  getAvailableStudents 
} from '../controllers/groupController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, requireRole(['faculty', 'admin', 'hod']), createGroup);
router.get('/', authenticateToken, getGroups);
router.get('/:groupId', authenticateToken, getGroup);
router.post('/:groupId/members', authenticateToken, requireRole(['faculty', 'admin', 'hod']), addMember);
router.delete('/:groupId/members/:userId', authenticateToken, requireRole(['faculty', 'admin', 'hod']), removeMember);
router.get('/:groupId/available-students', authenticateToken, requireRole(['faculty', 'admin', 'hod']), getAvailableStudents);

export default router;