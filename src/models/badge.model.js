import { mongoose,Schema } from "mongoose";

const badgeSchema = new Schema({
  name: String,
  description: String,
  iconUrl: String
}, { timestamps: true });

export const Badge = mongoose.model("Badge", badgeSchema);
