import express from 'express';
import { 
  sendMessage, 
  getMessages, 
  markAsRead, 
  deleteMessage 
} from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', authenticateToken, upload.single('file'), sendMessage);
router.get('/:groupId', authenticateToken, getMessages);
router.put('/:messageId/read', authenticateToken, markAsRead);
router.delete('/:messageId', authenticateToken, deleteMessage);

export default router;