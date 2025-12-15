/**
 * Voice and OCR Service with Real Implementations
 * 
 * VOICE: Uses Web Speech API (handled on frontend)
 * OCR: Uses Tesseract.js (handled on frontend) 
 * 
 * Backend only validates and processes the extracted data
 */

// ===============================
// Voice Input Processing
// ===============================
exports.processVoiceInput = async (transcript) => {
  try {
    if (!transcript || !transcript.trim()) {
      throw new Error('Transcript is empty');
    }

    // Parse the transcript to extract expense details
    const expenseData = parseVoiceTranscript(transcript);
    
    if (!expenseData.amount) {
      throw new Error('Could not extract amount from voice input');
    }

    return {
      success: true,
      transcript: transcript,
      expenseData,
      confidence: 0.85
    };
  } catch (error) {
    console.error('Voice processing error:', error);
    throw new Error('Failed to process voice input: ' + error.message);
  }
};

/**
 * Parse voice transcript to extract expense information
 * Handles various natural language patterns
 */
const parseVoiceTranscript = (transcript) => {
  const text = transcript.toLowerCase();
  
  // Extract amount - handles multiple formats
  let amount = null;
  
  // Pattern 1: "150 rupees", "50 rs", "100 inr"
  const amountPattern1 = text.match(/(\d+(?:\.\d{2})?)\s*(?:rupees|rupee|rs|inr|₹)/i);
  
  // Pattern 2: "rupees 150", "rs 50"
  const amountPattern2 = text.match(/(?:rupees|rupee|rs|inr|₹)\s*(\d+(?:\.\d{2})?)/i);
  
  // Pattern 3: Just numbers if no pattern found
  const amountPattern3 = text.match(/(\d+(?:\.\d{2})?)/);
  
  if (amountPattern1) {
    amount = parseFloat(amountPattern1[1]);
  } else if (amountPattern2) {
    amount = parseFloat(amountPattern2[1]);
  } else if (amountPattern3) {
    amount = parseFloat(amountPattern3[1]);
  }
  
  // Extract description
  let description = text;
  
  // Try to extract what comes after "on", "for", "at"
  const descMatch = text.match(/(?:on|for|at|paid|spent|bought)\s+(.+?)(?:\s+(?:for|at|in|from|worth)\s+\d+|\s*$)/i);
  if (descMatch) {
    description = descMatch[1].trim();
  } else {
    // Remove amount and currency from description
    description = text
      .replace(/\d+(?:\.\d{2})?\s*(?:rupees|rupee|rs|inr|₹)/gi, '')
      .replace(/(?:spent|paid|bought)/gi, '')
      .trim();
  }
  
  // Capitalize first letter
  description = description.charAt(0).toUpperCase() + description.slice(1);
  
  // Auto-categorize based on keywords
  const category = detectCategory(text);
  
  // Extract date if mentioned (e.g., "yesterday", "today", "last week")
  const date = extractDate(text);
  
  return {
    amount,
    description,
    category,
    date: date.toISOString().split('T')[0]
  };
};

/**
 * Detect category from text
 */
const detectCategory = (text) => {
  const categoryKeywords = {
    food: [
      'lunch', 'dinner', 'breakfast', 'food', 'meal', 'restaurant', 
      'cafe', 'coffee', 'snack', 'pizza', 'burger', 'eat', 'ate',
      'zomato', 'swiggy', 'foodpanda', 'dominos', 'mcdonald', 'kfc'
    ],
    travel: [
      'uber', 'ola', 'taxi', 'cab', 'bus', 'train', 'metro', 
      'fuel', 'petrol', 'diesel', 'travel', 'transport', 'ride',
      'auto', 'rickshaw', 'flight', 'ticket'
    ],
    education: [
      'book', 'books', 'course', 'tuition', 'fee', 'fees', 'exam', 
      'study', 'notebook', 'pen', 'pencil', 'stationery', 
      'college', 'university', 'library', 'class'
    ],
    entertainment: [
      'movie', 'movies', 'cinema', 'game', 'games', 'netflix', 
      'spotify', 'prime', 'concert', 'party', 'club', 'music',
      'theatre', 'show'
    ],
    utilities: [
      'electricity', 'water', 'internet', 'wifi', 'phone', 
      'mobile', 'recharge', 'bill', 'bills', 'rent', 'broadband'
    ],
    shopping: [
      'amazon', 'flipkart', 'myntra', 'clothes', 'clothing', 
      'shopping', 'mall', 'purchase', 'bought', 'shoes', 
      'shirt', 'accessories', 'dress'
    ],
    health: [
      'medicine', 'medicines', 'doctor', 'hospital', 'pharmacy', 
      'medical', 'health', 'clinic', 'appointment', 'lab', 
      'test', 'checkup', 'pills'
    ]
  };
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }
  
  return 'others';
};

/**
 * Extract date from natural language
 */
const extractDate = (text) => {
  const today = new Date();
  
  if (text.includes('yesterday')) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  }
  
  if (text.includes('last week')) {
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    return lastWeek;
  }
  
  // Default to today
  return today;
};

// ===============================
// OCR Receipt Processing
// ===============================
exports.processReceiptText = (ocrText) => {
  try {
    if (!ocrText || !ocrText.trim()) {
      throw new Error('OCR text is empty');
    }

    const lines = ocrText.split('\n').map(line => line.trim()).filter(Boolean);
    
    // Extract data
    const receiptData = {
      amount: extractAmount(ocrText),
      merchantName: extractMerchantName(lines),
      date: extractDateFromReceipt(ocrText),
      category: 'others',
      description: ''
    };

    // Auto-detect category from merchant name or text
    receiptData.category = detectCategory(ocrText.toLowerCase());
    
    // Generate description
    receiptData.description = receiptData.merchantName 
      ? `Purchase at ${receiptData.merchantName}`
      : 'Receipt scan';

    return {
      success: true,
      receiptData,
      confidence: 0.75,
      rawText: ocrText
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to process receipt: ' + error.message);
  }
};

/**
 * Extract amount from receipt text
 */
const extractAmount = (text) => {
  // Look for total amount (most common patterns)
  const patterns = [
    /total[:\s]*(?:rs\.?|₹)?\s*(\d+(?:\.\d{2})?)/i,
    /grand\s*total[:\s]*(?:rs\.?|₹)?\s*(\d+(?:\.\d{2})?)/i,
    /amount[:\s]*(?:rs\.?|₹)?\s*(\d+(?:\.\d{2})?)/i,
    /net\s*amount[:\s]*(?:rs\.?|₹)?\s*(\d+(?:\.\d{2})?)/i,
    /(?:rs\.?|₹)\s*(\d+(?:\.\d{2})?)\s*(?:total|grand|amount)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1]);
    }
  }

  // If no "total" found, look for largest number (likely the total)
  const numbers = text.match(/\d+(?:\.\d{2})?/g);
  if (numbers && numbers.length > 0) {
    const amounts = numbers.map(n => parseFloat(n));
    return Math.max(...amounts);
  }

  return null;
};

/**
 * Extract merchant name from receipt
 */
const extractMerchantName = (lines) => {
  if (lines.length === 0) return 'Unknown';
  
  // Usually the merchant name is in the first few lines
  // Skip common receipt keywords
  const skipKeywords = ['receipt', 'invoice', 'bill', 'tax', 'gst', 'date', 'time', 'total'];
  
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].toLowerCase();
    const isNotKeyword = !skipKeywords.some(keyword => line.includes(keyword));
    const hasLetters = /[a-z]/i.test(line);
    
    if (isNotKeyword && hasLetters && line.length >= 3) {
      return lines[i].substring(0, 50); // Limit to 50 chars
    }
  }
  
  return lines[0] ? lines[0].substring(0, 50) : 'Unknown Merchant';
};

/**
 * Extract date from receipt
 */
const extractDateFromReceipt = (text) => {
  // Common date patterns on receipts
  const patterns = [
    /date[:\s]*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i,
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let [, day, month, year] = match;
      
      // Handle 2-digit years
      if (year.length === 2) {
        year = '20' + year;
      }
      
      return new Date(`${year}-${month}-${day}`).toISOString().split('T')[0];
    }
  }

  // Default to today
  return new Date().toISOString().split('T')[0];
};

// ===============================
// File Upload Handlers
// ===============================
exports.handleVoiceUpload = async (file) => {
  try {
    // Validate file
    const allowedTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/mpeg'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid audio file type. Only WebM, WAV, MP3, OGG allowed.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Audio file too large. Maximum size is 5MB.');
    }

    return {
      success: true,
      message: 'Voice file validated. Process on frontend with Web Speech API.'
    };
  } catch (error) {
    console.error('Voice upload error:', error);
    throw error;
  }
};

exports.handleReceiptUpload = async (file) => {
  try {
    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, WebP allowed.');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File too large. Maximum size is 10MB.');
    }

    return {
      success: true,
      message: 'Image file validated. Process on frontend with Tesseract.js.'
    };
  } catch (error) {
    console.error('Receipt upload error:', error);
    throw error;
  }
};

module.exports = exports;