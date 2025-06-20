import { Server } from "socket.io";
import http from "http";
import express from "express";
import { Message } from "../models/messageModel.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId !== undefined) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on(
    "editMessage",
    async (messageId, newContent, emoji, emojiSender,removeEmoji) => {
      try {
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
        } else if (newContent?.trim()) {
          updatedMessage = await Message.findByIdAndUpdate(
            messageId,
            { message: newContent },
            { new: true }
          );
        }
  
        if (updatedMessage) {
          io.emit("messageUpdated", updatedMessage);
        }
      } catch (error) {
        console.error("Error updating message:", error);
      }
    }
  );
  socket.on("deleteMessage", async (messageId) => {
    try {
      const deletedMessage = await Message.findByIdAndDelete(messageId);

      io.emit("messageDeleted", deletedMessage);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  });

  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`User ${userId} joined group ${groupId}`);
  });

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
