import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { MatchListing } from "../models/matchListing.model.js";
import {KnownSkill} from "../models/knownskill.model.js"
import {TargetSkill} from "../models/targetskill.model.js"
import {Badge} from "../models/badge.model.js"
import {Conversation} from "../models/conversation.model.js"
import Message from "../models/message.model.js"
import {Matches} from "../models/matches.model.js"
import {Progress} from "../models/progress.model.js"

import {TimeTracker} from "../models/timetracker.model.js"
import crypto from 'crypto';
import { MatchListing } from "../models/matchListing.model.js"; // ✅ Ensure correct path

import jwt from "jsonwebtoken"
import upload from "../middleware/upload.middleware.js";
import mongoose from "mongoose";
const { JsonWebTokenError }= jwt;
const generateAccessAndRefreshToken=async(userId)=>{
    try {
       const user=await User.findById(userId)
       const accesstoken=user.generateAccessToken()
       const refreshtoken=user.generateRefreshToken()

user.refreshToken=refreshtoken;
await user.save({validateBeforeSave:false})
return {accesstoken,refreshtoken}

    } catch (error) {
       console.error("Error in generateAccessAndRefreshToken:", error);
        throw new ApiError(500,"somethingwentwrong");
        
    }
}
const registerUser = asyncHandler(async (req, res) => {
  const { fullName,username, email, password } = req.body;



    // Step 1: Validate input (no fullName or avatar for now)
    if ([email, username, password].some(field => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    // Step 2: Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // Step 3: Create user (no avatar, no cover image)
 const user = await User.create({
username,
  fullName, // ✅ now included
  email,
  password
});

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

  const loginUser = asyncHandler(async (req, res) => {
    // Debugging: Log the incoming request body
    console.log("Incoming request body:", req.body);
    
    const { username, password } = req.body;
    
    // Validation - check if either username or email exists
    if (!username ||!password) {
        throw new ApiError(400, "username or email is required");
    }

    // Find user by username or email
    const user = await User.findOne({
        $or: [{ username }]
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Verify password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // Generate tokens
    const { accesstoken, refreshtoken } = await generateAccessAndRefreshToken(user._id);

    // Get user without sensitive data
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Cookie options
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
    };

    return res
        .status(200)
        .cookie("accessToken", accesstoken, options)
        .cookie("refreshToken", refreshtoken, options) // Fixed typo: was "refresshToken"
        .json(new ApiResponse(200, {
            user: loggedInUser.toObject(),
            accesstoken, 
            refreshtoken
        }, "User logged in successfully"));
});

const logoutUser=asyncHandler(async(req,res)=>{
await User.findByIdAndUpdate(req.user._id,{
    $unset:{
        refreshToken:1//removes field from document
    }
},{
    new:true
})
const options={
    httpOnly:true,
    secure:true,
    sameSite:'strict'
}
return res
.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200,"user loggedout successfully"))
});
const refreshAccessToken=asyncHandler(async(req,res)=>{
   const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken
if(!incomingRefreshToken){
    throw new ApiError(401,"invalid refresh token")
}
const decodedtoken=jwt.verify(
    incomingRefreshToken,
    process.env.Refresh_TOKEN_SECRET
)
const user=await User.findById(decodedtoken?._id)
if(!user){
    throw new ApiError(401,"invalid refresh token")
}
if(incomingRefreshToken!==user?.refreshToken){
     throw new ApiError(401,"expired refresh token")
}
const options={
    httpOnly:true,
    secure:true
}

const {accesstoken,refreshtoken:newrefreshtoken}=await generateAccessAndRefreshToken(user._id)
return res
.status(200)
.cookie("accessToken",accesstoken,options)
.cookie("refreshToken",newrefreshtoken,options)
.json(new ApiResponse(200,{accesstoken,refreshToken:newrefreshtoken},
    "access token generated successfully"
))



})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldpassword,newpassword}=req.body

    const user=await User.findById(req.user?._id)
const ispasswordcorrect=await user.isPasswordCorrect(oldpassword)
if(!ispasswordcorrect){
    throw new ApiError(401,"Invalid old password")
}

user.password=newpassword
await user.save({validateBeforeSave:false})

return res.status(200)
.json(new ApiResponse(200,{},"password changed successfully"))

})

const getcurrentUser=asyncHandler(async(req,res)=>{
return res
.status(200)
.json(new ApiResponse(200,req.user,"current user fetched successfully"))
})
 
const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body
    if(!fullName || !email){
        throw new ApiError(400,"fields needed")

    }
   const user=await User.findByIdAndUpdate(
    req.user?._id,{
        $set:{
            fullName,
            email:email
        }
    },{new:true}).select("-password")
if (!/\S+@\S+\.\S+/.test(email)) throw new ApiError(400, "Invalid email format");

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))

})


const updateUserAvatar=asyncHandler(async(req,res)=>{
  const avatarBuffer = req.file?.buffer;
if (!avatarBuffer) {
  throw new ApiError(400, "Avatar is required");
}

const avatar = await uploadonCloudinary(avatarBuffer, "avatars");

if (!avatar.secure_url) {
  throw new ApiError(400, "Avatar upload failed");
}

   const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
$set:{
    avatar:avatar.url
}
        },
        {new:true}
    ).select("-password")

     
    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"image updated")
    )
})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
const coverBuffer = req.file?.buffer;
if (!coverBuffer) {
  throw new ApiError(400, "Cover image is required");
}

const coverImage = await uploadonCloudinary(coverBuffer, "covers");

if (!coverImage.secure_url) {
  throw new ApiError(400, "Cover image upload failed");
}

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
$set:{
    coverImage:coverImage.url
}
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"image updated")
    )
})
const generateRoomId = (a, b) => {
  const sorted = [a, b].sort(); // ensure consistent order
  return crypto.createHash('sha256').update(sorted.join('-')).digest('hex').slice(0, 16);
};
const getMatchesForUser = asyncHandler(async (req, res) => {
const known = await KnownSkill.findOne({ userId: req.user._id });
const target = await TargetSkill.findOne({ userId: req.user._id });

const knownSkillNames = known?.skills.map(s => s.skill) || [];
const targetSkillNames = target?.skills.map(s => s.skill) || [];


  const allUsers = await User.find({ _id: { $ne: req.user._id } }); // exclude self

  const matches = [];

  for (const user of allUsers) {
 const [userKnownDoc, userTargetDoc] = await Promise.all([
  KnownSkill.findOne({ userId: user._id }),
  TargetSkill.findOne({ userId: user._id })
]);

const userKnownSkills = userKnownDoc?.skills.map(s => s.skill) || [];
const userTargetSkills = userTargetDoc?.skills.map(s => s.skill) || [];


    const skillsTheyCanTeachYou = userKnownSkills.filter(skill => targetSkillNames.includes(skill));
    const skillsYouCanTeachThem = userTargetSkills.filter(skill => knownSkillNames.includes(skill));

    if (skillsTheyCanTeachYou.length && skillsYouCanTeachThem.length) {
      const chatRoomId = generateRoomId(req.user.username, user.username);
      const videoRoomId = generateRoomId(req.user._id.toString(), user._id.toString());

      matches.push({
        userId: user._id,
        fullName: user.fullName,
        username: user.username,
        avatar: user.avatar,
chatRoomId,
videoRoomId 
      });
    }
  }
  await Matches.findOneAndUpdate(
    { username: req.user.username },
    {
      $set:{
        matches: matches.map(m => m.userId)
      }
    },
    { upsert: true, new: true }
  )

  res.status(200).json(new ApiResponse(200, matches, "Matches fetched"));
});

const addMatch = asyncHandler(async (req, res) => {
  const userA = req.user; // logged-in user
  const usernameB = req.params.username; // user to match with
 const chatRoomId = uuidv4();
  const videoRoomId = uuidv4();

  if (userA.username === usernameB) {
    throw new ApiError(400, "You cannot match with yourself");
  }

  const userB = await User.findOne({ username: usernameB });
  if (!userB) throw new ApiError(404, "User not found");

  // Get skills for both users
  const [knownA, targetA, knownB, targetB] = await Promise.all([
    KnownSkill.find({ userId: userA._id }),
    TargetSkill.find({ userId: userA._id }),
    KnownSkill.find({ userId: userB._id }),
    TargetSkill.find({ userId: userB._id })
  ]);

const knownASet = new Set(knownA.flatMap(d => d.skills.map(s => s.skill)));
  const targetASet = new Set(targetA.flatMap(d => d.skills.map(s => s.skill)));
  const knownBSet = new Set(knownB.flatMap(d => d.skills.map(s => s.skill)));
  const targetBSet = new Set(targetB.flatMap(d => d.skills.map(s => s.skill)));

  // Match logic
  const matchedSkills = [];
  for (let skill of knownASet) {
    if (targetBSet.has(skill)) matchedSkills.push(skill);
  }
  for (let skill of targetASet) {
    if (knownBSet.has(skill)) matchedSkills.push(skill);
  }

  if (matchedSkills.length === 0) {
    throw new ApiError(400, "No skill match found");
  }

  // Save match in logged-in user's Match document
  let matchDoc = await Matches.findOne({ username: userA.username });

  if (!matchDoc) {
    matchDoc = await Matches.create({
      username: userA.username,
      matches: [userB._id]
    });
  } else if (!matchDoc.matches.includes(userB._id)) {
    matchDoc.matches.push(userB._id);
    await matchDoc.save();
  }
   req.io?.to(userB._id.toString()).emit("new_match", {
    from: userA.username,
    chatRoomId,
    videoRoomId
  });


  return res.status(201).json(new ApiResponse(201, {
    matchedWith: userB.username,
    chatRoomId,
    videoRoomId
  }, "Match created and room IDs generated"));
});
const getKnownSkills=asyncHandler(async(req,res)=>{
      const known = await KnownSkill.findOne({ userId: req.user._id });
      if(!known) {
        return res.status(200).json(new ApiResponse(200, [], "No known skills found"));
      }
    
     return res.status(200).json(new ApiResponse(200,known.skills,"known skills fetched"))
});
const getTargetSkills = asyncHandler(async (req, res) => {
  const target = await TargetSkill.findOne({ userId: req.user._id });
  if(!target){
    return res.status(200).json(new ApiResponse(200, [], "No target skills found"));
  }
 return res.status(200).json(new ApiResponse(200, target.skills, "Target skills fetched"));
});
const addKnownSkill = asyncHandler(async (req, res) => {
  let { skillName, level } = req.body;

  if (!skillName || typeof level !== "number") {
    throw new ApiError(400, "Both skill name and level are required");
  }

  // Ensure skillName is a string
  if (Array.isArray(skillName)) {
    skillName = skillName[0]; // or reject entirely
  }

  const { _id: userId, username } = req.user;

  let skillDoc = await KnownSkill.findOne({ userId });

  if (!skillDoc) {
    skillDoc = await KnownSkill.create({
      userId,
      username,
      skills: [{ skill: skillName, level }]
    });
  } else {
    const exists = skillDoc.skills.find((s) => s.skill === skillName);
    if (exists) throw new ApiError(409, "Skill already added");

    skillDoc.skills.push({ skill: skillName, level });
    await skillDoc.save();
  }

  res.status(201).json(new ApiResponse(201, skillDoc.skills, "Skill added successfully"));
});

const addTargetSkill = asyncHandler(async (req, res) => {
let { skillName, level } = req.body;

  if (!skillName || typeof level !== "number") {
    throw new ApiError(400, "Both skill name and level are required");
  }

  // Ensure skillName is a string
  if (Array.isArray(skillName)) {
    skillName = skillName[0]; // or reject entirely
  }

  const { _id: userId, username } = req.user;

  let skillDoc = await TargetSkill.findOne({ userId });

  if (!skillDoc) {
    skillDoc = await TargetSkill.create({
      userId,
      username,
      skills: [{ skill: skillName, level }]
    });
  } else {
    const exists = skillDoc.skills.find((s) => s.skill === skillName);
    if (exists) throw new ApiError(409, "Skill already added");

    skillDoc.skills.push({ skill: skillName, level });
    await skillDoc.save();
  }

  res.status(201).json(new ApiResponse(201, skillDoc.skills, "Skill added successfully"));
});
const getUserProgress = asyncHandler(async (req, res) => {
  const progress = await Progress.find({ userId: req.user._id });
 return res.status(200).json(new ApiResponse(200, progress, "Progress data"));
});
const updateUserProgress = asyncHandler(async (req, res) => {
  const { skillId, percent } = req.body;
  if(percent<0||percent>100) throw new ApiError(400, "Progress must be between 0–100");
  const updated = await Progress.findOneAndUpdate(
    { userId: req.user._id, skillId },
    { $set: { percent } },
    { upsert: true, new: true }
  );
 return res.status(200).json(new ApiResponse(200, updated, "Progress updated"));
});
const getUserBadges=asyncHandler(async(req,res)=>{
    const badges=await Badge.find({userId:req.user._id})
  return res.status(200)
    .json(new ApiResponse(200,badges,"badges fetched"))
});
const awardBadge=asyncHandler(async(req,res)=>{
    const {title,description}=req.body;
    if(!title)throw new ApiError(400, "Title is required");
    const badge=await Badge.create({user:req.user._id,title,description});
   return res.status(201)
    .json(new ApiResponse(201,badge,"badge awarded"))
});
const getUserConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id });
  res.status(200).json(new ApiResponse(200, conversations));
});

const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ conversationId: req.params.conversationId });
  res.status(200).json(new ApiResponse(200, messages));
});

const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, content } = req.body;
  if(!conversationId||!content) throw new ApiError(404, "Conversation not found");
  const message = await Message.create({
    conversationId,
    sender: req.user._id,
    content,
  });

  res.status(201).json(new ApiResponse(201, message, "Message sent"));
});
const getTimeStats = asyncHandler(async (req, res) => {
  const time = await TimeTracker.findOne({ userId: req.user._id });
  res.status(200).json(new ApiResponse(200, time));
});
const updateTime = asyncHandler(async (req, res) => {
  const { minutes } = req.body;
  const time = await TimeTracker.findOneAndUpdate(
    { userId: req.user._id },
    { $inc: { totalMinutes: minutes } },
    { upsert: true, new: true }
  );
  res.status(200).json(new ApiResponse(200, time, "Time updated"));
});
 
const createConversation = asyncHandler(async (req, res) => {
  const { senderId, receiverId } = req.body;

  if (!senderId || !receiverId) {
    return res.status(400).json({
      success: false,
      message: "Both senderId and receiverId are required.",
    });
  }

  let existing = await Conversation.findOne({
    members: { $all: [senderId, receiverId] },
  });

  if (existing) {
    return res.status(200).json({
      statusCode: 200,
      data: existing,
      message: "Conversation already exists",
      success: true,
    });
  }

  const newConversation = await Conversation.create({
    members: [senderId, receiverId],
  });

  return res.status(201).json({
    statusCode: 201,
    data: newConversation,
    message: "Conversation created",
    success: true,
  });
});
const updateProfileController = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID not found" });
    }

    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const { firstName, lastName, role, skills, onboardingComplete } = req.body;

    // ✅ Update the user
    const updated = await User.findByIdAndUpdate(
      userId,
      {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(role && { role }),
        ...(skills && { skills }),
        ...(onboardingComplete !== undefined && { onboardingComplete }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Create or update public match listing if onboarding is complete
    if (onboardingComplete) {
      await MatchListing.findOneAndUpdate(
        { user: userId },
        {
          user: userId,
          name: `${updated.firstName} ${updated.lastName}`,
          role: updated.role,
          skills: updated.skills,
          avatar: updated.avatar || "", // optional if avatar exists in User
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: "Profile updated",
      user: updated,
    });
  } catch (err) {
    console.error("Error in updateProfileController:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

const getProfileController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'email username firstName lastName skills role matches avatar'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (err) {
    console.error("Error in getProfileController:", err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
// controllers/user.controller.js
 const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // exclude password
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users." });
  }
};

// routes/user.routes.js
import { getAllUsers } from "../controllers/user.controller.js";

router.get('/users/all', authenticateUser, getAllUsers);
// controllers/matchListing.controller.js

// controllers/match.controller.js
export const addMatchController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { matchId } = req.body;

    if (!matchId) {
      return res.status(400).json({ message: "Match ID is required" });
    }

    const existing = await Matches.findOne({ username: req.user.username });

    if (existing) {
      if (!existing.matches.includes(matchId)) {
        existing.matches.push(matchId);
        await existing.save();
      }
    } else {
      await Matches.create({ username: req.user.username, matches: [matchId] });
    }

    res.status(200).json({ message: "User added to your matches" });
  } catch (error) {
    console.error("Error adding match:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllListingsController = async (req, res) => {
  try {
    const listings = await MatchListing.find();
    res.status(200).json(listings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching match listings", error: err.message });
  }
};

export {
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
  getAllUsers, // <-- defined above and just exported here
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
};
