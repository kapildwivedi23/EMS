const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  members: [{
    employeeId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Employee', 
      required: true 
    },
    name: { type: String, required: true },
    email: { type: String, required: true }
  }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
  },
  description: { 
    type: String, 
    default: '' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
