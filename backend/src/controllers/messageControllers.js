import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";
import { Group } from "../models/groupModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

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
      const membersToSend = group.members.filter(
        (member) => member.toString() !== senderId
      );

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

      membersToSend.forEach((memberId) => {
        const receiverSocketId = getReceiverSocketId(memberId.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", {
            ...newMessage.toObject(),
            type: "group",
            groupId: group._id,
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
    console.log("receiverId", receiverId);
    console.log("senderId", senderId);
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
      isGroup: false,
    }).populate("messages");
    console.log(conversation, "conversation");

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
    }).populate("messages");

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

    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("deleteMessage", { messageId });
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
    const { message: newMessageContent, emoji } = req.body;
    const updateData = {};
    if (newMessageContent?.trim()) updateData.message = newMessageContent;
    if (emoji) updateData.emoji = emoji;

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      updateData,
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    const receiverSocketId = getReceiverSocketId(updatedMessage.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("editMessage", updatedMessage);
    }

    return res.status(200).json({ updatedMessage });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};
