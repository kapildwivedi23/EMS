// debug.js - Create this file in root directory
const mongoose = require('mongoose');
require('dotenv').config();

async function checkTasks() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const Task = require('./models/Task');
        const tasks = await Task.find({}).populate('employeeId', 'name');
        
        console.log('\n📋 All Tasks in Database:');
        tasks.forEach((task, index) => {
            console.log(`\n${index + 1}. Task: ${task.description}`);
            console.log(`   Employee: ${task.employeeId?.name || 'Unknown'}`);
            console.log(`   Status: ${task.status}`);
            console.log(`   Submissions: ${task.submissions?.length || 0}`);
            
            if (task.submissions && task.submissions.length > 0) {
                task.submissions.forEach((sub, subIndex) => {
                    console.log(`   📤 Submission #${subIndex + 1}:`);
                    console.log(`      Remark: ${sub.remark}`);
                    console.log(`      Photo: ${sub.photoPath || 'No photo'}`);
                    console.log(`      Date: ${sub.submittedAt}`);
                });
            }
        });
        
        mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkTasks();
