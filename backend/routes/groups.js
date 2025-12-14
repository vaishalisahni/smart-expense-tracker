const express = require('express');
const router = express.Router();
const { createGroup, getGroups } = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getGroups)
  .post(createGroup);

module.exports = router;