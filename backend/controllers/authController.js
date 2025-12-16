const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOTPEmail, sendLoginOTPEmail } = require('../utils/emailService');

const isProduction = process.env.NODE_ENV === 'production';

// ===============================
// Token helpers
// ===============================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
};

// ===============================
// Cookie options
// ===============================
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
};

// ===============================
// Generate OTP
// ===============================
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// ===============================
// @desc    Request OTP for registration
// @route   POST /api/auth/request-otp
// @access  Public
// ===============================
exports.requestOTP = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    const { name } = req.body;

    if (!email || !name) return res.status(400).json({ error: 'Email and name are required' });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: 'User already exists with this email' });

    // ✅ Delete any existing registration OTPs for this email
    await OTP.deleteMany({ email, type: 'registration' });

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // ✅ FIXED: Explicitly set type to 'registration'
    await OTP.create({
      email,
      otp: otpCode,
      expiresAt,
      attempts: 0,
      type: 'registration'
    });

    await sendOTPEmail(email, name, otpCode);

    res.json({ success: true, message: 'OTP sent to your email', expiresIn: 600 });
  } catch (error) {
    console.error('Request OTP Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// @desc    Verify OTP and Register
// @route   POST /api/auth/verify-otp
// @access  Public
// ===============================
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, password, name } = req.body;
    if (!email || !otp || !password || !name)
      return res.status(400).json({ error: 'All fields are required' });

    // ✅ FIXED: Look for registration type OTP
    const otpRecord = await OTP.findOne({ email, type: 'registration' });
    if (!otpRecord) {
      console.log('❌ No OTP found for:', email, 'type: registration');
      return res.status(400).json({ error: 'No OTP found. Please request a new one.' });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ email, type: 'registration' });
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }

    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ email, type: 'registration' });
      return res.status(400).json({ error: 'Too many failed attempts. Please request a new OTP.' });
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      console.log(`❌ Invalid OTP. Expected: ${otpRecord.otp}, Got: ${otp}`);
      return res.status(400).json({ error: 'Invalid OTP', attemptsLeft: 3 - otpRecord.attempts });
    }

    // ✅ OTP is valid - create user
    const user = await User.create({ name, email, password, isVerified: true });
    await OTP.deleteOne({ email, type: 'registration' });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie('token', token, cookieOptions);
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    console.log('✅ User registered successfully:', email);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
// ===============================
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: 'User already exists' });

    // ✅ Delete existing registration OTPs
    await OTP.deleteMany({ email, type: 'registration' });

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // ✅ FIXED: Set type to 'registration'
    await OTP.create({
      email,
      otp: otpCode,
      expiresAt,
      attempts: 0,
      type: 'registration'
    });

    await sendOTPEmail(email, 'User', otpCode);

    console.log('✅ Resent OTP to:', email);

    res.json({ success: true, message: 'New OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// 🆕 @desc    Request OTP for Login
// @route   POST /api/auth/login/request-otp
// @access  Public
// ===============================
exports.requestLoginOTP = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'No account found with this email' });

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email first' });
    }

    // Delete any existing login OTPs
    await OTP.deleteMany({ email, type: 'login' });

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await OTP.create({
      email,
      otp: otpCode,
      expiresAt,
      attempts: 0,
      type: 'login'
    });

    await sendLoginOTPEmail(email, user.name, otpCode);

    res.json({
      success: true,
      message: 'Login OTP sent to your email',
      expiresIn: 600
    });
  } catch (error) {
    console.error('Request Login OTP Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// 🆕 @desc    Verify Login OTP
// @route   POST /api/auth/login/verify-otp
// @access  Public
// ===============================
exports.verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const otpRecord = await OTP.findOne({ email, type: 'login' });
    if (!otpRecord) {
      return res.status(400).json({ error: 'No OTP found. Please request a new one.' });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ email, type: 'login' });
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }

    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ email, type: 'login' });
      return res.status(400).json({ error: 'Too many failed attempts. Please request a new OTP.' });
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({
        error: 'Invalid OTP',
        attemptsLeft: 3 - otpRecord.attempts
      });
    }

    // OTP is valid - find user and log them in
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await OTP.deleteOne({ email, type: 'login' });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie('token', token, cookieOptions);
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        monthlyBudget: user.monthlyBudget,
        weeklyBudget: user.weeklyBudget,
      },
    });
  } catch (error) {
    console.error('Verify Login OTP Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// 🆕 @desc    Resend Login OTP
// @route   POST /api/auth/login/resend-otp
// @access  Public
// ===============================
exports.resendLoginOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'No account found with this email' });

    await OTP.deleteMany({ email, type: 'login' });

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OTP.create({
      email,
      otp: otpCode,
      expiresAt,
      attempts: 0,
      type: 'login'
    });

    await sendLoginOTPEmail(email, user.name, otpCode);

    res.json({ success: true, message: 'New login OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// @desc    Login user (with password)
// @route   POST /api/auth/login
// @access  Public
// ===============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.isVerified) return res.status(401).json({ error: 'Please verify your email first' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie('token', token, cookieOptions);
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        monthlyBudget: user.monthlyBudget,
        weeklyBudget: user.weeklyBudget,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
// ===============================
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token missing' });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const newToken = generateToken(decoded.id);

    res.cookie('token', newToken, cookieOptions);
    res.json({ success: true });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// ===============================
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
// ===============================
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
};

// ===============================
// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
// ===============================
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ===============================
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
// ===============================
exports.updateProfile = async (req, res) => {
  try {
    const { name, monthlyBudget, weeklyBudget, preferences, setupCompleted, savingsGoals } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (monthlyBudget !== undefined) updateData.monthlyBudget = monthlyBudget;
    if (weeklyBudget !== undefined) updateData.weeklyBudget = weeklyBudget;
    if (preferences) updateData.preferences = preferences;
    if (setupCompleted !== undefined) updateData.setupCompleted = setupCompleted;
    if (savingsGoals) updateData.savingsGoals = savingsGoals;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true }).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
// ===============================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Please provide current and new password' });

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};