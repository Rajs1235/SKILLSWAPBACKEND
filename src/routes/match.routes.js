import express from 'express'
  import { verifyJWT } from "../middleware/auth.middleware.js"; 
import addMatchController from "../controllers/user.controllers.js"
import crypto from 'crypto';
const router = express.Router();
// Helper to generate consistent room ID between two users
const getRoomId = (userA, userB) => {
  const sorted = [userA, userB].sort().join('-');
  return 'skillshare-' + crypto.createHash('sha256').update(sorted).digest('hex').slice(0, 10);
};

// GET /v1/match/room/:user1/:user2
router.get('/room/:user1/:user2', (req, res) => {
  const { user1, user2 } = req.params;
  if (!user1 || !user2) {
    return res.status(400).json({ error: 'Both user IDs are required' });
  }

  const roomId = getRoomId(user1, user2);
  res.json({ roomId });
});
// routes/match.routes.js
router.post("/add", verifyJWT, addMatchController);

export default router;
