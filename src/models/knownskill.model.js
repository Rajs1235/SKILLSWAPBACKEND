import { mongoose, Schema } from "mongoose";

const knownskillSchema = new Schema({
    username: {
        type: String,
        required: true,
        lowercase: true,
        index: true,
        trim: true
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

export const KnownSkill = mongoose.model("KnownSkill", knownskillSchema);
