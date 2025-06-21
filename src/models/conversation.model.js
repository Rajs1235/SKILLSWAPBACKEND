import { mongoose, Schema } from "mongoose";

const conversationSchema = new Schema(
    {
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true
            }
        ],

        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
        isGroup: {
            type: Boolean,
            default: false,
        },
        name: {
            type: String,
            default: null,
        },

    },
    { timestamps: true }

)

export const conversation = mongoose.model("conversation", conversationSchema);