import { mongoose, Schema } from "mongoose";

const targetskillSchema = new Schema({
    username: {
        type: String,
        required: true,
        lowercase: true,
        index: true,
        trim: true
    },
    userId:{
       type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true 
    },
    skills: [{
        skill: {
            type: String,
            required: true
        },
        level: {
            type: Number, required: true, min: 0, max: 5
        }
    }]
}
    , { timestamps: true })

export const TargetSkill = mongoose.model("targetSkill", targetskillSchema);