const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

// Import models
const Employee = require('./models/Employee');
const Task = require('./models/Task');
const Message = require('./models/Message');

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
    await Employee.deleteMany({});
    await Task.deleteMany({});
    await Message.deleteMany({});

    const adminPass = await bcrypt.hash('admin123', 10);
    const empPass = await bcrypt.hash('emp123', 10);

    const admin = new Employee({
      name: 'Admin User',
      role: 'admin',
      username: 'admin',
      password: adminPass,
      email: 'admin@gmail.com',
      phone: '9999999999',
      aadharNo: '123412341234',
    });

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

    await admin.save();
    // await john.save();
    // await jane.save();

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
      }
    ];

    // await Task.insertMany(tasks);

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

    console.log('Seed data inserted successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}
