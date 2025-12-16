const Tesseract = require('tesseract.js');
const { extractExpenseFromText } = require('./aiTextParser');

/**
 * Enhanced OCR Service
 * Handles: Receipts, SMS screenshots, Transaction screenshots
 * Uses: Tesseract.js (free OCR) + AI text parsing
 */

/**
 * Process any image (receipt, SMS, transaction screenshot)
 */
exports.processImageOCR = async (imageBuffer) => {
  try {
    console.log('🔍 Starting OCR processing...');
    
    // Run Tesseract OCR
    const { data: { text, confidence } } = await Tesseract.recognize(
      imageBuffer,
      'eng',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    console.log('✅ OCR completed');
    console.log('📄 Extracted text:', text);
    console.log('🎯 Confidence:', confidence);

    if (!text || text.trim().length < 10) {
      throw new Error('No readable text found in image. Please ensure good lighting and clear image.');
    }

    // Parse extracted text to identify expense details
    const expenseData = await extractExpenseFromText(text);

    return {
      success: true,
      rawText: text,
      confidence: confidence / 100, // Normalize to 0-1
      expenseData,
      type: detectImageType(text)
    };

  } catch (error) {
    console.error('❌ OCR Error:', error);
    throw new Error(`OCR failed: ${error.message}`);
  }
};

/**
 * Detect image type based on content
 */
function detectImageType(text) {
  const lower = text.toLowerCase();
  
  // SMS/Transaction patterns
  if (
    lower.includes('debited') || 
    lower.includes('credited') ||
    lower.includes('upi') ||
    lower.includes('bank') ||
    lower.includes('a/c') ||
    lower.includes('txn')
  ) {
    return 'sms_transaction';
  }
  
  // Receipt patterns
  if (
    lower.includes('receipt') ||
    lower.includes('invoice') ||
    lower.includes('bill') ||
    lower.includes('total') ||
    lower.includes('subtotal') ||
    lower.includes('tax')
  ) {
    return 'receipt';
  }
  
  return 'generic';
}

/**
 * Process receipt specifically (optimized for bill structure)
 */
exports.processReceipt = async (imageBuffer) => {
  const result = await exports.processImageOCR(imageBuffer);
  
  // Additional receipt-specific processing
  if (result.type === 'receipt') {
    const lines = result.rawText.split('\n').filter(Boolean);
    
    // Try to extract merchant name (usually first few lines)
    result.expenseData.merchantName = result.expenseData.merchantName || 
      lines.slice(0, 3).find(line => 
        line.length > 3 && 
        line.length < 50 && 
        !/\d/.test(line)
      ) || 
      'Unknown Merchant';
  }
  
  return result;
};

/**
 * Process SMS/Transaction screenshot
 */
exports.processTransactionSMS = async (imageBuffer) => {
  const result = await exports.processImageOCR(imageBuffer);
  
  // SMS-specific enhancements
  if (result.type === 'sms_transaction') {
    const text = result.rawText.toLowerCase();
    
    // Extract transaction type
    if (text.includes('debited') || text.includes('debit')) {
      result.expenseData.transactionType = 'debit';
    } else if (text.includes('credited') || text.includes('credit')) {
      result.expenseData.transactionType = 'credit';
    }
    
    // Extract bank/service
    const bankPatterns = [
      /hdfc/i, /icici/i, /sbi/i, /axis/i, /kotak/i,
      /paytm/i, /phonepe/i, /gpay/i, /googlepay/i
    ];
    
    for (const pattern of bankPatterns) {
      const match = result.rawText.match(pattern);
      if (match) {
        result.expenseData.paymentMethod = match[0].toLowerCase();
        break;
      }
    }
    
    // Extract UPI ID if present
    const upiMatch = result.rawText.match(/[\w\.\-]+@[\w]+/);
    if (upiMatch) {
      result.expenseData.upiId = upiMatch[0];
    }
  }
  
  return result;
};

/**
 * Validate and clean extracted data
 */
exports.validateExpenseData = (expenseData) => {
  // Ensure amount is valid
  if (!expenseData.amount || expenseData.amount <= 0) {
    throw new Error('Invalid or missing amount');
  }
  
  // Ensure category
  const validCategories = ['food', 'travel', 'education', 'entertainment', 'utilities', 'shopping', 'health', 'others'];
  if (!validCategories.includes(expenseData.category)) {
    expenseData.category = 'others';
  }
  
  // Ensure date is valid
  if (!expenseData.date || isNaN(new Date(expenseData.date))) {
    expenseData.date = new Date().toISOString().split('T')[0];
  }
  
  // Clean description
  if (!expenseData.description || expenseData.description.trim().length === 0) {
    expenseData.description = `Expense of ₹${expenseData.amount}`;
  }
  
  return expenseData;
};

module.exports = exports;