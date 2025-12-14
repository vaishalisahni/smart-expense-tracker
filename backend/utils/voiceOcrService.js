const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// ===============================
// Voice-to-Text Service
// ===============================
exports.processVoiceInput = async (audioBuffer) => {
  try {
    // Using Web Speech API or external service like Google Speech-to-Text
    // For demo purposes, this is a mock implementation
    
    // In production, integrate with:
    // - Google Cloud Speech-to-Text
    // - AWS Transcribe
    // - Azure Speech Services
    
    const mockTranscript = "Spent 150 rupees on lunch at cafeteria";
    
    // Parse the transcript to extract expense details
    const expenseData = parseVoiceTranscript(mockTranscript);
    
    return {
      success: true,
      transcript: mockTranscript,
      expenseData,
      confidence: 0.95
    };
  } catch (error) {
    console.error('Voice processing error:', error);
    throw new Error('Failed to process voice input');
  }
};

// Parse voice transcript to extract expense information
const parseVoiceTranscript = (transcript) => {
  const text = transcript.toLowerCase();
  
  // Extract amount (looks for numbers followed by rupees/rs)
  const amountMatch = text.match(/(\d+)\s*(rupees|rs|inr)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : null;
  
  // Extract description (everything after "on" or "for")
  const descMatch = text.match(/(?:on|for)\s+(.+?)(?:\s+at|\s+in|\s*$)/i);
  const description = descMatch ? descMatch[1].trim() : text;
  
  // Detect category keywords
  let category = 'others';
  const categoryKeywords = {
    food: ['lunch', 'dinner', 'breakfast', 'food', 'meal', 'restaurant', 'cafe'],
    travel: ['uber', 'ola', 'taxi', 'bus', 'metro', 'train', 'travel'],
    education: ['book', 'course', 'tuition', 'class', 'study'],
    entertainment: ['movie', 'game', 'concert', 'party'],
    utilities: ['bill', 'electricity', 'water', 'internet'],
    shopping: ['shopping', 'clothes', 'purchase'],
    health: ['medicine', 'doctor', 'hospital', 'pharmacy']
  };
  
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      category = cat;
      break;
    }
  }
  
  return {
    amount,
    description,
    category,
    date: new Date().toISOString().split('T')[0]
  };
};

// ===============================
// OCR Receipt Scanning Service
// ===============================
exports.processReceiptImage = async (imageBuffer, imagePath) => {
  try {
    // Using OCR service like:
    // - Google Cloud Vision API
    // - AWS Textract
    // - Azure Computer Vision
    // - Tesseract.js (open source)
    
    // For demo, this is a mock implementation
    const ocrData = await performOCR(imageBuffer);
    
    // Parse OCR text to extract receipt details
    const receiptData = parseReceiptText(ocrData.text);
    
    return {
      success: true,
      receiptData,
      confidence: ocrData.confidence,
      rawText: ocrData.text
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to process receipt image');
  }
};

// Mock OCR function (replace with actual OCR service)
const performOCR = async (imageBuffer) => {
  // In production, call actual OCR API here
  // Example with Google Cloud Vision:
  /*
  const vision = require('@google-cloud/vision');
  const client = new vision.ImageAnnotatorClient();
  const [result] = await client.textDetection(imageBuffer);
  const text = result.textAnnotations[0]?.description || '';
  */
  
  // Mock data for demonstration
  const mockText = `
    RESTAURANT RECEIPT
    Date: 15/12/2024
    Time: 14:30
    
    Items:
    Pizza Margherita    250.00
    Coca Cola           50.00
    French Fries        80.00
    
    Subtotal:          380.00
    Tax (5%):           19.00
    Total:             399.00
    
    Payment: Card
    Thank you!
  `;
  
  return {
    text: mockText,
    confidence: 0.92
  };
};

// Parse OCR text to extract receipt information
const parseReceiptText = (text) => {
  const lines = text.split('\n').map(line => line.trim());
  
  // Extract total amount (looks for "total" followed by amount)
  let amount = null;
  const totalMatch = text.match(/total[:\s]*(?:rs\.?|₹)?\s*(\d+(?:\.\d{2})?)/i);
  if (totalMatch) {
    amount = parseFloat(totalMatch[1]);
  }
  
  // Extract date
  let date = new Date();
  const dateMatch = text.match(/date[:\s]*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    date = new Date(`${year}-${month}-${day}`);
  }
  
  // Extract merchant name (usually first non-empty line)
  const merchantName = lines.find(line => 
    line.length > 0 && 
    !line.match(/receipt|date|time|total|subtotal|tax/i)
  ) || 'Unknown Merchant';
  
  // Detect category from merchant name or items
  let category = 'others';
  const textLower = text.toLowerCase();
  if (textLower.match(/restaurant|cafe|food|pizza|burger/)) category = 'food';
  else if (textLower.match(/uber|ola|taxi|transport/)) category = 'travel';
  else if (textLower.match(/pharmacy|medicine|hospital/)) category = 'health';
  else if (textLower.match(/mall|store|shop/)) category = 'shopping';
  
  return {
    amount,
    merchantName: merchantName.substring(0, 100),
    date: date.toISOString().split('T')[0],
    category,
    description: `Purchase at ${merchantName}`
  };
};

// ===============================
// Image Upload Handler
// ===============================
exports.handleReceiptUpload = async (file) => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG and PNG allowed.');
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File too large. Maximum size is 5MB.');
    }
    
    // Process the image with OCR
    const result = await exports.processReceiptImage(file.buffer, file.path);
    
    return result;
  } catch (error) {
    console.error('Receipt upload error:', error);
    throw error;
  }
};

// ===============================
// Voice Audio Handler
// ===============================
exports.handleVoiceUpload = async (file) => {
  try {
    // Validate file type
    const allowedTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid audio file type.');
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Audio file too large. Maximum size is 2MB.');
    }
    
    // Process the audio with speech-to-text
    const result = await exports.processVoiceInput(file.buffer);
    
    return result;
  } catch (error) {
    console.error('Voice upload error:', error);
    throw error;
  }
};