import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { KnownSkill } from "../models/knownskill.model.js";
import { TargetSkill } from "../models/targetskill.model.js";
import { Badge } from "../models/badge.model.js";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { Matches } from "../models/matches.model.js";
import { Progress } from "../models/progress.model.js";
import { TimeTracker } from "../models/timetracker.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import crypto from 'crypto';
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accesstoken = user.generateAccessToken();
        const refreshtoken = user.generateRefreshToken();

        user.refreshToken = refreshtoken;
        await user.save({ validateBeforeSave: false });
        return { accesstoken, refreshtoken };
    } catch (error) {
        throw new ApiError(500, "Failed to generate tokens");
    }
};

// Authentication Controllers
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, username, email, password } = req.body;

    if ([email, username, password].some(field => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) throw new ApiError(409, "User already exists");

    const user = await User.create({ username, fullName, email, password });
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) throw new ApiError(500, "Failed to create user");

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) throw new ApiError(400, "Credentials required");

    const user = await User.findOne({ username });
    if (!user) throw new ApiError(404, "User not found");

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

    const { accesstoken, refreshtoken } = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = { httpOnly: true, secure: true, sameSite: 'strict' };

    return res
        .status(200)
        .cookie("accessToken", accesstoken, options)
        .cookie("refreshToken", refreshtoken, options)
        .json(new ApiResponse(200, {
            user: loggedInUser,
            accesstoken, 
            refreshtoken
        }, "Login successful"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true });
    
    const options = { httpOnly: true, secure: true, sameSite: 'strict' };
    
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// Profile Controllers
const getcurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user"));
});

const getProfileController = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select("firstName lastName username email role learnSkills goals avatar");
    
    if (!user) throw new ApiError(404, "User not found");

    return res.status(200).json(
        new ApiResponse(200, user, "Profile fetched successfully")
    );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    
    if (!fullName || !email) throw new ApiError(400, "All fields required");
    if (!/\S+@\S+\.\S+/.test(email)) throw new ApiError(400, "Invalid email");

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { fullName, email } },
        { new: true }
    ).select("-password");

    return res.status(200).json(
        new ApiResponse(200, user, "Profile updated successfully")
    );
});

// Skills Controllers
const getKnownSkills = asyncHandler(async (req, res) => {
    const known = await KnownSkill.findOne({ userId: req.user._id });
    return res.status(200).json(
        new ApiResponse(200, known?.skills || [], "Known skills fetched")
    );
});

const addKnownSkill = asyncHandler(async (req, res) => {
    const { skillName, level } = req.body;
    
    if (!skillName || typeof level !== "number") {
        throw new ApiError(400, "Skill name and level required");
    }

    const skillDoc = await KnownSkill.findOneAndUpdate(
        { userId: req.user._id },
        { $addToSet: { skills: { skill: skillName, level } } },
        { upsert: true, new: true }
    );

    return res.status(201).json(
        new ApiResponse(201, skillDoc.skills, "Skill added")
    );
});

// Matches Controller
const getMatchesForUser = asyncHandler(async (req, res) => {
    const [known, target] = await Promise.all([
        KnownSkill.findOne({ userId: req.user._id }),
        TargetSkill.findOne({ userId: req.user._id })
    ]);

    const knownSkills = known?.skills.map(s => s.skill) || [];
    const targetSkills = target?.skills.map(s => s.skill) || [];

    const allUsers = await User.find({ _id: { $ne: req.user._id } }).lean();
    const matches = [];

    for (const user of allUsers) {
        const [userKnown, userTarget] = await Promise.all([
            KnownSkill.findOne({ userId: user._id }),
            TargetSkill.findOne({ userId: user._id })
        ]);

        const teachable = userTarget?.skills.some(s => knownSkills.includes(s.skill));
        const learnable = userKnown?.skills.some(s => targetSkills.includes(s.skill));

        if (teachable && learnable) {
            matches.push({
                userId: user._id,
                fullName: user.fullName,
                username: user.username,
                avatar: user.avatar,
                chatRoomId: generateRoomId(req.user.username, user.username),
                videoRoomId: generateRoomId(req.user._id.toString(), user._id.toString())
            });
        }
    }

    await Matches.findOneAndUpdate(
        { username: req.user.username },
        { matches: matches.map(m => m.userId) },
        { upsert: true }
    );

    return res.status(200).json(new ApiResponse(200, matches, "Matches found"));
});

// Utility Functions
const generateRoomId = (a, b) => {
    const sorted = [a, b].sort();
    return crypto.createHash('sha256').update(sorted.join('-')).digest('hex').slice(0, 16);
};

export {
    registerUser,
    loginUser,
    logoutUser,
    getcurrentUser,
    getProfileController,
    updateAccountDetails,
    getKnownSkills,
    addKnownSkill,
    getMatchesForUser
    // Export other cleaned-up controllers as needed
};
