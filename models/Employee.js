const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  aadharNo: { type: String, required: true },
  photoPath: { type: String, default: null },
  
  // No need for group field since we're managing groups dynamically
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
