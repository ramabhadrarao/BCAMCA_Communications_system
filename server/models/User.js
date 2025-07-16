import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  regdno: {
    type: String,
    required: function() { return this.role === 'student'; },
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'hod', 'admin'],
    required: true
  },
  // Faculty specific fields
  subject: {
    type: String,
    required: function() { return this.role === 'faculty'; }
  },
  batch: {
    type: String,
    required: function() { return this.role === 'faculty'; }
  },
  semester: {
    type: String,
    required: function() { return this.role === 'faculty'; }
  },
  // Student specific fields
  currentSemester: {
    type: String,
    required: function() { return this.role === 'student'; }
  },
  currentBatch: {
    type: String,
    required: function() { return this.role === 'student'; }
  },
  approved: {
    type: Boolean,
    default: false
  },
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);