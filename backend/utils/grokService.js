const axios = require('axios');

/**
 * Groq API Service for AI Financial Assistant
 * Uses Groq's ultra-fast inference for intelligent financial advice
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

/**
 * Chat with Groq AI (using Llama 3.3 70B)
 * @param {string} userMessage - User's question
 * @param {object} financialContext - User's financial data
 * @returns {Promise<string>} - AI response
 */
exports.chatWithGrok = async (userMessage, financialContext = {}) => {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API key not configured');
    }

    // Build system prompt with financial context
    const systemPrompt = buildSystemPrompt(financialContext);

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile', // ✅ Fast and powerful!
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    
    // Fallback response if API fails
    return getFallbackResponse(userMessage, financialContext);
  }
};

/**
 * Build system prompt with user's financial context
 */
function buildSystemPrompt(context) {
  const {
    totalSpent = 0,
    budget = 0,
    remaining = 0,
    expenseCount = 0,
    categories = {},
    averageDaily = 0
  } = context;

  return `You are a friendly AI financial advisor specifically for students and young professionals. 
Your role is to provide practical, actionable financial advice based on the user's spending data.

CURRENT FINANCIAL SITUATION:
- Total Spent This Month: ₹${totalSpent}
- Monthly Budget: ₹${budget}
- Remaining Budget: ₹${remaining}
- Number of Transactions: ${expenseCount}
- Average Daily Spending: ₹${averageDaily.toFixed(2)}
- Spending by Category: ${JSON.stringify(categories)}

GUIDELINES:
1. Be concise and friendly - keep responses under 150 words
2. Use emojis sparingly to make responses engaging (1-2 max)
3. Provide specific, actionable advice based on their actual data
4. If they're overspending, suggest practical ways to cut costs
5. Encourage good financial habits
6. Use Indian Rupee (₹) in all financial references
7. Be supportive and non-judgmental
8. Focus on student-friendly advice (cooking at home, student discounts, etc.)
9. Always reference their actual numbers when giving advice

IMPORTANT: 
- Base your advice on the ACTUAL DATA provided
- If their spending is high, address it directly with solutions
- Never give generic advice - always use their specific numbers
- Be helpful, not preachy`;
}

/**
 * Fallback responses when API fails
 */
function getFallbackResponse(message, context) {
  const lowerMessage = message.toLowerCase();

  // Analyze spending pattern
  if (lowerMessage.includes('analyz') || lowerMessage.includes('spending')) {
    const { totalSpent = 0, budget = 0, categories = {} } = context;
    const percentage = budget > 0 ? ((totalSpent / budget) * 100).toFixed(0) : 0;
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

    return `📊 **Spending Analysis**

You've spent ₹${totalSpent} out of ₹${budget} (${percentage}% of budget).

${topCategory ? `Your highest spending is in **${topCategory[0]}** (₹${topCategory[1]}).` : ''}

${percentage > 80 ? '⚠️ You\'re close to your budget limit. Consider reducing non-essential expenses.' : '✅ You\'re on track with your budget!'}

Would you like specific tips to optimize your spending?`;
  }

  // Budget advice
  if (lowerMessage.includes('budget') || lowerMessage.includes('advice')) {
    const { remaining = 0, averageDaily = 0 } = context;
    const daysLeft = 30 - new Date().getDate();
    const recommendedDaily = daysLeft > 0 ? (remaining / daysLeft).toFixed(0) : 0;

    return `💰 **Budget Advice**

You have ₹${remaining} remaining for ${daysLeft} days.
Recommended daily limit: ₹${recommendedDaily}

Quick Tips:
• Cook meals at home - saves ₹3000+/month
• Use student discounts everywhere
• Track every rupee spent
• Set aside savings first, then spend

Need help with a specific category?`;
  }

  // Savings tips
  if (lowerMessage.includes('sav') || lowerMessage.includes('tips')) {
    return `💡 **Smart Saving Tips**

1. **50-30-20 Rule**: 50% needs, 30% wants, 20% savings
2. **Cook at Home**: Save ₹3000-5000/month easily
3. **Student Discounts**: Always ask - many places offer them
4. **Small Expenses**: They add up! Track everything
5. **Automate Savings**: Move money on payday

Even ₹500/month becomes ₹6000/year! 🎯

What specific area would you like to save on?`;
  }

  // Default response
  return `Hi! I'm your AI financial assistant 😊

I can help you with:
• Analyzing your spending patterns
• Budget optimization tips
• Ways to save more money
• Category-specific advice

What would you like to know about your finances?`;
}

/**
 * Generate spending insights
 */
exports.generateInsights = (expenses, budget) => {
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const insights = [];
  const percentage = budget > 0 ? (totalSpent / budget) * 100 : 0;

  // Budget status
  if (percentage >= 100) {
    insights.push('🚨 Budget exceeded! Time to review your spending.');
  } else if (percentage >= 90) {
    insights.push('⚠️ You\'ve used 90% of your budget. Be careful!');
  } else if (percentage >= 70) {
    insights.push('📊 You\'re at 70% budget usage. Monitor closely.');
  } else {
    insights.push('✅ Great! You\'re managing your budget well.');
  }

  // Top spending category
  const topCategory = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (topCategory) {
    const catPercentage = ((topCategory[1] / totalSpent) * 100).toFixed(0);
    insights.push(`${getCategoryEmoji(topCategory[0])} ${topCategory[0]} is your top expense (${catPercentage}%)`);
  }

  // Spending trend
  const avgDaily = expenses.length > 0 ? totalSpent / 30 : 0;
  insights.push(`📈 Average daily spending: ₹${avgDaily.toFixed(0)}`);

  return insights;
};

/**
 * Get emoji for category
 */
function getCategoryEmoji(category) {
  const emojis = {
    food: '🍕',
    travel: '🚗',
    education: '📚',
    entertainment: '🎬',
    utilities: '💡',
    shopping: '🛍️',
    health: '💊',
    others: '📌'
  };
  return emojis[category] || '📌';
}

module.exports = exports;