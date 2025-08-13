const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs'); // Add this
const path = require('path'); // Add this
require('dotenv').config();

const chatHandler = require('./socket');
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ✅ CREATE UPLOAD DIRECTORIES
const uploadDirs = ['uploads', 'uploads/profiles'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/', userRoutes);
app.use('/auth', require('./routes/authRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/employee', require('./routes/employeeRoutes'));
app.use('/messages', require('./routes/messageRoutes'));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: `Server running on port ${PORT}` });
});

// Connect MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    chatHandler(io);
  })
  .catch(err => console.log("❌ MongoDB connection error:", err));
