import Assignment from '../models/Assignment.js';
import Group from '../models/Group.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createAssignment = async (req, res) => {
  try {
    const { title, description, groupId, deadline, maxMarks } = req.body;
    
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileSize: file.size
      }));
    }

    const assignment = new Assignment({
      title,
      description,
      group: groupId,
      createdBy: req.user.userId,
      deadline: new Date(deadline),
      maxMarks: maxMarks || 100,
      attachments
    });

    await assignment.save();

    // Add assignment to group
    await Group.findByIdAndUpdate(groupId, {
      $push: { assignments: assignment._id }
    });

    // Create a message for the assignment
    const message = new Message({
      sender: req.user.userId,
      group: groupId,
      content: `Assignment: ${title}`,
      type: 'assignment',
      assignment: assignment._id
    });

    await message.save();

    // Add message to group
    await Group.findByIdAndUpdate(groupId, {
      $push: { messages: message._id }
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('createdBy', 'name email role')
      .populate('group', 'name');

    res.status(201).json(populatedAssignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const assignments = await Assignment.find({ group: groupId })
      .populate('createdBy', 'name email role')
      .populate('submissions.student', 'name email regdno')
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const assignment = await Assignment.findById(assignmentId)
      .populate('createdBy', 'name email role')
      .populate('group', 'name')
      .populate('submissions.student', 'name email regdno')
      .populate('submissions.gradedBy', 'name email role');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if deadline has passed
    if (new Date() > assignment.deadline) {
      return res.status(400).json({ message: 'Assignment deadline has passed' });
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(
      sub => sub.student.toString() === req.user.userId
    );

    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    let files = [];
    if (req.files && req.files.length > 0) {
      const user = await User.findById(req.user.userId);
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      
      files = req.files.map(file => {
        const fileExtension = path.extname(file.originalname);
        const fileName = `${user.regdno}_${user.name}_assignment_${dateStr}_${timeStr}_${file.originalname}`;
        return {
          fileName,
          fileUrl: `/uploads/${file.filename}`,
          fileSize: file.size
        };
      });
    }

    assignment.submissions.push({
      student: req.user.userId,
      files,
      submittedAt: new Date()
    });

    await assignment.save();

    const updatedAssignment = await Assignment.findById(assignmentId)
      .populate('createdBy', 'name email role')
      .populate('submissions.student', 'name email regdno');

    res.json(updatedAssignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const gradeAssignment = async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params;
    const { grade, feedback } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const submission = assignment.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    submission.graded = true;
    submission.gradedAt = new Date();
    submission.gradedBy = req.user.userId;

    await assignment.save();

    const updatedAssignment = await Assignment.findById(assignmentId)
      .populate('createdBy', 'name email role')
      .populate('submissions.student', 'name email regdno')
      .populate('submissions.gradedBy', 'name email role');

    res.json(updatedAssignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getGradeSheet = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const assignment = await Assignment.findById(assignmentId)
      .populate('createdBy', 'name email role')
      .populate('group', 'name subject batch semester')
      .populate('submissions.student', 'name email regdno');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const gradeSheet = {
      assignmentTitle: assignment.title,
      subject: assignment.group.subject,
      batch: assignment.group.batch,
      semester: assignment.group.semester,
      maxMarks: assignment.maxMarks,
      totalSubmissions: assignment.submissions.length,
      gradedSubmissions: assignment.submissions.filter(sub => sub.graded).length,
      submissions: assignment.submissions.map(sub => ({
        studentName: sub.student.name,
        regdno: sub.student.regdno,
        submittedAt: sub.submittedAt,
        grade: sub.grade,
        feedback: sub.feedback,
        graded: sub.graded
      }))
    };

    res.json(gradeSheet);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};