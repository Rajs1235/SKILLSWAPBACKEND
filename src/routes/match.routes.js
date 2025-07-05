import express from 'express';
import crypto from 'crypto';
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  addMatchController,
  getMatchesForUser
} from "../controllers/user.controller.js"; // ✅ Make sure getMatchesForUser is exported

const router = express.Router();

// Helper to generate consistent room ID between two users
const getRoomId = (userA, userB) => {
  const sorted = [userA, userB].sort().join('-');
  return 'skillshare-' + crypto.createHash('sha256').update(sorted).digest('hex').slice(0, 10);
};

// ✅ Room ID Generator - Public
// GET /api/v1/matches/room/:user1/:user2
router.get('/room/:user1/:user2', (req, res) => {
  const { user1, user2 } = req.params;
  if (!user1 || !user2) {
    return res.status(400).json({ error: 'Both user IDs are required' });
  }

  const roomId = getRoomId(user1, user2);
  res.json({ roomId });
});

// ✅ Add Match - Protected
// POST /api/v1/matches/add
router.post("/add", verifyJWT, addMatchController);

// ✅ Get Matches for User - Public or Protected based on your preference
// GET /api/v1/matches/:userId
router.get("/:userId", getMatchesForUser);

export default router;
