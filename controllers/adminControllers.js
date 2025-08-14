const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const Task = require('../models/Task');
const Group = require('../models/Group'); // NEW: Import Group model

// Existing functions remain same...
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

const assignTaskToAll = async (req, res) => {
    try {
        console.log('🚀 assignTaskToAll called with body:', req.body);
        
        const { description } = req.body;
        
        if (!description || description.trim() === '') {
            console.log('❌ Empty description provided');
            return res.status(400).json({ message: 'Task description is required' });
        }

        const employees = await Employee.find({ role: 'employee' });
        console.log(`📊 Found ${employees.length} employees`);
        
        if (employees.length === 0) {
            console.log('❌ No employees found');
            return res.status(404).json({ message: 'No employees found' });
        }

        const taskPromises = employees.map(employee => {
            console.log(`📋 Creating task for employee: ${employee.name} (${employee._id})`);
            
            const task = new Task({
                employeeId: employee._id,
                description: description.trim(),
                status: 'Pending'
            });
            return task.save();
        });

        const createdTasks = await Promise.all(taskPromises);
        console.log(`✅ Successfully created ${createdTasks.length} tasks`);

        res.status(201).json({
            success: true,
            message: 'Task assigned to all employees successfully',
            assignedCount: employees.length,
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

// NEW: Create Group Function
const createGroup = async (req, res) => {
    try {
        const { name, members, description } = req.body;
        const adminId = req.user.id; // From auth middleware
        
        console.log('📋 Creating group:', { name, members: members?.length, adminId });
        
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Group name is required' });
        }
        
        if (!members || !Array.isArray(members) || members.length === 0) {
            return res.status(400).json({ message: 'At least one member is required' });
        }
        
        // Validate all member IDs exist
        const employeeIds = members.map(member => member.id);
        const existingEmployees = await Employee.find({ 
            _id: { $in: employeeIds }, 
            role: 'employee' 
        });
        
        if (existingEmployees.length !== employeeIds.length) {
            return res.status(400).json({ message: 'Some employees not found or invalid' });
        }
        
        // Check if group name already exists for this admin
        const existingGroup = await Group.findOne({ 
            name: name.trim(), 
            createdBy: adminId 
        });
        
        if (existingGroup) {
            return res.status(400).json({ message: 'Group with this name already exists' });
        }
        
        // Create new group
        const newGroup = new Group({
            name: name.trim(),
            members: members.map(member => ({
                employeeId: member.id,
                name: member.name,
                email: member.email
            })),
            createdBy: adminId,
            description: description || ''
        });
        
        const savedGroup = await newGroup.save();
        
        console.log(`✅ Group "${name}" created with ${members.length} members`);
        
        res.status(201).json({
            success: true,
            message: `Group "${name}" created successfully`,
            group: savedGroup
        });
        
    } catch (error) {
        console.error('🔥 Error in createGroup:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while creating group', 
            error: error.message 
        });
    }
};

// NEW: Get Groups Function
const getGroups = async (req, res) => {
    try {
        const adminId = req.user.id;
        
        const groups = await Group.find({ createdBy: adminId })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        
        console.log(`📋 Found ${groups.length} groups for admin ${adminId}`);
        
        res.json({
            success: true,
            groups: groups.map(group => ({
                id: group._id,
                name: group.name,
                members: group.members,
                description: group.description,
                createdAt: group.createdAt,
                memberCount: group.members.length
            }))
        });
        
    } catch (error) {
        console.error('🔥 Error in getGroups:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching groups', 
            error: error.message 
        });
    }
};

// NEW: Delete Group Function
const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const adminId = req.user.id;
        
        const group = await Group.findOne({ 
            _id: groupId, 
            createdBy: adminId 
        });
        
        if (!group) {
            return res.status(404).json({ message: 'Group not found or unauthorized' });
        }
        
        await Group.findByIdAndDelete(groupId);
        
        console.log(`🗑️ Group "${group.name}" deleted by admin ${adminId}`);
        
        res.json({
            success: true,
            message: `Group "${group.name}" deleted successfully`
        });
        
    } catch (error) {
        console.error('🔥 Error in deleteGroup:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while deleting group', 
            error: error.message 
        });
    }
};

// NEW: Assign Task to Group Function
const assignTaskToGroup = async (req, res) => {
    try {
        const { groupId, description } = req.body;
        const adminId = req.user.id;
        
        console.log('📋 Assigning task to group:', { groupId, description });
        
        if (!groupId || !description || description.trim() === '') {
            return res.status(400).json({ message: 'Group ID and task description are required' });
        }
        
        // Find the group
        const group = await Group.findOne({ 
            _id: groupId, 
            createdBy: adminId 
        });
        
        if (!group) {
            return res.status(404).json({ message: 'Group not found or unauthorized' });
        }
        
        if (group.members.length === 0) {
            return res.status(400).json({ message: 'Group has no members' });
        }
        
        // Create tasks for all group members
        const taskPromises = group.members.map(member => {
            const task = new Task({
                employeeId: member.employeeId,
                description: description.trim(),
                status: 'Pending'
            });
            return task.save();
        });
        
        const createdTasks = await Promise.all(taskPromises);
        
        console.log(`✅ Task assigned to ${group.members.length} members of group "${group.name}"`);
        
        res.status(201).json({
            success: true,
            message: `Task assigned to group "${group.name}" successfully`,
            assignedCount: group.members.length,
            groupName: group.name,
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
        console.error('🔥 Error in assignTaskToGroup:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while assigning task to group', 
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
                tasks: tasks.map(task => {
                    // ✅ FIX: Get latest submission details
                    let latestRemark = task.remark || '';
                    let latestPhotoPath = task.photoPath || null;
                    let latestSubmittedAt = task.submittedAt;
                    
                    // If submissions exist, get the latest one
                    if (task.submissions && task.submissions.length > 0) {
                        const latestSubmission = task.submissions[task.submissions.length - 1];
                        latestRemark = latestSubmission.remark || '';
                        latestPhotoPath = latestSubmission.photoPath || null;
                        latestSubmittedAt = latestSubmission.submittedAt;
                    }
                    
                    return {
                        _id: task._id,
                        description: task.description,
                        status: task.status,
                        remark: latestRemark,           // ✅ Latest remark
                        photoPath: latestPhotoPath,     // ✅ Latest photo
                        submittedAt: latestSubmittedAt, // ✅ Latest submission time
                        completedAt: task.completedAt,
                        createdAt: task.createdAt,
                        submissions: task.submissions || []
                    };
                })
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

        // ✅ FIX: Get latest submission details properly
        let latestRemark = '';
        let latestPhotoPath = null;
        let totalSubmissions = 0;
        
        if (task.submissions && task.submissions.length > 0) {
            const latestSubmission = task.submissions[task.submissions.length - 1];
            latestRemark = latestSubmission.remark || '';
            latestPhotoPath = latestSubmission.photoPath || null;
            totalSubmissions = task.submissions.length;
        } else {
            // Fallback to old fields
            latestRemark = task.remark || '';
            latestPhotoPath = task.photoPath || null;
            totalSubmissions = (task.remark || task.photoPath) ? 1 : 0;
        }

        const taskHistory = {
            task: {
                _id: task._id,
                description: task.description,
                status: task.status,
                createdAt: task.createdAt,
                completedAt: task.completedAt,
                totalSubmissions: totalSubmissions,
                latestRemark: latestRemark,        // ✅ Add latest remark
                latestPhotoPath: latestPhotoPath   // ✅ Add latest photo
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

// Export all functions
module.exports = {
    addEmployee,
    getEmployees,  
    assignTask,
    assignTaskToAll,
    createGroup,        // NEW
    getGroups,          // NEW
    deleteGroup,        // NEW
    assignTaskToGroup,  // NEW
    completeTask,
    getReport,
    getTaskHistory
};
