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
    // ✅ REMOVED: index: true - to prevent duplicate index warning
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
  
  // ============ FINANCIAL SETTINGS ============
  monthlyIncome: {
    type: Number,
    default: 0
  },
  monthlyBudget: {
    type: Number,
    default: 5000
  },
  weeklyBudget: {
    type: Number,
    default: 1250
  },
  
  // ============ SAVINGS GOALS ============
  savingsGoals: [{
    name: {
      type: String,
      required: true
    },
    targetAmount: {
      type: Number,
      required: true
    },
    currentAmount: {
      type: Number,
      default: 0
    },
    monthlyContribution: {
      type: Number,
      default: 0
    },
    deadline: Date,
    createdAt: {
      type: Date,
      default: Date.now
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  }],
  
  // ============ PREFERENCES ============
  preferences: {
    currency: { 
      type: String, 
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP']
    },
    notifications: { type: Boolean, default: true },
    emailAlerts: { type: Boolean, default: true },
    budgetAlerts: {
      at70: { type: Boolean, default: true },
      at90: { type: Boolean, default: true },
      at100: { type: Boolean, default: true }
    },
    theme: { 
      type: String, 
      enum: ['light', 'dark'], 
      default: 'light' 
    }
  },
  
  // ============ ALERT TRACKING ============
  alertsSent: {
    type: Map,
    of: Boolean,
    default: {}
  },
  lastReportSent: {
    type: Date
  },
  
  // ============ SETUP & ONBOARDING ============
  setupCompleted: {
    type: Boolean,
    default: false
  },
  
  // ============ CHAT HISTORY ============
  chatHistory: [{
    message: String,
    response: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // ============ OTHER ============
  profilePicture: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============ INDEXES ============
// ✅ FIXED: Only define index once using schema.index()
userSchema.index({ email: 1 }); // Single definition - no duplicates
userSchema.index({ createdAt: -1 });

// ============ VIRTUAL FIELDS ============

userSchema.virtual('totalSavings').get(function() {
  if (!this.savingsGoals || this.savingsGoals.length === 0) return 0;
  return this.savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
});

userSchema.virtual('totalSavingsTarget').get(function() {
  if (!this.savingsGoals || this.savingsGoals.length === 0) return 0;
  return this.savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
});

userSchema.virtual('savingsProgress').get(function() {
  const total = this.totalSavings;
  const target = this.totalSavingsTarget;
  return target > 0 ? Math.round((total / target) * 100) : 0;
});

// ============ METHODS ============

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.resetMonthlyAlerts = function() {
  this.alertsSent = new Map();
  return this.save();
};

userSchema.methods.addSavings = function(goalId, amount) {
  const goal = this.savingsGoals.id(goalId);
  if (!goal) throw new Error('Goal not found');
  
  goal.currentAmount += amount;
  
  if (goal.currentAmount >= goal.targetAmount) {
    goal.isCompleted = true;
  }
  
  return this.save();
};

userSchema.methods.withdrawSavings = function(goalId, amount) {
  const goal = this.savingsGoals.id(goalId);
  if (!goal) throw new Error('Goal not found');
  
  if (goal.currentAmount < amount) {
    throw new Error('Insufficient savings in this goal');
  }
  
  goal.currentAmount -= amount;
  goal.isCompleted = false;
  
  return this.save();
};

module.exports = mongoose.model('User', userSchema);