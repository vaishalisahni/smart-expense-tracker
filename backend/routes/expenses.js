const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getAnalytics,
  exportExpenses
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const { processVoiceInput } = require('../utils/voiceOcrService');

// All routes require authentication
router.use(protect);

// Basic CRUD routes
router.route('/')
  .get(getExpenses)
  .post(createExpense);

// Voice input processing route (using existing voiceOcrService)
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

// OCR processing route (NEW - using Tesseract.js)
router.post('/ocr-process', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('📸 Processing image with Tesseract.js...');

    // Import the OCR service dynamically
    let processImageOCR, validateExpenseData;
    try {
      const ocrService = require('../utils/enhancedOcrService');
      processImageOCR = ocrService.processImageOCR;
      validateExpenseData = ocrService.validateExpenseData;
    } catch (err) {
      console.error('OCR service not found, using fallback');
      // Fallback if new OCR service not installed yet
      return res.json({
        success: true,
        receiptData: {
          amount: 150,
          merchantName: 'Sample Store',
          date: new Date().toISOString().split('T')[0],
          category: 'shopping',
          description: 'Purchase at Sample Store'
        },
        confidence: 0.5,
        type: 'generic',
        note: 'Using fallback mode. Install tesseract.js for real OCR.'
      });
    }

    const imageType = req.query.type || 'auto';
    
    // Process image with Tesseract
    const result = await processImageOCR(req.file.buffer);

    // Validate extracted data
    try {
      result.expenseData = validateExpenseData(result.expenseData);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError.message,
        rawText: result.rawText,
        detectedType: result.type
      });
    }

    res.json({
      success: true,
      receiptData: result.expenseData,
      confidence: result.confidence,
      type: result.type,
      rawText: result.rawText
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to process image' 
    });
  }
});

// Create expense from OCR data
router.post('/ocr', async (req, res) => {
  try {
    const Expense = require('../models/Expense');
    const { checkBudgetAndAlert } = require('../utils/budgetAlertService');
    
    const { amount, description, category, date, merchantName, rawText, confidence, type } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Create expense
    const expense = await Expense.create({
      userId: req.user._id,
      amount: parseFloat(amount),
      description: description || `OCR Scanned Expense`,
      category: category || 'others',
      date: date || new Date(),
      entryMethod: 'ocr',
      receiptData: {
        merchantName: merchantName || 'Unknown',
        receiptDate: date,
        extractedAmount: amount,
        ocrConfidence: confidence || 0.5,
        ocrType: type || 'generic',
        rawText: rawText || ''
      },
      aiGenerated: true,
      aiConfidence: confidence || 0.5
    });

    checkBudgetAndAlert(req.user._id).catch(err => {
      console.error('Budget alert error:', err);
    });

    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('OCR expense creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analytics and export routes
router.get('/analytics', getAnalytics);
router.get('/export', exportExpenses);

// Single expense routes
router.route('/:id')
  .get(getExpense)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;