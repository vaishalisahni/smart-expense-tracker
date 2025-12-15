// frontend/src/config/config.js

const config = {
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  APP_NAME: 'Smart Expense Tracker',
  
  // Feature flags
  FEATURES: {
    VOICE_INPUT: true,
    OCR_SCANNER: true,
    AI_CHAT: true,
    GROUPS: true,
  },
  
  // Currency settings
  DEFAULT_CURRENCY: 'INR',
  CURRENCIES: [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' }
  ],
  
  // Budget recommendations
  BUDGET: {
    EXPENSE_RATIO: 0.8, // 80% for expenses
    SAVINGS_RATIO: 0.2, // 20% for savings
    ALERT_THRESHOLDS: [70, 90, 100]
  },
  
  // File upload limits
  UPLOAD: {
    MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_AUDIO_SIZE: 5 * 1024 * 1024,  // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
    ALLOWED_AUDIO_TYPES: ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg']
  }
};

export default config;