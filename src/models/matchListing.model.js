// models/matchListing.model.js
import mongoose from "mongoose";

const matchListingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skills: [{ type: String, required: true }],
  role: { type: String, enum: ["Tutor", "Learner"], required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("MatchListing", matchListingSchema);
