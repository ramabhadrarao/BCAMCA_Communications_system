import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  getPendingUsers, 
  approveUser, 
  getAllUsers 
} from '../controllers/authController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.get('/pending-users', authenticateToken, requireRole(['admin', 'hod']), getPendingUsers);
router.put('/approve-user/:userId', authenticateToken, requireRole(['admin', 'hod']), approveUser);
router.get('/users', authenticateToken, getAllUsers);

export default router;