const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { 
  requestOTP, 
  verifyOTP, 
  resendOTP,
  requestLoginOTP,
  verifyLoginOTP,
  resendLoginOTP,
  login, 
  logout, 
  getMe,
  updateProfile,
  changePassword,
  refreshToken
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// ✅ Rate limiter for authentication routes (5 attempts per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many authentication attempts, please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many authentication attempts. Please try again in 15 minutes.',
      retryAfter: 15 * 60
    });
  }
});

// ✅ Stricter rate limiter for OTP requests (3 per hour)
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: 'Too many OTP requests, please try again later.',
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many OTP requests. Please try again in 1 hour.',
      retryAfter: 60 * 60
    });
  }
});

// 🆕 Rate limiter for OTP verification (10 attempts per 15 min)
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many OTP verification attempts',
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many OTP verification attempts. Please try again later.',
      retryAfter: 15 * 60
    });
  }
});

// ===============================
// REGISTRATION ROUTES
// ===============================
router.post('/request-otp', otpLimiter, requestOTP);
router.post('/verify-otp', otpVerifyLimiter, verifyOTP);
router.post('/resend-otp', otpLimiter, resendOTP);

// ===============================
// LOGIN ROUTES
// ===============================

// 🆕 Login with OTP
router.post('/login/request-otp', otpLimiter, requestLoginOTP);
router.post('/login/verify-otp', otpVerifyLimiter, verifyLoginOTP);
router.post('/login/resend-otp', otpLimiter, resendLoginOTP);

// Traditional login with password
router.post('/login', authLimiter, login);

// ===============================
// OTHER AUTH ROUTES
// ===============================
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, authLimiter, changePassword);

module.exports = router;