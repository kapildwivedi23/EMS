const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Completed'], 
    default: 'Pending' 
  },
  
  // ✅ ADD THIS CRITICAL SUBMISSIONS ARRAY:
  submissions: [{
    remark: { type: String, required: true },
    photoPath: { type: String, default: null },
    submittedAt: { type: Date, default: Date.now },
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() }
  }],
  
  // Keep existing fields for backward compatibility:
  remark: { type: String, default: '' },
  photoPath: { type: String, default: null },
  submittedAt: { type: Date },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
