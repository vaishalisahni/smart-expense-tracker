const Expense = require('../models/Expense');
const mongoose = require('mongoose');
const { categorizeExpenseAI } = require('../utils/aiService');
const { handleVoiceUpload, handleReceiptUpload } = require('../utils/voiceOcrService');
const { checkBudgetAndAlert } = require('../utils/budgetAlertService');

// @desc    Get all expenses for user
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category, limit = 50, page = 1, search } = req.query;

    const query = { userId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (category && category !== 'all') query.category = category;

    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Expense.countDocuments(query);

    res.json({
      success: true,
      count: expenses.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: expenses
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res) => {
  // ✅ Use transaction for data consistency
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, description, category, date, notes, tags, paymentMethod, location } = req.body;

    // ✅ Validate input
    if (!amount || !description) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Amount and description are required' });
    }

    if (amount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // ✅ Sanitize description
    const sanitizedDescription = description.trim().substring(0, 500);

    // AI Categorization if no category provided
    let finalCategory = category;
    let aiGenerated = false;
    let aiConfidence = 0;

    if (!category || category === 'auto') {
      const aiResult = categorizeExpenseAI(sanitizedDescription, amount);
      finalCategory = aiResult.category;
      aiGenerated = true;
      aiConfidence = aiResult.confidence;
    }

    const expense = await Expense.create([{
      userId: req.user._id,
      amount: parseFloat(amount),
      description: sanitizedDescription,
      category: finalCategory,
      date: date || new Date(),
      aiGenerated,
      aiConfidence,
      entryMethod: 'manual',
      notes: notes?.substring(0, 1000),
      tags: tags?.slice(0, 10),
      paymentMethod,
      location: location?.substring(0, 200)
    }], { session });

    // Check budget and send alert if needed (don't wait)
    checkBudgetAndAlert(req.user._id).catch(err => {
      console.error('Budget alert error:', err);
    });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: expense[0]
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Create expense error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create expense from voice input
// @route   POST /api/expenses/voice
// @access  Private
exports.createExpenseFromVoice = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Process voice input
    const voiceResult = await handleVoiceUpload(req.file);

    if (!voiceResult.success || !voiceResult.expenseData) {
      return res.status(400).json({ error: 'Could not extract expense data from voice' });
    }

    const { amount, description, category, date } = voiceResult.expenseData;

    // Create expense
    const expense = await Expense.create({
      userId: req.user._id,
      amount,
      description: description || voiceResult.transcript,
      category: category || 'others',
      date: date || new Date(),
      entryMethod: 'voice',
      voiceTranscript: voiceResult.transcript,
      aiGenerated: true,
      aiConfidence: voiceResult.confidence
    });

    checkBudgetAndAlert(req.user._id).catch(err => {
      console.error('Budget alert error:', err);
    });

    res.status(201).json({
      success: true,
      data: expense,
      transcript: voiceResult.transcript
    });
  } catch (error) {
    console.error('Voice expense error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create expense from receipt OCR
// @route   POST /api/expenses/ocr
// @access  Private
exports.createExpenseFromReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Process receipt image
    const ocrResult = await handleReceiptUpload(req.file);

    if (!ocrResult.success || !ocrResult.receiptData) {
      return res.status(400).json({ error: 'Could not extract data from receipt' });
    }

    const { amount, merchantName, date, category, description } = ocrResult.receiptData;

    // Create expense
    const expense = await Expense.create({
      userId: req.user._id,
      amount,
      description: description || `Purchase at ${merchantName}`,
      category: category || 'others',
      date: date || new Date(),
      entryMethod: 'ocr',
      receiptData: {
        merchantName,
        receiptDate: date,
        extractedAmount: amount,
        ocrConfidence: ocrResult.confidence,
        receiptUrl: req.file.path // If storing file
      },
      aiGenerated: true,
      aiConfidence: ocrResult.confidence
    });

    checkBudgetAndAlert(req.user._id).catch(err => {
      console.error('Budget alert error:', err);
    });

    res.status(201).json({
      success: true,
      data: expense,
      receiptData: ocrResult.receiptData
    });
  } catch (error) {
    console.error('OCR expense error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res) => {
  try {
    let expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // ✅ Sanitize updates
    if (req.body.description) {
      req.body.description = req.body.description.trim().substring(0, 500);
    }
    if (req.body.notes) {
      req.body.notes = req.body.notes.substring(0, 1000);
    }

    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await expense.deleteOne();

    res.json({
      success: true,
      message: 'Expense deleted'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Bulk delete expenses
// @route   POST /api/expenses/bulk-delete
// @access  Private
exports.bulkDeleteExpenses = async (req, res) => {
  try {
    const { expenseIds } = req.body;

    if (!expenseIds || !Array.isArray(expenseIds) || expenseIds.length === 0) {
      return res.status(400).json({ error: 'Invalid expense IDs' });
    }

    // ✅ Limit bulk operations
    if (expenseIds.length > 100) {
      return res.status(400).json({ error: 'Cannot delete more than 100 expenses at once' });
    }

    const result = await Expense.deleteMany({
      _id: { $in: expenseIds },
      userId: req.user._id
    });

    res.json({
      success: true,
      message: `${result.deletedCount} expenses deleted`
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get expense analytics
// @route   GET /api/expenses/analytics
// @access  Private
exports.getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, period = 'month' } = req.query;

    const matchStage = { userId: req.user._id };
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    // Category-wise analytics
    const categoryAnalytics = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Total spending
    const totalSpending = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Daily spending trend
    const dailyTrend = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    // Payment method breakdown
    const paymentMethodBreakdown = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        categoryBreakdown: categoryAnalytics,
        totalSpent: totalSpending[0]?.total || 0,
        totalTransactions: totalSpending[0]?.count || 0,
        avgTransactionAmount: totalSpending[0] ? totalSpending[0].total / totalSpending[0].count : 0,
        dailyTrend,
        paymentMethodBreakdown
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get spending trends
// @route   GET /api/expenses/trends
// @access  Private
exports.getSpendingTrends = async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const monthlyTrend = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: monthlyTrend
    });
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Export expenses
// @route   GET /api/expenses/export
// @access  Private
exports.exportExpenses = async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate } = req.query;

    const query = { userId: req.user._id };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query).sort({ date: -1 });

    if (format === 'csv') {
      // Convert to CSV
      const csvHeader = 'Date,Description,Category,Amount,Payment Method,Notes\n';
      const csvData = expenses.map(exp => {
        const date = exp.date.toISOString().split('T')[0];
        const desc = `"${(exp.description || '').replace(/"/g, '""')}"`;
        const notes = `"${(exp.notes || '').replace(/"/g, '""')}"`;
        return `${date},${desc},${exp.category},${exp.amount},${exp.paymentMethod || ''},${notes}`;
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=expenses-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvHeader + csvData);
    } else {
      // Return JSON
      res.json({
        success: true,
        count: expenses.length,
        data: expenses
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: error.message });
  }
};