const Group = require('../models/Group');
const User = require('../models/User');
const Expense = require('../models/Expense');
const mongoose = require('mongoose');

// @desc    Create new group
// @route   POST /api/groups
// @access  Private
exports.createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const group = await Group.create({
      name: name.trim(),
      description: description?.trim() || '',
      createdBy: req.user._id,
      members: [{
        userId: req.user._id,
        role: 'admin',
        joinedAt: new Date()
      }]
    });

    // Populate user details
    await group.populate('members.userId', 'name email');

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get user's groups
// @route   GET /api/groups
// @access  Private
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      'members.userId': req.user._id,
      isActive: true
    }).populate('members.userId', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single group
// @route   GET /api/groups/:id
// @access  Private
exports.getGroup = async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      'members.userId': req.user._id,
      isActive: true
    }).populate('members.userId', 'name email')
      .populate('createdBy', 'name email')
      .populate('expenses.paidBy', 'name email')
      .populate('expenses.splitAmong.userId', 'name email');

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private (Admin only)
exports.updateGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    const group = await Group.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is admin
    const userMember = group.members.find(m => m.userId.toString() === req.user._id.toString());
    if (!userMember || userMember.role !== 'admin') {
      return res.status(403).json({ error: 'Only group admins can update group details' });
    }

    if (name) group.name = name.trim();
    if (description !== undefined) group.description = description.trim();

    await group.save();
    await group.populate('members.userId', 'name email');

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete/Deactivate group
// @route   DELETE /api/groups/:id
// @access  Private (Admin only)
exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is admin
    const userMember = group.members.find(m => m.userId.toString() === req.user._id.toString());
    if (!userMember || userMember.role !== 'admin') {
      return res.status(403).json({ error: 'Only group admins can delete groups' });
    }

    group.isActive = false;
    await group.save();

    res.json({
      success: true,
      message: 'Group deactivated successfully'
    });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Add member to group
// @route   POST /api/groups/:id/members
// @access  Private (Admin only)
exports.addMember = async (req, res) => {
  try {
    const { email, role = 'member' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const group = await Group.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if requester is admin
    const userMember = group.members.find(m => m.userId.toString() === req.user._id.toString());
    if (!userMember || userMember.role !== 'admin') {
      return res.status(403).json({ error: 'Only group admins can add members' });
    }

    // Find user by email
    const newUser = await User.findOne({ email: email.toLowerCase() });
    if (!newUser) {
      return res.status(404).json({ error: 'User not found with this email' });
    }

    // Check if already a member
    const existingMember = group.members.find(m => m.userId.toString() === newUser._id.toString());
    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member of this group' });
    }

    // Add member
    group.members.push({
      userId: newUser._id,
      role: role,
      joinedAt: new Date()
    });

    await group.save();
    await group.populate('members.userId', 'name email');

    res.json({
      success: true,
      message: 'Member added successfully',
      data: group
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Remove member from group
// @route   DELETE /api/groups/:id/members/:memberId
// @access  Private (Admin only or self)
exports.removeMember = async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const requesterId = req.user._id.toString();
    const targetMemberId = req.params.memberId;

    // Check if requester is admin or removing self
    const requesterMember = group.members.find(m => m.userId.toString() === requesterId);
    const isSelfRemoval = requesterId === targetMemberId;
    
    if (!isSelfRemoval && (!requesterMember || requesterMember.role !== 'admin')) {
      return res.status(403).json({ error: 'Only group admins can remove other members' });
    }

    // Cannot remove if only member
    if (group.members.length === 1) {
      return res.status(400).json({ error: 'Cannot remove the only member. Delete the group instead.' });
    }

    // Remove member
    group.members = group.members.filter(m => m.userId.toString() !== targetMemberId);

    // If removed user was the only admin, assign new admin
    const hasAdmin = group.members.some(m => m.role === 'admin');
    if (!hasAdmin && group.members.length > 0) {
      group.members[0].role = 'admin';
    }

    await group.save();
    await group.populate('members.userId', 'name email');

    res.json({
      success: true,
      message: 'Member removed successfully',
      data: group
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Add expense to group
// @route   POST /api/groups/:id/expenses
// @access  Private (Members only)
exports.addGroupExpense = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { description, amount, splitType = 'equal', splitAmong } = req.body;

    if (!description || !amount || amount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Description and valid amount are required' });
    }

    const group = await Group.findOne({
      _id: req.params.id,
      'members.userId': req.user._id,
      isActive: true
    }).session(session);

    if (!group) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Group not found' });
    }

    const totalAmount = parseFloat(amount);
    let splits = [];

    if (splitType === 'equal') {
      // Split equally among all members
      const memberIds = group.members.map(m => m.userId);
      const splitAmount = totalAmount / memberIds.length;
      splits = memberIds.map(userId => ({
        userId,
        amount: splitAmount
      }));
    } else if (splitType === 'custom' && splitAmong && Array.isArray(splitAmong)) {
      // Custom split
      const totalSplit = splitAmong.reduce((sum, s) => sum + parseFloat(s.amount), 0);
      if (Math.abs(totalSplit - totalAmount) > 0.01) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: 'Split amounts must equal total amount' });
      }
      splits = splitAmong.map(s => ({
        userId: s.userId,
        amount: parseFloat(s.amount)
      }));
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Invalid split type or split data' });
    }

    // Add expense to group
    const groupExpense = {
      description: description.trim(),
      amount: totalAmount,
      paidBy: req.user._id,
      splitAmong: splits,
      date: new Date()
    };

    group.expenses.push(groupExpense);
    group.totalExpense = (group.totalExpense || 0) + totalAmount;

    // Create individual expense records for tracking
    const expenseRecords = splits.map(split => ({
      userId: split.userId,
      amount: split.amount,
      description: `${description} (Group: ${group.name})`,
      category: 'others',
      date: new Date(),
      entryMethod: 'manual',
      isGroupExpense: true,
      groupId: group._id,
      aiGenerated: false
    }));

    await Expense.insertMany(expenseRecords, { session });
    await group.save({ session });

    await session.commitTransaction();
    session.endSession();

    await group.populate([
      { path: 'expenses.paidBy', select: 'name email' },
      { path: 'expenses.splitAmong.userId', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Group expense added successfully',
      data: group
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Add group expense error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get group expenses
// @route   GET /api/groups/:id/expenses
// @access  Private (Members only)
exports.getGroupExpenses = async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      'members.userId': req.user._id,
      isActive: true
    }).populate('expenses.paidBy', 'name email')
      .populate('expenses.splitAmong.userId', 'name email');

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      success: true,
      count: group.expenses.length,
      totalExpense: group.totalExpense || 0,
      data: group.expenses.sort((a, b) => b.date - a.date)
    });
  } catch (error) {
    console.error('Get group expenses error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Calculate group balance (who owes whom)
// @route   GET /api/groups/:id/balance
// @access  Private (Members only)
exports.getGroupBalance = async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      'members.userId': req.user._id,
      isActive: true
    }).populate('members.userId', 'name email')
      .populate('expenses.paidBy', 'name email')
      .populate('expenses.splitAmong.userId', 'name email');

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Calculate balances
    const balances = {};
    
    // Initialize balances for all members
    group.members.forEach(member => {
      balances[member.userId._id.toString()] = {
        userId: member.userId._id,
        name: member.userId.name,
        email: member.userId.email,
        totalPaid: 0,
        totalOwed: 0,
        balance: 0
      };
    });

    // Calculate from expenses
    group.expenses.forEach(expense => {
      const paidById = expense.paidBy._id.toString();
      
      // Add to total paid
      if (balances[paidById]) {
        balances[paidById].totalPaid += expense.amount;
      }

      // Add to total owed for split members
      expense.splitAmong.forEach(split => {
        const userId = split.userId._id.toString();
        if (balances[userId]) {
          balances[userId].totalOwed += split.amount;
        }
      });
    });

    // Calculate net balance
    Object.keys(balances).forEach(userId => {
      balances[userId].balance = balances[userId].totalPaid - balances[userId].totalOwed;
    });

    // Generate settlement suggestions
    const settlements = calculateSettlements(balances);

    res.json({
      success: true,
      data: {
        balances: Object.values(balances),
        settlements
      }
    });
  } catch (error) {
    console.error('Get group balance error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to calculate settlement suggestions
function calculateSettlements(balances) {
  const debtors = [];
  const creditors = [];

  Object.values(balances).forEach(member => {
    if (member.balance < -0.01) {
      debtors.push({ ...member, amount: -member.balance });
    } else if (member.balance > 0.01) {
      creditors.push({ ...member, amount: member.balance });
    }
  });

  const settlements = [];

  // Simple greedy algorithm for settlements
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);

    settlements.push({
      from: { userId: debtor.userId, name: debtor.name },
      to: { userId: creditor.userId, name: creditor.name },
      amount: Math.round(amount * 100) / 100
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
}

module.exports = exports;