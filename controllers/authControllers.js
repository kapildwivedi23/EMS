const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
require('dotenv').config();

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await Employee.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({
      token,
      id: user._id,
      role: user.role,
      username: user.username,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, role, username, password } = req.body;

    // Check if user already exists
    const existing = await Employee.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create new user
    const user = new Employee({
      name,
      role,
      username,
      password: hash,
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.status(201).json({
      message: 'Signup successful',
      token,
      role: user.role,
      username: user.username,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
