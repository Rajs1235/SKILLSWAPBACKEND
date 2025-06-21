import { mongoose, Schema } from "mongoose";

const badgesSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
        trim: true
    },
    badges: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        required: true
    }
}, { timestamps: true })

export const badges = mongoose.model("badges", badgesSchema)