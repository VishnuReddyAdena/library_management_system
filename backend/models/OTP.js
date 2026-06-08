const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // Document automatically expires and gets deleted after 5 minutes (300 seconds)
  }
}, {
  timestamps: false
});

const OTP = mongoose.model('OTP', OTPSchema);
module.exports = OTP;
