const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all users (for task assignment)
router.get('/', auth, async (req, res) => {
  try {
    // Only fetch necessary fields and exclude sensitive info
    const users = await User.find({}, 'name firstName lastName email')
      .sort({ name: 1, firstName: 1 })
      .lean();
    
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;