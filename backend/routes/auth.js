const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User, AuditLog } = require('../models/User');
const { Member } = require('../models/Library');

// Simple in-memory store for login attempts
let loginAttemptsCache = {};

// Clean up expired cache items
const cleanCache = () => {
  const now = new Date();
  Object.keys(loginAttemptsCache).forEach(k => {
    if (loginAttemptsCache[k].expires < now) {
      delete loginAttemptsCache[k];
    }
  });
};

router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Validation error", code: "VALIDATION_FAILED" });
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "An account with this email already exists." });
    }

    const user = new User({
      email: email.toLowerCase(),
      role: role || 'student',
      status: 'active',
      is_staff: role === 'admin' || role === 'librarian',
    });
    await user.setPassword(password);
    await user.save();

    // Auto create member profile
    if (user.role === 'student' || user.role === 'faculty') {
      const member = new Member({
        user_id: user._id,
        membership_type: user.role === 'student' ? 'Student' : 'Faculty',
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      });
      await member.save();
    }

    return res.status(201).json({ success: true, message: "Account created successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password, role: roleRequested } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Validation error", code: "VALIDATION_FAILED" });
  }

  const ip = req.ip || req.connection.remoteAddress;
  const cacheKey = `${ip}_${email}`;
  const now = new Date();

  cleanCache();

  // Get attempts info
  if (!loginAttemptsCache[cacheKey]) {
    loginAttemptsCache[cacheKey] = { count: 0, expires: new Date(now.getTime() + 15 * 60 * 1000) };
  }

  const attemptsInfo = loginAttemptsCache[cacheKey];
  const attempts = attemptsInfo.count;

  if (attempts >= 5) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      user.locked_until = new Date(now.getTime() + 15 * 60 * 1000);
      await user.save();

      const log = new AuditLog({
        user_id: user._id,
        email_attempted: email,
        role_attempted: roleRequested,
        ip_address: ip,
        user_agent: req.headers['user-agent'] || 'Unknown',
        event_type: 'account_locked'
      });
      await log.save();
    }
    return res.status(429).json({ success: false, message: "Too many attempts. Try again later.", code: "TOO_MANY_ATTEMPTS" });
  }

  // Auto-provision admin
  if (email === 'vishnureddycom4@gmail.com' && password === '7095410421') {
    let adminUser = await User.findOne({ email: email.toLowerCase() });
    if (!adminUser) {
      adminUser = new User({ email: email.toLowerCase(), role: 'admin', is_staff: true, status: 'active' });
      await adminUser.setPassword(password);
      await adminUser.save();
    } else {
      if (!(await adminUser.checkPassword(password)) || adminUser.role !== 'admin') {
        await adminUser.setPassword(password);
        adminUser.role = 'admin';
        adminUser.status = 'active';
        adminUser.is_staff = true;
        await adminUser.save();
      }
    }
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials.", code: "INVALID_CREDENTIALS" });
  }

  if (roleRequested && user.role !== roleRequested) {
    return res.status(403).json({ success: false, message: "Invalid role for this account.", code: "ROLE_MISMATCH" });
  }

  if (user.locked_until && user.locked_until > now) {
    return res.status(429).json({ success: false, message: "Too many attempts. Try again later.", code: "ACCOUNT_LOCKED" });
  }

  const isPasswordValid = await user.checkPassword(password);
  if (!isPasswordValid) {
    user.failed_attempts += 1;
    await user.save();

    loginAttemptsCache[cacheKey].count = attempts + 1;

    const log = new AuditLog({
      user_id: user._id,
      email_attempted: email,
      role_attempted: user.role,
      ip_address: ip,
      user_agent: req.headers['user-agent'] || 'Unknown',
      event_type: 'login_failure'
    });
    await log.save();

    return res.status(401).json({ success: false, message: "Invalid credentials.", code: "INVALID_CREDENTIALS" });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ success: false, message: "Account suspended.", code: "ACCOUNT_SUSPENDED" });
  }

  if (user.status === 'pending') {
    return res.status(403).json({ success: false, message: "Account pending approval.", code: "ACCOUNT_PENDING" });
  }

  // Success
  user.failed_attempts = 0;
  user.locked_until = null;
  user.last_login = now;
  await user.save();

  if (loginAttemptsCache[cacheKey]) {
    delete loginAttemptsCache[cacheKey];
  }

  const log = new AuditLog({
    user_id: user._id,
    email_attempted: email,
    role_attempted: user.role,
    ip_address: ip,
    user_agent: req.headers['user-agent'] || 'Unknown',
    event_type: 'login_success'
  });
  await log.save();

  // Create JWTs
  const secret = process.env.JWT_SECRET_KEY || 'jwt-secret-key-12345';
  const accessToken = jwt.sign(
    { sub: user._id, id: user._id, role: user.role },
    secret,
    { expiresIn: '1h' }
  );
  const refreshToken = jwt.sign(
    { sub: user._id, id: user._id, role: user.role },
    secret,
    { expiresIn: '7d' }
  );

  res.cookie('refresh', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth/refresh/'
  });

  return res.status(200).json({
    success: true,
    access: accessToken,
    user: { id: user._id.toString(), email: user.email, role: user.role }
  });
});

router.post('/logout', (req, res) => {
  res.clearCookie('refresh', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth/refresh/'
  });
  return res.status(200).json({ success: true, message: "Successfully logged out." });
});

router.post('/refresh', (req, res) => {
  const refreshToken = req.cookies.refresh;
  if (!refreshToken) {
    return res.status(401).json({ msg: "Missing refresh cookie" });
  }

  const secret = process.env.JWT_SECRET_KEY || 'jwt-secret-key-12345';

  try {
    const decoded = jwt.verify(refreshToken, secret);
    const accessToken = jwt.sign(
      { sub: decoded.sub, id: decoded.id, role: decoded.role },
      secret,
      { expiresIn: '1h' }
    );
    return res.status(200).json({
      success: true,
      access: accessToken
    });
  } catch (error) {
    return res.status(401).json({ msg: "Invalid Refresh Token" });
  }
});

module.exports = router;
