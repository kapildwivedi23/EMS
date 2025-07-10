const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending'
  },
  remark: {
    type: String,
  },
  photoPath: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
  },
});

module.exports = mongoose.model('Task', taskSchema);
