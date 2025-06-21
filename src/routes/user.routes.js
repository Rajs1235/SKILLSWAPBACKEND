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
} from '../controllers/user.controllers.js';

import { verifyJWT } from '../middleware/auth.middleware.js';

const router=express.Router();


//seccured routes
// Auth
router.post("/register", upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
]), registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);

// User
router.post("/logout", verifyJWT, logoutUser);
router.post("/change-password", verifyJWT, changeCurrentPassword);
router.get("/current-user", verifyJWT, getcurrentUser);
router.patch("/update-details", verifyJWT, updateAccountDetails);


// Matches
router.route('/matches/:username')
    .get(verifyJWT, getMatchesForUser)
    .post(verifyJWT, addMatch);

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

// Time Tracker
router.get('/time', verifyJWT, getTimeStats);
router.patch('/time', verifyJWT, updateTime);



export default router;