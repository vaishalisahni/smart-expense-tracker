const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['food', 'travel', 'education', 'entertainment', 'utilities', 'shopping', 'health', 'others'],
    default: 'others'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  // AI Features
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiConfidence: {
    type: Number,
    min: 0,
    max: 1
  },
  entryMethod: {
    type: String,
    enum: ['manual', 'voice', 'ocr', 'ai'],
    default: 'manual'
  },
  // Voice Entry Data
  voiceTranscript: {
    type: String
  },
  // OCR Data
  receiptData: {
    merchantName: String,
    receiptDate: Date,
    extractedAmount: Number,
    ocrConfidence: Number,
    receiptUrl: String
  },
  // Additional Fields
  tags: [String],
  notes: String,
  location: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'netbanking', 'other'],
    default: 'other'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    nextDate: Date
  },
  // Group expense reference
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  isGroupExpense: {
    type: Boolean,
    default: false
  },
  splitDetails: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: Number,
    isPaid: {
      type: Boolean,
      default: false
    }
  }]
}, { timestamps: true });

// Indexes for efficient queries
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, createdAt: -1 });
expenseSchema.index({ groupId: 1 });

// Virtual for month
expenseSchema.virtual('month').get(function() {
  return this.date.getMonth() + 1;
});

// Virtual for year
expenseSchema.virtual('year').get(function() {
  return this.date.getFullYear();
});

module.exports = mongoose.model('Expense', expenseSchema);