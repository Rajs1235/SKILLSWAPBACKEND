import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },

  role: {
    type: String,
    enum: ["Learner", "Tutor"],
    default: "Learner",
  },
  sessionHistory: [{
    duration: { type: Number, required: true }, // Duration of the session in seconds
    endedAt: { type: Date, default: Date.now } // When the session ended
  }],

  skills: {
    type: [String],
    default: [],
  },

  onboardingComplete: {
    type: Boolean,
    default: false,
  },

  avatar: { type: String, default: "" },
  coverImage: { type: String, default: "" },

  password: {
    type: String,
    required: [true, "Password is required"],
  },

  refreshToken: { type: String },
 totalTimeSpent: {
    type: Number, // Storing time in seconds
    default: 0
  },
  // ✅ Tracks all connected users (both Learner-Tutor, etc.)
  connections: [{ type: Schema.Types.ObjectId, ref: "User" }],
},
{ timestamps: true });

// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔑 Password comparison
userSchema.methods.isPasswordCorrect = async function (Password) {
  return await bcrypt.compare(Password, this.password);
};

// 🔐 Access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// 🔄 Refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);

