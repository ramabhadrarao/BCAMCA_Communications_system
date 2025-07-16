import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req, res) => {
  try {
    const { regdno, name, email, password, role, subject, batch, semester, currentSemester, currentBatch } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if student registration number already exists
    if (role === 'student' && regdno) {
      const existingStudent = await User.findOne({ regdno });
      if (existingStudent) {
        return res.status(400).json({ message: 'Registration number already exists' });
      }
    }

    const userData = {
      name,
      email,
      password,
      role,
      approved: role === 'admin' ? true : false
    };

    if (role === 'student') {
      userData.regdno = regdno;
      userData.currentSemester = currentSemester;
      userData.currentBatch = currentBatch;
    } else if (role === 'faculty') {
      userData.subject = subject;
      userData.batch = batch;
      userData.semester = semester;
    }

    const user = new User(userData);
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approved: user.approved
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.approved) {
      return res.status(403).json({ message: 'Account not approved yet' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        regdno: user.regdno,
        photo: user.photo,
        subject: user.subject,
        batch: user.batch,
        semester: user.semester,
        currentSemester: user.currentSemester,
        currentBatch: user.currentBatch
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, photo } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, photo },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ approved: false, role: { $in: ['student', 'faculty'] } })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { approved: true },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ approved: true })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};