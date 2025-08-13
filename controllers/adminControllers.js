const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const Task = require('../models/Task');

// ✅ ALL FUNCTIONS DEFINED
const addEmployee = async (req, res) => {
    try {
        const { name, email, phone, aadharNo, role, username, password } = req.body;
        
        const existing = await Employee.findOne({ 
          $or: [{ username }, { email }, { phone }, { aadharNo }] 
        });
        
        if (existing) {
          return res.status(400).json({ 
            message: 'Employee already exists with this username, email, phone, or Aadhar number' 
          });
        }
        
        const hash = await bcrypt.hash(password, 10);
        const photoPath = req.file ? `/uploads/profiles/${req.file.filename}` : null;
        
        const employee = new Employee({ 
          name, email, phone, aadharNo, photoPath, role, username, password: hash 
        });
        
        await employee.save();
        
        const employeeResponse = employee.toObject();
        delete employeeResponse.password;
        
        res.status(201).json({
            message: 'Employee added successfully',
            employee: employeeResponse
        });
    } catch (error) {
        console.error('Error in addEmployee:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getEmployees = async (req, res) => {
    try {
        const list = await Employee.find({ role: 'employee' }).select('-password');
        res.json(list);
    } catch (error) {
        console.error('Error in getEmployees:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const assignTask = async (req, res) => {
    try {
        const { employeeId, description } = req.body;
        const task = new Task({ employeeId, description });
        await task.save();
        res.json(task);
    } catch (error) {
        console.error('Error in assignTask:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ADD THIS NEW FUNCTION - Missing Assign to All Function
const assignTaskToAll = async (req, res) => {
    try {
        console.log('🚀 assignTaskToAll called with body:', req.body);
        
        const { description } = req.body;
        
        // Validate input
        if (!description || description.trim() === '') {
            console.log('❌ Empty description provided');
            return res.status(400).json({ message: 'Task description is required' });
        }

        // Get all employees with role 'employee'
        const employees = await Employee.find({ role: 'employee' });
        console.log(`📊 Found ${employees.length} employees`);
        
        if (employees.length === 0) {
            console.log('❌ No employees found');
            return res.status(404).json({ message: 'No employees found' });
        }

        // Create tasks for all employees in parallel
        const taskPromises = employees.map(employee => {
            console.log(`📋 Creating task for employee: ${employee.name} (${employee._id})`);
            
            const task = new Task({
                employeeId: employee._id,
                description: description.trim(),
                status: 'Pending'
            });
            return task.save();
        });

        // Wait for all tasks to be created
        const createdTasks = await Promise.all(taskPromises);
        console.log(`✅ Successfully created ${createdTasks.length} tasks`);

        // Send success response
        res.status(201).json({
            success: true,
            message: 'Task assigned to all employees successfully',
            assignedCount: employees.length,
            employeeCount: employees.length,
            taskDescription: description.trim(),
            tasks: createdTasks.map(task => ({
                id: task._id,
                employeeId: task.employeeId,
                description: task.description,
                status: task.status,
                createdAt: task.createdAt
            }))
        });

    } catch (error) {
        console.error('🔥 Error in assignTaskToAll:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while assigning task to all employees', 
            error: error.message 
        });
    }
};

const completeTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.status !== 'Processing') {
      return res.status(400).json({ message: 'Task must be in processing status to complete' });
    }

    task.status = 'Completed';
    task.completedAt = new Date();
    await task.save();

    res.json({ 
      message: 'Task marked as completed by admin',
      task: task
    });
  } catch (error) {
    console.error('Error in completeTask:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getReport = async (req, res) => {
    try {
        const employees = await Employee.find({ role: 'employee' });
        const report = await Promise.all(employees.map(async (emp) => {
            const tasks = await Task.find({ employeeId: emp._id });
            return {
                employeeId: emp._id.toString(),
                name: emp.name,
                email: emp.email,
                phone: emp.phone,
                photoPath: emp.photoPath,
                total: tasks.length,
                completed: tasks.filter(t => t.status === 'Completed').length,
                processing: tasks.filter(t => t.status === 'Processing').length,
                pending: tasks.filter(t => t.status === 'Pending').length,
                tasks: tasks
            };
        }));
        res.json(report);
    } catch (error) {
        console.error('Error in getReport:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getTaskHistory = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        
        const task = await Task.findById(taskId).populate('employeeId', 'name email phone username photoPath');
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const taskHistory = {
            task: {
                _id: task._id,
                description: task.description,
                status: task.status,
                createdAt: task.createdAt,
                completedAt: task.completedAt,
                totalSubmissions: task.submissions ? task.submissions.length : 0
            },
            employee: task.employeeId,
            submissions: task.submissions ? task.submissions.map((submission, index) => ({
                submissionNumber: index + 1,
                remark: submission.remark,
                photoPath: submission.photoPath,
                submittedAt: submission.submittedAt,
                _id: submission._id
            })) : []
        };

        res.json(taskHistory);
    } catch (error) {
        console.error('Error in getTaskHistory:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



// ✅ CRITICAL: PROPER EXPORTS WITH completeTask ADDED
module.exports = {
    addEmployee,
    getEmployees,
    assignTask,
    assignTaskToAll,
    completeTask,  // Added this function to exports
    getReport,
    getTaskHistory,
};
