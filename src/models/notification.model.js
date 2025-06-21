import { mongoose, Schema } from "mongoose";

const notificationSchema = new Schema({
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
    isRead: {
        type: Boolean,
        required: true,
        index: true,

    },
    createdAt: {
        type: String,
        required: true,
        index: true,

    },
}, { timestamps: true })

export const notification = mongoose.model("notification", notificationSchema)