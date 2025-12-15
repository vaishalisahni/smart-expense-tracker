const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getInsights,
  getChatHistory,
  clearChatHistory
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Chat routes
router.post('/message', sendMessage);
router.get('/insights', getInsights);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);

module.exports = router;