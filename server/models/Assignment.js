import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  maxMarks: {
    type: Number,
    required: true,
    default: 100
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number
  }],
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    files: [{
      fileName: String,
      fileUrl: String,
      fileSize: Number
    }],
    grade: {
      type: Number,
      default: 0
    },
    feedback: {
      type: String,
      default: ''
    },
    graded: {
      type: Boolean,
      default: false
    },
    gradedAt: Date,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Assignment', assignmentSchema);