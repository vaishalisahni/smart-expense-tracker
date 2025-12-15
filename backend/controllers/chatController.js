const { chatWithGrok, generateInsights } = require('../utils/grokService');
const Expense = require('../models/Expense');
const User = require('../models/User');

/**
 * @desc    Send message to AI chatbot
 * @route   POST /api/chat/message
 * @access  Private
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get AI response from Grok
    const aiResponse = await chatWithGrok(message, context);

    // Save chat history to user (optional)
    const user = await User.findById(req.user._id);
    if (user) {
      if (!user.chatHistory) {
        user.chatHistory = [];
      }
      
      user.chatHistory.push({
        message: message,
        response: aiResponse,
        timestamp: new Date()
      });

      // Keep only last 50 messages
      if (user.chatHistory.length > 50) {
        user.chatHistory = user.chatHistory.slice(-50);
      }

      await user.save();
    }

    res.json({
      success: true,
      response: aiResponse
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Get AI-generated spending insights
 * @route   GET /api/chat/insights
 * @access  Private
 */
exports.getInsights = async (req, res) => {
  try {
    // Get current month expenses
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: startOfMonth }
    });

    const insights = generateInsights(expenses, req.user.monthlyBudget || 5000);

    res.json({
      success: true,
      insights
    });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Get chat history
 * @route   GET /api/chat/history
 * @access  Private
 */
exports.getChatHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('chatHistory');
    
    res.json({
      success: true,
      history: user.chatHistory || []
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Clear chat history
 * @route   DELETE /api/chat/history
 * @access  Private
 */
exports.clearChatHistory = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      chatHistory: []
    });

    res.json({
      success: true,
      message: 'Chat history cleared'
    });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ error: error.message });
  }
};