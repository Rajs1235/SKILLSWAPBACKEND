import express from 'express';
import {
    loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken,
    changeCurrentPassword,
    getcurrentUser,
    updateAccountDetails,
    getMatchesForUser,
    addMatch,
    getKnownSkills,
    addKnownSkill,
    getTargetSkills,
updateUserAvatar,
updateUserCoverImage,
    addTargetSkill,
    getUserProgress,
    updateUserProgress,
    getUserBadges,
    awardBadge,
    getUserConversations,
    getMessages,
    sendMessage,
    getTimeStats,
    updateTime
} from '../controllers/user.controller.js';
import mongoose from 'mongoose';
import { verifyJWT } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
const router = express.Router();


//seccured routes
// Auth
router.post("/register", upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
]), registerUser);
router.post(
  "/update-avatar",
  upload.single("avatar"),
  updateUserAvatar
);
router.post(
  "/update-cover",
  upload.single("coverImage"),
  updateUserCoverImage
);

router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", verifyJWT, logoutUser);
router.post("/change-password", verifyJWT, changeCurrentPassword);

// User
router.get("/current-user", verifyJWT, getcurrentUser);
router.patch("/update-details", verifyJWT, updateAccountDetails);
router.patch("/avatar", verifyJWT, upload.single("avatar"), updateUserAvatar);
router.patch("/cover", verifyJWT, upload.single("coverImage"), updateUserCoverImage);

// Matches
router.get("/matches", verifyJWT, getMatchesForUser);
router.post("/matches/:username", verifyJWT, addMatch);

// Skills
router.route('/skills/known')
    .get(verifyJWT, getKnownSkills)
    .post(verifyJWT, addKnownSkill);

router.route('/skills/target')
    .get(verifyJWT, getTargetSkills)
    .post(verifyJWT, addTargetSkill);

// Progress
router.route('/progress')
    .get(verifyJWT, getUserProgress)
    .patch(verifyJWT, updateUserProgress);

// Badges
router.route('/badges')
    .get(verifyJWT, getUserBadges)
    .post(verifyJWT, awardBadge);

// Chat
router.get('/conversations', verifyJWT, getUserConversations);
router.get('/messages/:conversationId', verifyJWT, getMessages);
router.post('/messages', verifyJWT, sendMessage);
router.post('/conversations', verifyJWT, getUserConversations);
// Time Tracker
router.get('/time', verifyJWT, getTimeStats);
router.patch('/time', verifyJWT, updateTime);



router.delete('/drop-target-index', async (req, res) => {
  try {
    await mongoose.connection.db.collection('targetskills').dropIndex('username_1');
    res.status(200).json({ success: true, message: 'Index dropped successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.delete("/drop-targetskills-index", async (req, res) => {
  try {
    await mongoose.connection.db.collection("targetskills").dropIndex("username_1");
    res.status(200).json({ success: true, message: "targetskills index dropped" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/targetskills-indexes", async (req, res) => {
  const indexes = await mongoose.connection.db
    .collection("targetskills")
    .indexes();
  res.status(200).json(indexes);
});

router.delete("/drop-knownskills-index", async (req, res) => {
  try {
    await mongoose.connection.db.collection("knownskills").dropIndex("username_1");
    res.status(200).json({ success: true, message: "Index dropped" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



export default router;