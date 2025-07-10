const Task = require('../models/Task');

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ employeeId: req.user.id, status: 'Pending' });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks', error: err.message });
  }
};


// Backend: routes/employee.js or wherever you handle task completion
exports.completeTask = async (req, res) => {
  try {
    console.log('🎯 completeTask called');
    const taskId = req.params.id;
    const { remark } = req.body;
    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const task = await Task.findById(taskId);
    if (!task) {
      console.log('❌ Task not found');
      return res.status(404).json({ message: 'Task not found' });
    }

    console.log('📋 Before:', task);

    task.status = 'Completed';
    task.remark = remark;
    task.photoPath = photoPath;
    task.completedAt = new Date();

    await task.save();

    console.log('✅ After:', await Task.findById(taskId));

    res.status(200).json({ message: 'Task marked as completed' });
  } catch (error) {
    console.error('🔥 Error in completeTask:', error);
    res.status(500).json({ message: 'Error completing task' });
  }
};




exports.dashboard = async (req, res) => {
  try {
    const tasks = await Task.find({ employeeId: req.user.id });
    res.json({
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      pending: tasks.filter(t => t.status === 'Pending').length,
      history: tasks
    });
  } catch (err) {
    res.status(500).json({ message: 'Error loading dashboard', error: err.message });
  }
};
