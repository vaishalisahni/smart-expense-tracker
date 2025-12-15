const express = require('express');
const router = express.Router();
const {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addToGoal,
  withdrawFromGoal,
  getAnalytics
} = require('../controllers/savingsController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Goal management
router.route('/goals')
  .get(getGoals)
  .post(createGoal);

router.route('/goals/:goalId')
  .put(updateGoal)
  .delete(deleteGoal);

// Transactions
router.post('/goals/:goalId/add', addToGoal);
router.post('/goals/:goalId/withdraw', withdrawFromGoal);

// Analytics
router.get('/analytics', getAnalytics);

module.exports = router;