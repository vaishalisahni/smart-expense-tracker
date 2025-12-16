/**
 * AI Text Parser for Expense Extraction
 * Parses text from OCR to extract expense information
 * Uses pattern matching and NLP-like techniques (free - no API needed)
 */

/**
 * Main function: Extract expense data from any text
 */
exports.extractExpenseFromText = async (text) => {
  const cleanText = text.trim();
  
  // Extract components
  const amount = extractAmount(cleanText);
  const date = extractDate(cleanText);
  const merchantName = extractMerchantName(cleanText);
  const category = categorizeFromText(cleanText);
  const description = generateDescription(cleanText, merchantName, amount);
  
  return {
    amount,
    date,
    merchantName,
    category,
    description,
    rawText: cleanText
  };
};

/**
 * Extract amount from text
 */
function extractAmount(text) {
  // Common amount patterns
  const patterns = [
    // "Total: Rs 150", "Total: ₹ 150", "Total Rs.150"
    /total[:\s]*(?:rs\.?|₹|inr)?\s*(\d+(?:[,\d]*)?(?:\.\d{2})?)/i,
    
    // "Grand Total: 150.00"
    /grand\s*total[:\s]*(?:rs\.?|₹|inr)?\s*(\d+(?:[,\d]*)?(?:\.\d{2})?)/i,
    
    // "Amount: Rs 150"
    /amount[:\s]*(?:rs\.?|₹|inr)?\s*(\d+(?:[,\d]*)?(?:\.\d{2})?)/i,
    
    // "Net Amount: 150"
    /net\s*amount[:\s]*(?:rs\.?|₹|inr)?\s*(\d+(?:[,\d]*)?(?:\.\d{2})?)/i,
    
    // "Debited: Rs 150", "Paid: ₹150"
    /(?:debited|paid|deducted)[:\s]*(?:rs\.?|₹|inr)?\s*(\d+(?:[,\d]*)?(?:\.\d{2})?)/i,
    
    // "Rs 150", "₹ 150" (standalone)
    /(?:rs\.?|₹|inr)\s*(\d+(?:[,\d]*)?(?:\.\d{2})?)/i,
    
    // Just numbers with decimals "150.00"
    /(\d+\.\d{2})\b/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Remove commas and parse
      const amountStr = match[1].replace(/,/g, '');
      const amount = parseFloat(amountStr);
      
      // Validate reasonable amount
      if (amount > 0 && amount < 1000000) {
        return amount;
      }
    }
  }
  
  // If no pattern matched, try to find largest number
  const numbers = text.match(/\d+(?:\.\d{2})?/g);
  if (numbers && numbers.length > 0) {
    const amounts = numbers.map(n => parseFloat(n)).filter(n => n > 0 && n < 1000000);
    if (amounts.length > 0) {
      // Return the largest number (likely the total)
      return Math.max(...amounts);
    }
  }
  
  return null;
}

/**
 * Extract date from text
 */
function extractDate(text) {
  const patterns = [
    // DD/MM/YYYY or DD-MM-YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    
    // DD MMM YYYY (e.g., "15 Jan 2024")
    /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{2,4})/i,
    
    // YYYY-MM-DD
    /(\d{4})-(\d{1,2})-(\d{1,2})/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        let dateObj;
        
        if (pattern.source.includes('jan|feb')) {
          // Handle "DD MMM YYYY"
          const monthMap = {
            jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
            jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
          };
          const day = parseInt(match[1]);
          const month = monthMap[match[2].toLowerCase().substring(0, 3)];
          let year = parseInt(match[3]);
          if (year < 100) year += 2000;
          dateObj = new Date(year, month, day);
        } else if (match[1].length === 4) {
          // YYYY-MM-DD
          dateObj = new Date(match[1], parseInt(match[2]) - 1, match[3]);
        } else {
          // DD/MM/YYYY
          const day = parseInt(match[1]);
          const month = parseInt(match[2]) - 1;
          let year = parseInt(match[3]);
          if (year < 100) year += 2000;
          dateObj = new Date(year, month, day);
        }
        
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toISOString().split('T')[0];
        }
      } catch (e) {
        continue;
      }
    }
  }
  
  // Default to today
  return new Date().toISOString().split('T')[0];
}

/**
 * Extract merchant/vendor name
 */
function extractMerchantName(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Common skip patterns
  const skipPatterns = [
    /receipt/i, /invoice/i, /bill/i, /tax/i, /gst/i, /total/i,
    /date/i, /time/i, /amount/i, /thank you/i, /visit again/i,
    /^\d+$/, /^[\d\s\-\(\)]+$/, /email/i, /phone/i, /mobile/i,
    /address/i, /website/i, /^(rs|₹|inr)/i
  ];
  
  // Look for merchant name in first 5 lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    
    // Skip if matches skip patterns
    if (skipPatterns.some(pattern => pattern.test(line))) {
      continue;
    }
    
    // Valid merchant name conditions
    if (
      line.length >= 3 &&
      line.length <= 50 &&
      /[a-zA-Z]/.test(line) && // Contains letters
      !/^\d+/.test(line) // Doesn't start with number
    ) {
      return line;
    }
  }
  
  // SMS transaction - extract from/to info
  const fromMatch = text.match(/(?:from|at|to)\s+([A-Z][A-Za-z\s]{2,30})/);
  if (fromMatch) {
    return fromMatch[1].trim();
  }
  
  return null;
}

/**
 * Categorize based on text content
 */
function categorizeFromText(text) {
  const lower = text.toLowerCase();
  
  const categoryKeywords = {
    food: [
      'restaurant', 'cafe', 'coffee', 'food', 'meal', 'lunch', 'dinner',
      'breakfast', 'pizza', 'burger', 'snack', 'swiggy', 'zomato',
      'dominos', 'mcdonald', 'kfc', 'subway', 'starbucks', 'dunkin'
    ],
    travel: [
      'uber', 'ola', 'taxi', 'cab', 'bus', 'train', 'metro', 'flight',
      'ticket', 'fuel', 'petrol', 'diesel', 'parking', 'toll', 'rapido'
    ],
    education: [
      'book', 'college', 'university', 'course', 'tuition', 'fee',
      'school', 'exam', 'study', 'library', 'notebook', 'stationery',
      'pen', 'pencil', 'xerox', 'print'
    ],
    entertainment: [
      'movie', 'cinema', 'theatre', 'netflix', 'prime', 'hotstar',
      'spotify', 'game', 'gaming', 'concert', 'party', 'club',
      'pvr', 'inox', 'show'
    ],
    utilities: [
      'electricity', 'water', 'internet', 'wifi', 'broadband', 'phone',
      'mobile', 'recharge', 'bill', 'rent', 'maintenance', 'gas',
      'cylinder', 'jio', 'airtel', 'vodafone', 'bsnl'
    ],
    shopping: [
      'amazon', 'flipkart', 'myntra', 'ajio', 'shopping', 'mall',
      'clothes', 'shoes', 'dress', 'shirt', 'pants', 'accessories',
      'store', 'shop', 'purchase', 'buy'
    ],
    health: [
      'medicine', 'medical', 'hospital', 'doctor', 'clinic', 'pharmacy',
      'chemist', 'apollo', 'fortis', 'health', 'test', 'lab',
      'checkup', 'consultation', 'tablets', 'pills'
    ]
  };
  
  // Score each category
  const scores = {};
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    scores[category] = keywords.filter(keyword => lower.includes(keyword)).length;
  }
  
  // Get category with highest score
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore > 0) {
    return Object.keys(scores).find(cat => scores[cat] === maxScore);
  }
  
  return 'others';
}

/**
 * Generate description
 */
function generateDescription(text, merchantName, amount) {
  // Try to extract item details
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Look for item descriptions (lines with words and possibly prices)
  const itemPattern = /^([A-Za-z][A-Za-z\s]{3,40})\s*(?:[\d\.,]+)?$/;
  const items = [];
  
  for (const line of lines) {
    if (items.length >= 3) break;
    const match = line.match(itemPattern);
    if (match && !match[1].match(/total|subtotal|tax|gst|discount/i)) {
      items.push(match[1].trim());
    }
  }
  
  // Build description
  if (items.length > 0) {
    return items.join(', ');
  }
  
  if (merchantName) {
    return `Purchase at ${merchantName}`;
  }
  
  if (amount) {
    return `Expense of ₹${amount}`;
  }
  
  return 'Scanned expense';
}

module.exports = exports;