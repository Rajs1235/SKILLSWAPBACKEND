import express from 'express';
import ChatMessage from '../models/message.model.js';

const router = express.Router();

// GET /v1/chat/:roomId
router.get('/:roomId', async (req, res) => {
  try {
    const messages = await ChatMessage.find({ roomId: req.params.roomId })
      .sort({ timestamp: 1 }); // oldest first
    res.json({ success: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

export default router;
