import { Message } from "../models/messageModel.js";

export const getLastMessageBetweenUsers = async (userA, userB) => {
  return await Message.findOne({
    $or: [
      { senderId: userA, receiverId: userB },
      { senderId: userB, receiverId: userA },
    ],
  })
    .sort({ createdAt: -1 })
    .select("message createdAt senderId receiverId emoji");
};

export const getLastMessageForGroup = async (groupId) => {
    return await Message.findOne({ receiverId: groupId })
      .sort({ createdAt: -1 })
      .select("message createdAt senderId receiverId emoji");
  };