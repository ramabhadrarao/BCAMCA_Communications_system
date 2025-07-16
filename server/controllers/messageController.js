import Message from '../models/Message.js';
import Group from '../models/Group.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendMessage = async (req, res) => {
  try {
    const { groupId, content, type = 'text', youtubeUrl } = req.body;
    let fileUrl = '';
    let fileName = '';
    let fileSize = 0;

    // Handle file upload
    if (req.file) {
      const user = req.user;
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      
      const fileExtension = path.extname(req.file.originalname);
      const purpose = type === 'assignment' ? 'assignment' : 'message';
      
      fileName = `${user.userId}_${user.role}_${purpose}_${dateStr}_${timeStr}${fileExtension}`;
      fileUrl = `/uploads/${fileName}`;
      fileSize = req.file.size;
    }

    const message = new Message({
      sender: req.user.userId,
      group: groupId,
      content,
      type,
      fileUrl,
      fileName,
      fileSize,
      youtubeUrl
    });

    await message.save();

    // Add message to group
    await Group.findByIdAndUpdate(groupId, {
      $push: { messages: message._id }
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email role regdno photo');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ group: groupId })
      .populate('sender', 'name email role regdno photo')
      .populate('poll')
      .populate('assignment')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if already read
    const alreadyRead = message.readBy.some(read => 
      read.user.toString() === req.user.userId
    );

    if (!alreadyRead) {
      message.readBy.push({ user: req.user.userId });
      await message.save();
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender or faculty
    if (message.sender.toString() !== req.user.userId && 
        req.user.role !== 'faculty' && 
        req.user.role !== 'admin' && 
        req.user.role !== 'hod') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Message.findByIdAndDelete(messageId);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};