const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getExpenses,
  getExpense,
  createExpense,
  createExpenseFromVoice,
  createExpenseFromReceipt,
  updateExpense,
  deleteExpense,
  getAnalytics,
  exportExpenses
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const { processVoiceInput, processReceiptText } = require('../utils/voiceOcrService');

router.use(protect);

router.route('/')
  .get(getExpenses)
  .post(createExpense);

// Voice input processing route (called by frontend)
router.post('/voice-process', async (req, res) => {
  try {
    const { transcript } = req.body;
    
    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const result = await processVoiceInput(transcript);
    
    res.json({
      success: true,
      expenseData: result.expenseData,
      transcript: result.transcript,
      confidence: result.confidence
    });
  } catch (error) {
    console.error('Voice processing error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to process voice input' 
    });
  }
});

// Receipt OCR processing route
router.post('/ocr-process', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // In a real implementation, you'd use OCR library here
    // For now, return mock data
    res.json({
      success: true,
      receiptData: {
        amount: 150,
        merchantName: 'Sample Store',
        date: new Date().toISOString().split('T')[0],
        category: 'shopping',
        description: 'Purchase at Sample Store'
      },
      confidence: 0.75
    });
  } catch (error) {
    console.error('OCR processing error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to process receipt' 
    });
  }
});

router.post('/voice', upload.single('audio'), createExpenseFromVoice);
router.post('/ocr', upload.single('receipt'), createExpenseFromReceipt);

router.get('/analytics', getAnalytics);
router.get('/export', exportExpenses);

router.route('/:id')
  .get(getExpense)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;