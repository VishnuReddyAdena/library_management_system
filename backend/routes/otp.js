const express = require('express');
const router = express.Router();
const OTP = require('../models/OTP');
const authMiddleware = require('../middleware/auth');

// POST /api/otp/send
router.post('/send', authMiddleware, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  // Generate a secure 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Clean up any existing OTPs for this email to prevent multiple valid OTPs
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Store OTP in database (TTL index automatically deletes it after 5 minutes)
    const otpRecord = new OTP({
      email: email.toLowerCase(),
      otp: otp
    });
    await otpRecord.save();

    // Mail configurations
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    const isMockSmtp = !user || !pass || pass.includes('YOUR_GMAIL_APP_PASSWORD') || pass.trim() === '';

    if (isMockSmtp) {
      console.warn('SMTP credentials not configured. Simulated OTP for email:', email, 'Code:', otp);
      return res.status(200).json({
        success: true,
        message: 'OTP generated and simulated (SMTP not configured)',
        simulated: true,
        otp // return the code in simulation mode so it can be handled by the frontend
      });
    }

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass
      },
      connectionTimeout: 8000, // 8 seconds timeout
      socketTimeout: 8000
    });

    const mailOptions = {
      from: `"LibraryOS Verification" <${user}>`,
      to: email,
      subject: 'LibraryOS Return Verification Code',
      text: `Your book return verification code is ${otp}. It will expire in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; background-color: #f8fafc;">
          <h2 style="color: #4f46e5; margin-bottom: 16px;">LibraryOS Return Verification</h2>
          <p style="font-size: 16px; color: #334155; line-height: 1.5;">You requested a verification code to return a library book. Please use the following 6-digit code to complete the process:</p>
          <div style="display: block; width: fit-content; margin: 24px 0; padding: 12px 24px; background-color: #e0e7ff; border: 1px solid #c7d2fe; border-radius: 6px; font-size: 24px; font-weight: bold; color: #3730a3; letter-spacing: 2px;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #64748b; line-height: 1.5;">This code is valid for <strong>5 minutes</strong>. If you did not request this code, you can safely ignore this email.</p>
          <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">Library Management — LibraryOS</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification code ${otp} sent successfully to ${email}`);
    return res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    return res.status(500).json({ success: false, error: 'Failed to send OTP: ' + err.message });
  }
});

// POST /api/otp/verify
router.post('/verify', authMiddleware, async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Email and OTP code are required' });
  }

  try {
    const record = await OTP.findOne({ email: email.toLowerCase() });
    if (!record) {
      return res.status(400).json({ success: false, error: 'OTP expired or not found. Please request a new one.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ success: false, error: 'Invalid verification code.' });
    }

    // OTP verified successfully - delete it so it cannot be reused
    await OTP.deleteOne({ _id: record._id });

    return res.status(200).json({ success: true, message: 'OTP verified successfully.' });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    return res.status(500).json({ success: false, error: 'Verification failed: ' + err.message });
  }
});

module.exports = router;
