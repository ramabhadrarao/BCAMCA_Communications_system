import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  assignments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  }],
  polls: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Group', groupSchema);