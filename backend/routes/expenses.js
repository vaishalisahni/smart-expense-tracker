const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getExpenses,
  createExpense,
  createExpenseFromVoice,
  createExpenseFromReceipt,
  updateExpense,
  deleteExpense,
  getAnalytics,
  exportExpenses
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.post('/voice', upload.single('audio'), createExpenseFromVoice);
router.post('/ocr', upload.single('receipt'), createExpenseFromReceipt);

router.get('/analytics', getAnalytics);
router.get('/export', exportExpenses);

router.route('/:id')
  .get(getExpense)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;