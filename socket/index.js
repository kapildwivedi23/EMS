const Message = require('../models/Message');
const Employee = require('../models/Employee');

module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    // Join user-specific private room
    socket.on('join-private', (userId) => {
      socket.join(userId);
      console.log(`🔒 User ${userId} joined their private room`);
    });

    // Join common group chat room
    socket.on('join-group', () => {
      socket.join('group');
      console.log('🌐 User joined the group chat');
    });

    // 🔐 PRIVATE MESSAGE — Only Admin ↔ Employee allowed
    socket.on('private-message', async ({ senderId, receiverId, text }) => {
      try {
        
        const sender = await Employee.findById(senderId);
        const receiver = await Employee.findById(receiverId);

        if (!sender || !receiver) return;

        const isSenderAdmin = sender.role === 'admin';
        const isReceiverAdmin = receiver.role === 'admin';

        const validPrivate = isSenderAdmin !== isReceiverAdmin;

        if (!validPrivate) {
          console.log(`⛔ Blocked private msg: ${sender.name} (${sender.role}) → ${receiver.name} (${receiver.role})`);
          io.to(senderId).emit('error-message', '❌ Only Admin ↔ Employee private chat is allowed.');
          return;
        }

        const message = await Message.create({
          senderId,
          receiverId,
          text,
          isGroup: false,
          timestamp: new Date()
        });

        // ✅ Populate senderId and receiverId with name and role
        const populatedMsg = await message.populate([
          { path: 'senderId', select: 'name role' },
          { path: 'receiverId', select: 'name role' }
        ]);

        io.to(senderId).emit('private-message', populatedMsg);
        io.to(receiverId).emit('private-message', populatedMsg);

        console.log(`✉️ Private: ${sender.name} → ${receiver.name}: "${text}"`);
      } catch (err) {
        console.error('❌ Error sending private message:', err);
      }
    });

    // ✅ GROUP MESSAGE — Allowed for all
    socket.on('group-message', async ({ senderId, text }) => {
      try {
        const sender = await Employee.findById(senderId);

        if (!sender) {
          console.log(`⛔ Group message blocked: sender not found`);
          io.to(senderId).emit('error-message', '❌ Sender not recognized.');
          return;
        }

        const message = await Message.create({
          senderId,
          receiverId: null,
          text,
          isGroup: true,
          timestamp: new Date()
        });

        // ✅ Populate senderId for group messages
        const populatedMsg = await message.populate({
          path: 'senderId',
          select: 'name role'
        });

        io.to('group').emit('group-message', populatedMsg);
        console.log(`📢 Group: ${sender.name}: "${text}"`);
      } catch (err) {
        console.error('❌ Error sending group message:', err);
      }
    });

    // Disconnection
    socket.on('disconnect', () => {
      console.log('⛔ User disconnected:', socket.id);
    });
  });
};
