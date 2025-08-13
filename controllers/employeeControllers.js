const Task = require('../models/Task');

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ 
      employeeId: req.user.id, 
      status: { $in: ['Pending', 'Processing'] }
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks', error: err.message });
  }
};

exports.submitWork = async (req, res) => {
  try {
    console.log('🎯 submitWork called for user:', req.user.id);
    const taskId = req.params.id;
    const { remark } = req.body;
    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if task belongs to current employee
    if (task.employeeId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Allow resubmission for Pending and Processing tasks
    if (task.status === 'Completed') {
      return res.status(400).json({ message: 'Task already completed by admin' });
    }

    console.log('📋 Adding new submission to task:', taskId);

    // Create new submission object
    const newSubmission = {
      remark: remark,
      photoPath: photoPath,
      submittedAt: new Date()
    };

    // Initialize submissions array if it doesn't exist
    if (!task.submissions) {
      task.submissions = [];
    }

    // Add new submission to submissions array
    task.submissions.push(newSubmission);
    task.status = 'Processing';

    await task.save();

    console.log('✅ Task updated with submission:', task.submissions.length);

    const submissionCount = task.submissions.length;
    const message = submissionCount > 1 ? 
      `Work resubmitted successfully! This is submission #${submissionCount}. Updated work sent to admin.` :
      'Work submitted successfully. Waiting for admin approval.';

    res.status(200).json({ 
      message: message,
      task: task,
      submissionNumber: submissionCount
    });
  } catch (error) {
    console.error('🔥 Error in submitWork:', error);
    res.status(500).json({ message: 'Error submitting work', error: error.message });
  }
};

exports.dashboard = async (req, res) => {
  try {
    const tasks = await Task.find({ employeeId: req.user.id });
    res.json({
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      processing: tasks.filter(t => t.status === 'Processing').length,
      pending: tasks.filter(t => t.status === 'Pending').length,
      history: tasks
    });
  } catch (err) {
    res.status(500).json({ message: 'Error loading dashboard', error: err.message });
  }
};
