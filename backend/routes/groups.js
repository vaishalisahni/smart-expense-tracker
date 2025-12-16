const express = require('express');
const router = express.Router();
const {
  createGroup,
  getGroups,
  getGroup,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  addGroupExpense,
  getGroupExpenses,
  getGroupBalance
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Group management
router.route('/')
  .get(getGroups)
  .post(createGroup);

router.route('/:id')
  .get(getGroup)
  .put(updateGroup)
  .delete(deleteGroup);

// Member management
router.post('/:id/members', addMember);
router.delete('/:id/members/:memberId', removeMember);

// Expense management
router.post('/:id/expenses', addGroupExpense);
router.get('/:id/expenses', getGroupExpenses);

// Balance and settlements
router.get('/:id/balance', getGroupBalance);

module.exports = router;