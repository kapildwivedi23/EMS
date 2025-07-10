const express = require('express');
const Message = require('../models/Message');
const router = express.Router();

// Fetch group messages
router.get('/group', async (req, res) => {
  try {
    const messages = await Message.find({ isGroup: true }).sort({ timestamp: 1 }).populate('senderId');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch group messages' });
  }
});

// Fetch private messages between two users
router.get('/private/:id1/:id2', async (req, res) => {
  const { id1, id2 } = req.params;
  try {
    const messages = await Message.find({
      isGroup: false,
      $or: [
        { senderId: id1, receiverId: id2 },
        { senderId: id2, receiverId: id1 }
      ]
    }).sort({ timestamp: 1 }).populate('senderId receiverId');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch private messages' });
  }
});

module.exports = router;
