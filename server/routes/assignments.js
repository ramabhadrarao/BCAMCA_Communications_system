import express from 'express';
import { 
  createAssignment, 
  getAssignments, 
  getAssignment, 
  submitAssignment, 
  gradeAssignment, 
  getGradeSheet 
} from '../controllers/assignmentController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', authenticateToken, requireRole(['faculty', 'admin', 'hod']), upload.array('attachments', 10), createAssignment);
router.get('/group/:groupId', authenticateToken, getAssignments);
router.get('/:assignmentId', authenticateToken, getAssignment);
router.post('/:assignmentId/submit', authenticateToken, requireRole(['student']), upload.array('files', 10), submitAssignment);
router.put('/:assignmentId/submissions/:submissionId/grade', authenticateToken, requireRole(['faculty', 'admin', 'hod']), gradeAssignment);
router.get('/:assignmentId/grade-sheet', authenticateToken, requireRole(['faculty', 'admin', 'hod']), getGradeSheet);

export default router;