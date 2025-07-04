import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asynchandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const user = await User.findById(decoded?._id).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(401, "Invalid access token");
  }

  // ✅ Attach only minimal info to req.user
  req.user = {
    id: user._id,
    email: user.email,
    role: user.role,
    userName: user.userName || `${user.firstName} ${user.lastName}`.trim()
  };

  next();
});
