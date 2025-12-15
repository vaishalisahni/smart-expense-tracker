const User = require('../models/User');

/**
 * @desc    Get all savings goals for user
 * @route   GET /api/savings/goals
 * @access  Private
 */
exports.getGoals = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('savingsGoals');
    
    res.json({
      success: true,
      goals: user.savingsGoals || [],
      totalSavings: user.totalSavings,
      totalTarget: user.totalSavingsTarget,
      progress: user.savingsProgress
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Create new savings goal
 * @route   POST /api/savings/goals
 * @access  Private
 */
exports.createGoal = async (req, res) => {
  try {
    const { name, targetAmount, monthlyContribution, deadline } = req.body;

    if (!name || !targetAmount) {
      return res.status(400).json({ error: 'Name and target amount are required' });
    }

    const user = await User.findById(req.user._id);

    user.savingsGoals.push({
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      monthlyContribution: parseFloat(monthlyContribution) || 0,
      deadline: deadline ? new Date(deadline) : null
    });

    await user.save();

    res.status(201).json({
      success: true,
      goal: user.savingsGoals[user.savingsGoals.length - 1]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Update savings goal
 * @route   PUT /api/savings/goals/:goalId
 * @access  Private
 */
exports.updateGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const updates = req.body;

    const user = await User.findById(req.user._id);
    const goal = user.savingsGoals.id(goalId);

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && updates[key] !== undefined) {
        goal[key] = updates[key];
      }
    });

    // Check if goal is completed
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }

    await user.save();

    res.json({
      success: true,
      goal
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Delete savings goal
 * @route   DELETE /api/savings/goals/:goalId
 * @access  Private
 */
exports.deleteGoal = async (req, res) => {
  try {
    const { goalId } = req.params;

    const user = await User.findById(req.user._id);
    const goal = user.savingsGoals.id(goalId);

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    goal.remove();
    await user.save();

    res.json({
      success: true,
      message: 'Goal deleted'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Add money to savings goal
 * @route   POST /api/savings/goals/:goalId/add
 * @access  Private
 */
exports.addToGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const user = await User.findById(req.user._id);
    await user.addSavings(goalId, parseFloat(amount));

    const goal = user.savingsGoals.id(goalId);

    res.json({
      success: true,
      message: 'Savings added successfully',
      goal
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Withdraw from savings goal
 * @route   POST /api/savings/goals/:goalId/withdraw
 * @access  Private
 */
exports.withdrawFromGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const user = await User.findById(req.user._id);
    await user.withdrawSavings(goalId, parseFloat(amount));

    const goal = user.savingsGoals.id(goalId);

    res.json({
      success: true,
      message: 'Withdrawal successful',
      goal
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Get savings analytics
 * @route   GET /api/savings/analytics
 * @access  Private
 */
exports.getAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const goals = user.savingsGoals || [];

    const analytics = {
      totalGoals: goals.length,
      activeGoals: goals.filter(g => !g.isCompleted).length,
      completedGoals: goals.filter(g => g.isCompleted).length,
      totalSaved: user.totalSavings,
      totalTarget: user.totalSavingsTarget,
      overallProgress: user.savingsProgress,
      monthlyContributions: goals.reduce((sum, g) => sum + (g.monthlyContribution || 0), 0),
      goalsNearCompletion: goals
        .filter(g => !g.isCompleted && (g.currentAmount / g.targetAmount) >= 0.8)
        .length
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};