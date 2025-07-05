import mongoose from "mongoose";

const matchListingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  }
}, { timestamps: true });

export default mongoose.model("MatchListing", matchListingSchema);
