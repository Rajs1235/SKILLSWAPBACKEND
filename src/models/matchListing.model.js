import mongoose from "mongoose";

const matchListingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  role: {
    type: String,
    enum: ["Tutor", "Learner"],
    required: true
  },
  skills: {
    type: [String],
    required: true
  }
}, { timestamps: true });

export default mongoose.model("MatchListing", matchListingSchema);
