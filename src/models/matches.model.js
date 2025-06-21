import { mongoose, Schema } from "mongoose";

const matchesSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
        trim: true
    },
    matches: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        required: true
    }
}
    , { timestamps: true })

export const Matches = mongoose.model("Match", matchesSchema);