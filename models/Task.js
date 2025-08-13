const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  remark: {
    type: String,
    required: true
  },
  photoPath: {
    type: String,
    default: null
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

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
  submissions: [submissionSchema], // Array of all submissions
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
  },
});

// Virtual fields for latest submission (for backward compatibility)
taskSchema.virtual('remark').get(function() {
  if (this.submissions && this.submissions.length > 0) {
    return this.submissions[this.submissions.length - 1].remark;
  }
  return null;
});

taskSchema.virtual('photoPath').get(function() {
  if (this.submissions && this.submissions.length > 0) {
    return this.submissions[this.submissions.length - 1].photoPath;
  }
  return null;
});

taskSchema.virtual('submittedAt').get(function() {
  if (this.submissions && this.submissions.length > 0) {
    return this.submissions[this.submissions.length - 1].submittedAt;
  }
  return null;
});

// Ensure virtuals are included when converting to JSON
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
