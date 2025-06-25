import express from 'express';
import Message from '../models/message.model.js';

const router = express.Router();

// GET /v1/chat/:roomId
router.get('/:conversationId', async (req, res) => {
  try {
    const messages = await Message.find({ conversationId : req.params.roomId })
      .sort({ createdAt: 1 }); // oldest first
    res.json({ success: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

export default router;
