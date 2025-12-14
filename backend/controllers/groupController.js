const Group = require('../models/Group');
const User = require('../models/User');

// @desc    Create new group
// @route   POST /api/groups
// @access  Private
exports.createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    const group = await Group.create({
      name,
      description,
      createdBy: req.user._id,
      members: [{
        userId: req.user._id,
        role: 'admin',
        joinedAt: new Date()
      }]
    });

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
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
    }).populate('members.userId', 'name email');

    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add more group functions as needed...