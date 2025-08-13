const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
require('dotenv').config();

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username or email
    const user = await Employee.findOne({ 
      $or: [{ username }, { email: username }] 
    });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      id: user._id,
      role: user.role,
      username: user.username,
      name: user.name
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const signup = async (req, res) => {
  try {
    const { name, email, phone, aadharNo, role, username, password } = req.body;
    
    // Check if user already exists
    const existing = await Employee.findOne({ 
      $or: [
        { username }, 
        { email }, 
        { phone }, 
        { aadharNo }
      ] 
    });
    
    if (existing) {
      return res.status(400).json({ 
        message: 'User already exists with this username, email, phone, or Aadhar number' 
      });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);
    
    // Handle photo upload
    const photoPath = req.file ? `/uploads/profiles/${req.file.filename}` : null;

    // Create new user
    const user = new Employee({
      name,
      email,
      phone,
      aadharNo,
      photoPath,
      role: role || 'employee', // Default to employee
      username,
      password: hash,
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Signup successful',
      token,
      id: user._id,
      role: user.role,
      username: user.username,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ PROPER EXPORTS
module.exports = {
  login,
  signup
};
