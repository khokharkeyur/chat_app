import mongoose from "mongoose";

const conversationModel = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isGroup: { type: Boolean, default: false },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    lastMessageTime: { type: Date },
  },
  { timestamps: true },
);
export const Conversation = mongoose.model("Conversation", conversationModel);
