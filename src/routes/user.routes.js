import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getcurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getMatchesForUser,
  addMatch,
  getKnownSkills,
  addKnownSkill,
  getTargetSkills,
  getUserProgress,
  getProfileController,
  updateUserProgress,
  getUserBadges,
  awardBadge,
  updateProfileController,
  getUserConversations,
  getMessages,
  sendMessage,
  addTargetSkill,
  getTimeStats,
  updateTime
} from "../controllers/user.controller.js";
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

// =================== AUTH ROUTES ===================
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", verifyJWT, logoutUser);
router.post("/change-password", verifyJWT, changeCurrentPassword);

// =================== PROFILE ROUTES ===================
router.get('/profile', verifyJWT, getProfileController);
router.put('/profile', verifyJWT, updateProfileController);
router.post('/profile', verifyJWT, updateProfileController); // for onboarding

router.get("/current-user", verifyJWT, getcurrentUser);
router.patch("/update-details", verifyJWT, updateAccountDetails);

// =================== MEDIA ROUTES ===================
// router.patch("/avatar", verifyJWT, upload.single("avatar"), updateUserAvatar);
// router.patch("/cover", verifyJWT, upload.single("coverImage"), updateUserCoverImage);

// =================== MATCHING ROUTES ===================
router.get("/matches", verifyJWT, getMatchesForUser);
router.post("/matches/:username", verifyJWT, addMatch);

// =================== SKILLS ROUTES ===================
router.route('/skills/known')
  .get(verifyJWT, getKnownSkills)
  .post(verifyJWT, addKnownSkill);

router.route('/skills/target')
  .get(verifyJWT, getTargetSkills)
  .post(verifyJWT, addTargetSkill);

// =================== PROGRESS ROUTES ===================
router.route('/progress')
  .get(verifyJWT, getUserProgress)
  .patch(verifyJWT, updateUserProgress);

// =================== BADGES ROUTES ===================
router.route('/badges')
  .get(verifyJWT, getUserBadges)
  .post(verifyJWT, awardBadge);

// =================== MESSAGING ROUTES ===================
router.get('/conversations', verifyJWT, getUserConversations);
router.get('/messages/:conversationId', verifyJWT, getMessages);
router.post('/messages', verifyJWT, sendMessage);

// =================== TIME TRACKING ROUTES ===================
router.get('/time', verifyJWT, getTimeStats);
router.patch('/time', verifyJWT, updateTime);

export default router;
