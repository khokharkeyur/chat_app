import mongoose from "mongoose";

const messageModel = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "receiverModel",
      required: true,
    },
    receiverModel: {
      type: String,
      enum: ["User", "Group"],
      required: true,
    },
    message: {
      type: String,
      required: false,
    },
    messageType: {
      type: String,
      enum: ["text", "media", "mixed"],
      default: "text",
    },
    media: [
      {
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["image", "video", "file"],
          required: true,
        },
        originalName: String,
        size: Number,
        mimeType: String,
        cloudinaryId: String,
        duration: Number,
      },
    ],
  },
  { timestamps: true },
);
export const Message = mongoose.model("Message", messageModel);
