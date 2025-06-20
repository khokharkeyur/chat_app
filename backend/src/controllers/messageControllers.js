import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";
import { Group } from "../models/groupModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import {
  getLastMessageBetweenUsers,
  getLastMessageForGroup,
} from "../utils/lastMessage.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { message, type } = req.body;
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    const group = await Group.findById(receiverId);
    let newMessage;

    if (group && type === "group") {
      newMessage = await Message.create({
        senderId,
        receiverId,
        message,
      });

      let gotConversation = await Conversation.findOne({
        participants: { $all: group.members, $size: group.members.length },
      });

      if (!gotConversation) {
        gotConversation = await Conversation.create({
          participants: group.members,
          isGroup: true,
          groupId: group._id,
        });
      }

      gotConversation.messages.push(newMessage._id);
      await Promise.all([gotConversation.save(), newMessage.save()]);
      const lastMessage = await getLastMessageForGroup(receiverId);
      const allMembers = group.members;
      allMembers.forEach((memberId) => {
        const receiverSocketId = getReceiverSocketId(memberId.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", {
            ...newMessage.toObject(),
            type: "group",
            groupId: group._id,
          });
          io.to(receiverSocketId).emit("lastMessageUpdated", {
            groupId: group._id,
            lastMessage,
            type: "group",
          });
        }
      });
    } else {
      let gotConversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
        isGroup: false,
      });

      if (!gotConversation) {
        gotConversation = await Conversation.create({
          participants: [senderId, receiverId],
          isGroup: false,
        });
      }

      newMessage = await Message.create({
        senderId,
        receiverId,
        message,
      });

      gotConversation.messages.push(newMessage._id);
      await Promise.all([gotConversation.save(), newMessage.save()]);

      const lastMessage = await getLastMessageBetweenUsers(
        senderId,
        receiverId
      );
      [senderId, receiverId].forEach((uid) => {
        const socketId = getReceiverSocketId(uid.toString());
        if (socketId) {
          io.to(socketId).emit("lastMessageUpdated", {
            userId: uid === senderId ? receiverId : senderId,
            lastMessage,
          });
        }
      });
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", {
          ...newMessage.toObject(),
          type: "user",
        });
      }
    }

    return res.status(201).json({ newMessage });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
};
export const getMessage = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.id;
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
      isGroup: false,
    }).populate({
      path: "messages",
      populate: {
        path: "emoji.sender",
        select: "username profilePhoto",
      },
    });

    return res.status(200).json(conversation?.messages);
  } catch (error) {
    console.log(error);
  }
};

export const getGroupMessage = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    let conversation = await Conversation.findOne({
      groupId: groupId,
      isGroup: true,
    }).populate({
      path: "messages",
      populate: {
        path: "emoji.sender",
        select: "username profilePhoto",
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: group.members,
        groupId: group._id,
        isGroup: true,
        messages: [],
      });
    }

    res.status(200).json(conversation.messages || []);
  } catch (error) {
    console.error("Error in getGroupMessage:", error);
    res.status(500).json({ error: "Failed to get group messages" });
  }
};
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    await Conversation.updateOne(
      { messages: messageId },
      { $pull: { messages: messageId } }
    );

    await Message.findByIdAndDelete(messageId);

    const conversation = await Conversation.findOne({ messages: messageId });
    const isGroup = conversation?.isGroup;
    console.log("isGroup", isGroup);
    if (isGroup) {
      const group = await Group.findById(message.receiverId);
      if (group) {
        const lastMessage = await getLastMessageForGroup(message.receiverId);
        group.members.forEach((memberId) => {
          const socketId = getReceiverSocketId(memberId.toString());
          if (socketId) {
            io.to(socketId).emit("deleteMessage", { messageId });
            io.to(socketId).emit("lastMessageUpdated", {
              groupId: message.receiverId,
              lastMessage,
              type: "group",
            });
          }
        });
      }
    } else {
      const { senderId, receiverId } = message;
      const lastMessage = await getLastMessageBetweenUsers(
        senderId,
        receiverId
      );
      [senderId, receiverId].forEach((uid) => {
        const socketId = getReceiverSocketId(uid.toString());
        if (socketId) {
          io.to(socketId).emit("deleteMessage", { messageId });
          io.to(socketId).emit("lastMessageUpdated", {
            userId: uid === senderId ? receiverId : senderId,
            lastMessage,
            type: "user",
          });
        }
      });
    }

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const {
      message: newMessageContent,
      emoji,
      emojiSender,
      removeEmoji,
    } = req.body;
    let updatedMessage;

    if (removeEmoji && emoji && emojiSender) {
      await Message.findByIdAndUpdate(messageId, {
        $pull: { emoji: { emoji, sender: emojiSender } },
      });
      updatedMessage = await Message.findById(messageId).populate(
        "emoji.sender",
        "username profilePhoto"
      );
    } else if (emoji && emojiSender) {
      await Message.findByIdAndUpdate(messageId, {
        $pull: { emoji: { sender: emojiSender } },
      });
      await Message.findByIdAndUpdate(messageId, {
        $push: { emoji: { emoji, sender: emojiSender } },
      });
      updatedMessage = await Message.findById(messageId).populate(
        "emoji.sender",
        "username profilePhoto"
      );
    } else if (newMessageContent?.trim()) {
      updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { message: newMessageContent },
        { new: true }
      );
    }

    if (updatedMessage) {
      const conversation = await Conversation.findOne({ messages: messageId });
      const isGroup = conversation?.isGroup;

      if (isGroup) {
        const group = await Group.findById(updatedMessage.receiverId);
        if (group) {
          const lastMessage = await getLastMessageForGroup(
            updatedMessage.receiverId
          );
          group.members.forEach((memberId) => {
            const socketId = getReceiverSocketId(memberId.toString());
            if (socketId) {
              io.to(socketId).emit("messageUpdated", updatedMessage);
              if (newMessageContent?.trim()) {
                io.to(socketId).emit("lastMessageUpdated", {
                  groupId: updatedMessage.receiverId,
                  lastMessage,
                  type: "group",
                });
              }
            }
          });
        }
      } else {
        const { senderId, receiverId } = updatedMessage;
        const lastMessage = await getLastMessageBetweenUsers(
          senderId,
          receiverId
        );
        [senderId, receiverId].forEach((uid) => {
          const socketId = getReceiverSocketId(uid.toString());
          if (socketId) {
            io.to(socketId).emit("messageUpdated", updatedMessage);
            if (newMessageContent?.trim()) {
              io.to(socketId).emit("lastMessageUpdated", {
                userId: uid === senderId ? receiverId : senderId,
                lastMessage,
                type: "user",
              });
            }
          }
        });
      }
    }

    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    return res.status(200).json({ updatedMessage });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};
