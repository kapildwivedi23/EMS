const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

// Import models
const Employee = require('./models/Employee');
const Task = require('./models/Task');
const Message = require('./models/Message');
const Group = require('./models/Group'); // NEW: Import Group model

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  console.log('MongoDB connected');
  return seed();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function seed() {
  try {
    // Clear all existing data
    await Employee.deleteMany({});
    await Task.deleteMany({});
    await Message.deleteMany({});
    await Group.deleteMany({}); // NEW: Clear groups

    const adminPass = await bcrypt.hash('admin123', 10);
    const empPass = await bcrypt.hash('emp123', 10);

    // Create admin
    const admin = new Employee({
      name: 'Admin User',
      role: 'admin',
      username: 'admin',
      password: adminPass,
      email: 'admin@example.com',
      phone: '9999999999',
      aadharNo: '123412341234',
    });

    // Create employees
    const john = new Employee({
      name: 'John Doe',
      role: 'employee',
      username: 'john',
      password: empPass,
      email: 'john@example.com',
      phone: '9876543210',
      aadharNo: '432143214321',
    });

    const jane = new Employee({
      name: 'Jane Smith',
      role: 'employee',
      username: 'jane',
      password: empPass,
      email: 'jane@example.com',
      phone: '9638527410',
      aadharNo: '567856785678',
    });

    const mike = new Employee({
      name: 'Mike Johnson',
      role: 'employee',
      username: 'mike',
      password: empPass,
      email: 'mike@example.com',
      phone: '9123456789',
      aadharNo: '789012345678',
    });

    const sarah = new Employee({
      name: 'Sarah Wilson',
      role: 'employee',
      username: 'sarah',
      password: empPass,
      email: 'sarah@example.com',
      phone: '9876543211',
      aadharNo: '345678901234',
    });

    // // Save all employees
    await admin.save();
    // await john.save();
    // await jane.save();
    // await mike.save();
    // await sarah.save();

    // Create sample groups
    const electricalGroup = new Group({
      name: 'Electrical Team',
      members: [
        { employeeId: john._id, name: john.name, email: john.email },
        { employeeId: mike._id, name: mike.name, email: mike.email }
      ],
      createdBy: admin._id,
      description: 'Handles all electrical maintenance tasks'
    });

    const cleaningGroup = new Group({
      name: 'Cleaning Staff',
      members: [
        { employeeId: jane._id, name: jane.name, email: jane.email },
        { employeeId: sarah._id, name: sarah.name, email: sarah.email }
      ],
      createdBy: admin._id,
      description: 'Responsible for facility cleaning and maintenance'
    });

    // await electricalGroup.save();
    // await cleaningGroup.save();

    // Create sample tasks
    const tasks = [
      {
        employeeId: john._id,
        description: 'Inspect electrical wiring in Block A',
        status: 'Pending'
      },
      {
        employeeId: john._id,
        description: 'Replace air filter in room 204',
        status: 'Completed',
        remark: 'Filter replaced successfully',
        photoPath: 'uploads/room204.jpg',
        completedAt: new Date()
      },
      {
        employeeId: jane._id,
        description: 'Clean conference hall before meeting',
        status: 'Pending'
      },
      {
        employeeId: mike._id,
        description: 'Check electrical panel in basement',
        status: 'Processing'
      },
      {
        employeeId: sarah._id,
        description: 'Deep clean office floors',
        status: 'Pending'
      }
    ];

    // await Task.insertMany(tasks);

    // Create sample messages
    const messages = [
      {
        senderId: admin._id,
        receiverId: null, // group chat
        text: 'Hello team, please complete your pending tasks.',
        timestamp: new Date()
      },
      {
        senderId: john._id,
        receiverId: admin._id, // private chat
        text: 'Sir, task 2 is completed. Photo uploaded.',
        timestamp: new Date()
      }
    ];

    // await Message.insertMany(messages);

    console.log('✅ Seed data inserted successfully');
    console.log(`📊 Created ${await Employee.countDocuments()} employees`);
    console.log(`👥 Created ${await Group.countDocuments()} groups`);
    console.log(`📋 Created ${await Task.countDocuments()} tasks`);
    console.log(`💬 Created ${await Message.countDocuments()} messages`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}
