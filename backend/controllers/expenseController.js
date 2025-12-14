const Expense = require('../models/Expense');
const { categorizeExpenseAI } = require('../utils/aiService');

// @desc    Get all expenses for user
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category, limit = 50 } = req.query;

    const query = { userId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (category) query.category = category;

    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
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
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res) => {
  try {
    const { amount, description, category, date } = req.body;

    // AI Categorization if no category provided
    let finalCategory = category;
    let aiGenerated = false;
    let aiConfidence = 0;

    if (!category || category === 'auto') {
      const aiResult = categorizeExpenseAI(description, amount);
      finalCategory = aiResult.category;
      aiGenerated = true;
      aiConfidence = aiResult.confidence;
    }

    const expense = await Expense.create({
      userId: req.user._id,
      amount,
      description,
      category: finalCategory,
      date: date || new Date(),
      aiGenerated,
      aiConfidence
    });

    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error) {
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
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get expense analytics
// @route   GET /api/expenses/analytics
// @access  Private
exports.getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

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

    res.json({
      success: true,
      data: {
        categoryBreakdown: categoryAnalytics,
        totalSpent: totalSpending[0]?.total || 0,
        totalTransactions: totalSpending[0]?.count || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
