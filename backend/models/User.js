const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'librarian', 'faculty', 'student'],
    default: 'student',
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending'],
    default: 'active',
  },
  failed_attempts: {
    type: Number,
    default: 0,
  },
  locked_until: {
    type: Date,
    default: null,
  },
  last_login: {
    type: Date,
    default: null,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  is_staff: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Methods to set and verify password
UserSchema.methods.setPassword = async function(password) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
};

UserSchema.methods.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

const AuditLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  email_attempted: {
    type: String,
    default: null,
  },
  role_attempted: {
    type: String,
    default: null,
  },
  ip_address: {
    type: String,
    default: null,
  },
  user_agent: {
    type: String,
    default: null,
  },
  event_type: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    default: null,
  },
  level: {
    type: String,
    default: 'info',
  },
  username: {
    type: String,
    default: 'System',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const User = mongoose.model('User', UserSchema);
const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

module.exports = { User, AuditLog };
