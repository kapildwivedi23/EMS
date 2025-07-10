const express = require('express');
const router = express.Router();
const User = require('../models/Employee'); // Assuming Employee model has user data

// Get all users for dropdown
router.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name role _id email');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;