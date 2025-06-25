import mongoose from "mongoose";
const { Schema } = mongoose;

const MessageSchema = new Schema(
    {
        conversation: { 
            type: Schema.Types.ObjectId, 
            ref: "Conversation", 
            required: true 
        },
        sender: { 
            type: Schema.Types.ObjectId, 
            ref: "User",
            required: true
        },
        content: {
            type: String,
            required: true 
        },
        messageType: { 
            type: String,
            enum: ["text", "image"],
            default: "text"
         },
        readBy: [
            { 
            type: Schema.Types.ObjectId,
            ref: "User"
            }
        ],
    }
    , { timestamps: true })


 const Message = mongoose.model("message", MessageSchema);
 export default Message;