export const aiCategorizeExpense = (description, amount) => {
  const desc = description.toLowerCase();
  
  const categories = {
    food: ['food', 'restaurant', 'lunch', 'dinner', 'breakfast', 'cafe', 'coffee', 'snack', 'meal', 'pizza', 'burger'],
    travel: ['uber', 'ola', 'taxi', 'bus', 'train', 'metro', 'fuel', 'petrol', 'travel', 'transport'],
    education: ['book', 'course', 'tuition', 'fee', 'exam', 'study', 'notebook', 'stationery', 'college'],
    entertainment: ['movie', 'game', 'netflix', 'spotify', 'concert', 'party', 'club', 'music'],
    utilities: ['electricity', 'water', 'internet', 'phone', 'mobile', 'recharge', 'bill'],
    shopping: ['amazon', 'flipkart', 'clothes', 'shopping', 'mall', 'purchase'],
    health: ['medicine', 'doctor', 'hospital', 'pharmacy', 'medical', 'health']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => desc.includes(keyword))) {
      return { category, confidence: 0.85, aiGenerated: true };
    }
  }
  
  return { category: 'others', confidence: 0.5, aiGenerated: true };
};

// AI Budget Prediction
export const predictBudgetRisk = (expenses, budget) => {
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const percentage = (totalSpent / budget) * 100;
  
  if (percentage >= 100) return { level: 'critical', message: 'Budget exceeded!', color: 'red' };
  if (percentage >= 90) return { level: 'danger', message: 'Budget almost exhausted', color: 'orange' };
  if (percentage >= 70) return { level: 'warning', message: 'Spending high this month', color: 'yellow' };
  return { level: 'safe', message: 'Budget on track', color: 'green' };
};
// AI Spending Insights Generator
export const generateAIInsights = (expenses) => {
  const categoryTotals = {};
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });
  
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0];
  
  const insights = [];
  if (topCategory) {
    insights.push(`Your highest spending is in ${topCategory[0]} (₹${topCategory[1]})`);
  }
  
  const avgDaily = expenses.reduce((sum, exp) => sum + exp.amount, 0) / 30;
  insights.push(`Average daily spending: ₹${avgDaily.toFixed(2)}`);
  
  if (categoryTotals['food'] > categoryTotals['education']) {
    insights.push('💡 Tip: Consider cooking at home to reduce food expenses');
  }
  
  return insights;
};
