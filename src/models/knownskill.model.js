import { mongoose, Schema } from "mongoose";


const knownskillSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
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
