/**
 * AI-Powered Expense Categorization
 * Uses keyword matching + context analysis
 * Ready for ML model integration
 */
exports.categorizeExpenseAI = (description, amount) => {
  const desc = description.toLowerCase();
  
  const categoryRules = {
    food: {
      keywords: ['food', 'restaurant', 'lunch', 'dinner', 'breakfast', 'cafe', 
                'coffee', 'snack', 'meal', 'pizza', 'burger', 'zomato', 'swiggy'],
      weight: 1.0
    },
    travel: {
      keywords: ['uber', 'ola', 'taxi', 'bus', 'train', 'metro', 'fuel', 
                'petrol', 'travel', 'transport', 'flight', 'ticket'],
      weight: 1.0
    },
    education: {
      keywords: ['book', 'course', 'tuition', 'fee', 'exam', 'study', 
                'notebook', 'stationery', 'college', 'university', 'library'],
      weight: 0.9
    },
    entertainment: {
      keywords: ['movie', 'game', 'netflix', 'spotify', 'concert', 'party', 
                'club', 'music', 'cinema', 'theatre'],
      weight: 0.8
    },
    utilities: {
      keywords: ['electricity', 'water', 'internet', 'phone', 'mobile', 
                'recharge', 'bill', 'rent', 'wifi'],
      weight: 0.9
    },
    shopping: {
      keywords: ['amazon', 'flipkart', 'clothes', 'shopping', 'mall', 
                'purchase', 'myntra', 'shoes', 'accessories'],
      weight: 0.7
    },
    health: {
      keywords: ['medicine', 'doctor', 'hospital', 'pharmacy', 'medical', 
                'health', 'clinic', 'appointment', 'lab'],
      weight: 0.9
    }
  };

  let bestMatch = { category: 'others', score: 0, confidence: 0.5 };

  for (const [category, rules] of Object.entries(categoryRules)) {
    let score = 0;
    let matchCount = 0;

    for (const keyword of rules.keywords) {
      if (desc.includes(keyword)) {
        matchCount++;
        score += rules.weight;
      }
    }

    if (matchCount > 0) {
      const confidence = Math.min((score / rules.keywords.length) + 0.5, 0.95);
      if (score > bestMatch.score) {
        bestMatch = { category, score, confidence };
      }
    }
  }

  return {
    category: bestMatch.category,
    confidence: bestMatch.confidence,
    aiGenerated: true
  };
};

/**
 * Predict Budget Overspending
 * Analyzes spending patterns and predicts risk
 */
exports.predictBudgetRisk = (expenses, budget, daysInMonth = 30) => {
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const daysElapsed = new Date().getDate();
  const dailyAverage = totalSpent / daysElapsed;
  const projectedSpending = dailyAverage * daysInMonth;
  
  const percentage = (totalSpent / budget) * 100;
  const projectedPercentage = (projectedSpending / budget) * 100;

  let riskLevel = 'low';
  let message = 'Budget on track';

  if (percentage >= 100) {
    riskLevel = 'critical';
    message = 'Budget exceeded!';
  } else if (projectedPercentage >= 100) {
    riskLevel = 'high';
    message = 'Likely to exceed budget';
  } else if (percentage >= 70) {
    riskLevel = 'medium';
    message = 'Monitor spending carefully';
  }

  return {
    riskLevel,
    message,
    currentPercentage: percentage,
    projectedPercentage,
    projectedSpending,
    remainingBudget: budget - totalSpent
  };
};

/**
 * Generate AI Insights
 * Provides personalized spending recommendations
 */
exports.generateInsights = (expenses, budget) => {
  const insights = [];
  
  // Category analysis
  const categoryTotals = {};
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1]);

  if (sortedCategories.length > 0) {
    const [topCategory, topAmount] = sortedCategories[0];
    const percentage = ((topAmount / budget) * 100).toFixed(1);
    insights.push({
      type: 'spending_pattern',
      message: `Your highest spending is in ${topCategory} (${percentage}% of budget)`,
      category: topCategory,
      amount: topAmount
    });
  }

  // Savings tip
  if (categoryTotals.food > budget * 0.3) {
    insights.push({
      type: 'savings_tip',
      message: 'Consider cooking at home more often to reduce food expenses',
      potentialSavings: Math.round(categoryTotals.food * 0.3)
    });
  }

  // Spending trend
  const avgDaily = expenses.reduce((sum, exp) => sum + exp.amount, 0) / 30;
  insights.push({
    type: 'trend',
    message: `Average daily spending: ₹${avgDaily.toFixed(2)}`,
    value: avgDaily
  });

  return insights;
};
