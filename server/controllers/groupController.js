import Group from '../models/Group.js';
import User from '../models/User.js';
import Message from '../models/Message.js';

export const createGroup = async (req, res) => {
  try {
    const { name, description, subject, batch, semester } = req.body;
    
    const group = new Group({
      name,
      description,
      subject,
      batch,
      semester,
      createdBy: req.user.userId,
      members: [{ user: req.user.userId }]
    });

    await group.save();
    
    // Update user's groups
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { groups: group._id }
    });

    const populatedGroup = await Group.findById(group._id)
      .populate('createdBy', 'name email role')
      .populate('members.user', 'name email role regdno photo');

    res.status(201).json(populatedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getGroups = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const groups = await Group.find({ 
      _id: { $in: user.groups } 
    })
    .populate('createdBy', 'name email role')
    .populate('members.user', 'name email role regdno photo')
    .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId)
      .populate('createdBy', 'name email role')
      .populate('members.user', 'name email role regdno photo');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    const isMember = group.members.some(member => 
      member.user._id.toString() === req.user.userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is faculty/admin
    if (req.user.role !== 'faculty' && req.user.role !== 'admin' && req.user.role !== 'hod') {
      return res.status(403).json({ message: 'Only faculty can add members' });
    }

    // Check if user is already a member
    const isMember = group.members.some(member => 
      member.user.toString() === userId
    );

    if (isMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Add member to group
    group.members.push({ user: userId });
    await group.save();

    // Update user's groups
    await User.findByIdAndUpdate(userId, {
      $push: { groups: groupId }
    });

    const updatedGroup = await Group.findById(groupId)
      .populate('createdBy', 'name email role')
      .populate('members.user', 'name email role regdno photo');

    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is faculty/admin
    if (req.user.role !== 'faculty' && req.user.role !== 'admin' && req.user.role !== 'hod') {
      return res.status(403).json({ message: 'Only faculty can remove members' });
    }

    // Remove member from group
    group.members = group.members.filter(member => 
      member.user.toString() !== userId
    );
    await group.save();

    // Update user's groups
    await User.findByIdAndUpdate(userId, {
      $pull: { groups: groupId }
    });

    const updatedGroup = await Group.findById(groupId)
      .populate('createdBy', 'name email role')
      .populate('members.user', 'name email role regdno photo');

    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAvailableStudents = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const memberIds = group.members.map(member => member.user);
    
    const availableStudents = await User.find({
      role: 'student',
      approved: true,
      _id: { $nin: memberIds },
      currentBatch: group.batch,
      currentSemester: group.semester
    }).select('-password');

    res.json(availableStudents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};