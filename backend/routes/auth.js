const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { 
  requestOTP, 
  verifyOTP, 
  resendOTP,
  login, 
  logout, 
  getMe,
  updateProfile,
  changePassword,
  refreshToken
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// ✅ Rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts, please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many authentication attempts. Please try again in 15 minutes.',
      retryAfter: 15 * 60 // seconds
    });
  }
});

// ✅ Stricter rate limiter for OTP requests
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 OTP requests per hour
  message: 'Too many OTP requests, please try again later.',
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many OTP requests. Please try again in 1 hour.',
      retryAfter: 60 * 60 // seconds
    });
  }
});

// OTP Routes - ✅ With rate limiting
router.post('/request-otp', otpLimiter, requestOTP);
router.post('/verify-otp', authLimiter, verifyOTP);
router.post('/resend-otp', otpLimiter, resendOTP);

// Auth Routes - ✅ With rate limiting
router.post('/login', authLimiter, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, authLimiter, changePassword);

module.exports = router;