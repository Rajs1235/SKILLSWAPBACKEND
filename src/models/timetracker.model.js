import { mongoose,Schema } from "mongoose";

const timetrackerSchema=new Schema({
username:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    index:true,
    trim:true
},
starttime:{
    type:Number,
    required:true
},
endtime:{
    type:Number,
    required:true
}
},{timestamps:true})

export const timetracker=mongoose.model("timetracker",timetrackerSchema)