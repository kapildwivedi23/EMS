const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

// Import models
const Employee = require('./models/Employee');
const Task = require('./models/Task');
const Message = require('./models/Message');

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
console.log(' MongoDB connected');
return seed();
})
.catch(err => console.error('Mongo error:', err));

async function seed() {
// Clear collections
await Employee.deleteMany({});
await Task.deleteMany();
await Message.deleteMany();

// Hash passwords
const adminPass = await bcrypt.hash('admin123', 10);
const empPass = await bcrypt.hash('emp123', 10);

// Create users
const admin = new Employee({
name: 'Admin User',
role: 'admin',
username: 'admin',
password: adminPass
});

const john = new Employee({
name: 'John Doe',
role: 'employee',
username: 'john',
password: empPass
});

const jane = new Employee({
name: 'Jane Smith',
role: 'employee',
username: 'jane',
password: empPass
});

await admin.save();
await john.save();
await jane.save();

// Create tasks
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

await Task.insertMany(tasks);

// Create messages
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

await Message.insertMany(messages);

console.log(' Seed data inserted');
process.exit();
}
seed()