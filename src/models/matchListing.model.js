// models/matchListing.model.js
import mongoose, { Schema } from "mongoose";

const matchListingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
    },
    skills: [
      {
        type: String,
      },
    ],
    avatar: {
      type: String, // optional: pull from User later
    },
  },
  { timestamps: true }
);

export const MatchListing = mongoose.model("MatchListing", matchListingSchema);
