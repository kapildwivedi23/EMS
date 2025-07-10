const Task = require('../models/Task');

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ employeeId: req.user.id, status: 'Pending' });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks', error: err.message });
  }
};

exports.completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = 'Completed';
    task.remark = req.body.remark;
    task.photoPath = req.file?.path || '';
    task.completedAt = new Date();

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error completing task', error: err.message });
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
