const User = require('../models/User');
const Expense = require('../models/Expense');
const { sendBudgetAlert, sendMonthlyReport } = require('./emailService');

// ✅ Mutex lock to prevent duplicate alerts
const alertLocks = new Map();

// ===============================
// Check Budget and Send Alerts
// ===============================
exports.checkBudgetAndAlert = async (userId) => {
  // ✅ Prevent duplicate concurrent calls
  if (alertLocks.has(userId)) {
    return alertLocks.get(userId);
  }

  const promise = (async () => {
    try {
      const user = await User.findById(userId);
      if (!user || !user.preferences.emailAlerts) {
        return null;
      }

      // Get current month expenses
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

      const expenses = await Expense.find({
        userId,
        date: { $gte: startOfMonth, $lte: endOfMonth }
      });

      const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      // FIXED: Default budget if not set, prevent division by zero
      const budget = user.monthlyBudget || 5000;
      const percentage = (totalSpent / budget) * 100;

      // Determine alert level
      let alertLevel = null;
      let alertKey = null;

      if (percentage >= 100 && user.preferences.budgetAlerts.at100 && !user.alertsSent.get('100')) {
        alertLevel = 'critical';
        alertKey = '100';
      } else if (percentage >= 90 && user.preferences.budgetAlerts.at90 && !user.alertsSent.get('90')) {
        alertLevel = 'danger';
        alertKey = '90';
      } else if (percentage >= 70 && user.preferences.budgetAlerts.at70 && !user.alertsSent.get('70')) {
        alertLevel = 'warning';
        alertKey = '70';
      }

      // Send alert if threshold crossed
      if (alertLevel && alertKey) {
        await sendBudgetAlert(user.email, user.name, {
          percentage: Math.round(percentage),
          budgetUsed: totalSpent,
          totalBudget: budget, // FIXED: Use local budget variable
          level: alertLevel
        });

        // Mark alert as sent
        user.alertsSent.set(alertKey, true);
        await user.save();

        console.log(`✅ Budget alert sent to ${user.email} at ${percentage}%`);
      }

      return {
        percentage,
        totalSpent,
        budget,
        alertSent: !!alertLevel
      };
    } catch (error) {
      console.error('❌ Error checking budget alerts:', error);
      return null;
    } finally {
      // ✅ Release lock
      alertLocks.delete(userId);
    }
  })();

  alertLocks.set(userId, promise);
  return promise;
};

// ===============================
// Weekly Budget Check
// ===============================
exports.checkWeeklyBudget = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.weeklyBudget) return null;

    // Get current week expenses
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);

    const expenses = await Expense.find({
      userId,
      date: { $gte: startOfWeek }
    });

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const percentage = (totalSpent / user.weeklyBudget) * 100;

    return {
      percentage,
      totalSpent,
      weeklyBudget: user.weeklyBudget,
      remaining: user.weeklyBudget - totalSpent
    };
  } catch (error) {
    console.error('❌ Error checking weekly budget:', error);
    return null;
  }
};

// ===============================
// Predict Budget Overspending
// ===============================
exports.predictBudgetOverspend = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysElapsed = now.getDate();
    const daysRemaining = daysInMonth - daysElapsed;

    const expenses = await Expense.find({
      userId,
      date: { $gte: startOfMonth }
    });

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // FIXED: Prevent division by zero on day 1
    const dailyAverage = daysElapsed > 0 ? totalSpent / daysElapsed : totalSpent;
    const projectedSpending = dailyAverage * daysInMonth;
    const projectedOverspend = projectedSpending - user.monthlyBudget;

    let riskLevel = 'low';
    let message = 'You\'re on track to stay within budget';
    let recommendations = [];

    if (projectedOverspend > 0) {
      const percentageOver = (projectedOverspend / user.monthlyBudget) * 100;
      
      if (percentageOver > 20) {
        riskLevel = 'high';
        message = `You're projected to exceed budget by ₹${Math.round(projectedOverspend)}`;
        recommendations.push('Consider reducing daily spending immediately');
        recommendations.push('Review and cut non-essential expenses');
      } else if (percentageOver > 10) {
        riskLevel = 'medium';
        message = `You're on track to slightly exceed budget by ₹${Math.round(projectedOverspend)}`;
        recommendations.push('Monitor spending closely for the rest of the month');
        recommendations.push('Try to stay under ₹' + Math.round(dailyAverage * 0.8) + ' per day');
      } else {
        riskLevel = 'low';
        message = 'You might slightly exceed budget, but it\'s manageable';
        recommendations.push('Be mindful of spending in the coming days');
      }
    } else {
      const savingsPotential = Math.abs(projectedOverspend);
      message = `Great! You could save ₹${Math.round(savingsPotential)} this month`;
      recommendations.push('Keep up the good spending habits');
      recommendations.push('Consider setting aside savings');
    }

    return {
      riskLevel,
      message,
      currentSpent: totalSpent,
      dailyAverage: Math.round(dailyAverage),
      projectedSpending: Math.round(projectedSpending),
      projectedOverspend: Math.round(projectedOverspend),
      daysRemaining,
      // FIXED: Prevent division by zero on last day of month
      recommendedDailyLimit: daysRemaining > 0 ? Math.round((user.monthlyBudget - totalSpent) / daysRemaining) : 0,
      recommendations
    };
  } catch (error) {
    console.error('❌ Error predicting budget overspend:', error);
    return null;
  }
};

// ===============================
// Send Monthly Report
// ===============================
exports.sendMonthlyReportToUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.preferences.emailAlerts) return;

    // Get last month's data
    const now = new Date();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const expenses = await Expense.find({
      userId,
      date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Category breakdown
    const categoryTotals = {};
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const topCategories = Object.entries(categoryTotals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Generate insights
    const insights = [];
    if (totalSpent > user.monthlyBudget) {
      insights.push(`You exceeded your budget by ₹${totalSpent - user.monthlyBudget}`);
    } else {
      insights.push(`You saved ₹${user.monthlyBudget - totalSpent} this month`);
    }

    if (topCategories.length > 0) {
      insights.push(`Your highest spending was in ${topCategories[0].name} (₹${topCategories[0].amount})`);
    }

    // Send email
    await sendMonthlyReport(user.email, user.name, {
      totalSpent,
      budget: user.monthlyBudget,
      topCategories,
      insights
    });

    // Update last report sent date
    user.lastReportSent = new Date();
    await user.save();

    console.log(`✅ Monthly report sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Error sending monthly report:', error);
  }
};

// ===============================
// Reset Monthly Alerts (Call at start of month)
// ===============================
exports.resetAllMonthlyAlerts = async () => {
  try {
    const users = await User.find({ 'preferences.emailAlerts': true });
    
    let count = 0;
    for (const user of users) {
      user.alertsSent = new Map();
      await user.save();
      count++;
    }
    
    console.log(`✅ Reset alerts for ${count} users`);
  } catch (error) {
    console.error('❌ Error resetting monthly alerts:', error);
  }
};

// ===============================
// Send Reports to All Users (Scheduled task)
// ===============================
exports.sendMonthlyReportsToAll = async () => {
  try {
    const users = await User.find({ 'preferences.emailAlerts': true });
    
    let sent = 0;
    for (const user of users) {
      await exports.sendMonthlyReportToUser(user._id);
      // Add delay to avoid overwhelming email service
      await new Promise(resolve => setTimeout(resolve, 1000));
      sent++;
    }
    
    console.log(`✅ Sent monthly reports to ${sent} users`);
  } catch (error) {
    console.error('❌ Error sending monthly reports:', error);
  }
};