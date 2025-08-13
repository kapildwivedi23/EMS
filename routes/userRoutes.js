const express = require('express');
const router = express.Router();
const User = require('../models/Employee');

// Enhanced: Get all users with complete profile info including createdAt
router.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name role _id email phone username photoPath aadharNo createdAt');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
