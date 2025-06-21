import { mongoose, Schema } from "mongoose";

const progressSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
        trim: true
    },
    hoursspent: {
        type: Number,
        required: true
    },
    percentageComplete: {
        type: Decimal128,
        required: true
    }
},
    { timestamps: true })

export const ProgressSchema = mongoose.model("progress", progressSchema);