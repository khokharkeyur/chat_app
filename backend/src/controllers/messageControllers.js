import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";
import { Group } from "../models/groupModel.js";
import { Emoji } from "../models/emojiModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import {
  getLastMessageBetweenUsers,
  getLastMessageForGroup,
} from "../utils/lastMessage.js";
import {
  getConversationMessagesAgg,
  getMessageWithEmojisAgg,
} from "../aggregations/messageAggregations.js";

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

    let gotConversation = await Conversation.findOne({
      groupId: receiverId,
    });

    if (group && type === "group") {
      if (!gotConversation) {
        gotConversation = await Conversation.create({
          participants: group.members,
          isGroup: true,
          groupId: group._id,
        });
      }

      newMessage = await Message.create({
        senderId,
        conversationId: gotConversation._id,
        receiverId,
        message,
      });

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
        conversationId: gotConversation._id,
        senderId,
        receiverId,
        message,
      });

      gotConversation.lastMessage = newMessage._id;
      await gotConversation.save();

      const lastMessage = await getLastMessageBetweenUsers(
        senderId,
        receiverId,
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
    });

    if (!conversation) {
      return res.status(200).json([]);
    }

    const messagesWithEmojis = await Message.aggregate(
      getConversationMessagesAgg(conversation._id),
    );

    return res.status(200).json(messagesWithEmojis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get messages" });
  }
};

export const getGroupMessage = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (!group.members.includes(userId.toString())) {
      return res
        .status(403)
        .json({ error: "You are not a member of this group" });
    }

    let conversation = await Conversation.findOne({
      groupId: groupId,
      isGroup: true,
    });

    if (!conversation) {
      return res.status(200).json([]);
    }

    const messagesWithEmojis = await Message.aggregate(
      getConversationMessagesAgg(conversation._id),
    );

    res.status(200).json(messagesWithEmojis);
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

    await Emoji.deleteMany({ messageId });

    const conversation = await Conversation.findById(message.conversationId);
    const isGroup = conversation?.isGroup;

    await Message.findByIdAndDelete(messageId);

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
        receiverId,
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
    const senderId = req.id;

    const { message: newMessageContent, emoji, removeEmoji } = req.body;

    // 1️⃣ REMOVE EMOJI
    if (removeEmoji && emoji) {
      await Emoji.findOneAndDelete({
        messageId,
        senderId,
      });
    }

    // 2️⃣ ADD / UPDATE EMOJI
    if (emoji && !removeEmoji) {
      await Emoji.findOneAndUpdate(
        { messageId, senderId },
        { emoji },
        { upsert: true },
      );
    }

    // 3️⃣ UPDATE MESSAGE TEXT
    if (newMessageContent?.trim()) {
      await Message.findByIdAndUpdate(messageId, {
        message: newMessageContent,
      });
    }

    // 4️⃣ AGGREGATION → FINAL MESSAGE PAYLOAD
    const [updatedMessage] = await Message.aggregate(
      getMessageWithEmojisAgg(messageId),
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    // 5️⃣ SOCKET LOGIC (UNCHANGED)
    const message = await Message.findById(messageId);

    const conversation = await Conversation.findById(message.conversationId);
    const isGroup = conversation?.isGroup;

    if (isGroup) {
      const group = await Group.findById(updatedMessage.receiverId);
      if (group) {
        const lastMessage = await getLastMessageForGroup(
          updatedMessage.receiverId,
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
        receiverId,
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

    return res.status(200).json({ updatedMessage });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};
