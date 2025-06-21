import { mongoose, Schema } from "mongoose";

const feedbackSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
        trim: true
    },
    context: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
        trim: true
    },
    content: {
        required: true,
        unique: true,
        index: true,

    },
    submittedAt: {
        type: String,
        required: true,
        index: true,
    },
}, { timestamps: true })

export const feedback = mongoose.model("feedback", feedbackSchema)