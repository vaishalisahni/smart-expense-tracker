const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  monthlyBudget: {
    type: Number,
    default: 5000
  },
  weeklyBudget: {
    type: Number,
    default: 1250
  },
  preferences: {
    currency: { type: String, default: 'INR' },
    notifications: { type: Boolean, default: true },
    emailAlerts: { type: Boolean, default: true },
    budgetAlerts: {
      at70: { type: Boolean, default: true },
      at90: { type: Boolean, default: true },
      at100: { type: Boolean, default: true }
    },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' }
  },
  alertsSent: {
    type: Map,
    of: Boolean,
    default: {}
  },
  lastReportSent: {
    type: Date
  },
  profilePicture: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Reset alert flags at the start of each month
userSchema.methods.resetMonthlyAlerts = function() {
  this.alertsSent = new Map();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);