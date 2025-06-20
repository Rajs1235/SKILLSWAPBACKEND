import {mongoose,Schema} from "mongoose";

const userskillSchema=new Schema({
username:{
    type:String,
        required:true,
        unique:true,
        lowercase:true,
        index:true,
        trim:true
},
skills:{
    type:[{
        type:Schema.Types.ObjectId,
        ref:"Skills"
    }],
   
}
}
,{timestamps:true})

export const UserSkill=new mongoose.Schema("UserSkill",userskillSchema);