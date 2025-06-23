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
    skillId:{
       type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
        trim: true  
    }, userId:{
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
        type: Number,
        min:0,
        max:100,
        required: true
    }
},
    { timestamps: true })

export const Progress= mongoose.model("progress", progressSchema);