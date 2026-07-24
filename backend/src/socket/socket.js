import { Server } from "socket.io";
import http from "http";
import express from "express";
import { Message } from "../models/messageModel.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (process.env.SOCKET_ORIGIN || "http://localhost:3000").split(","),
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;
  if (userId !== undefined) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on(
    "editMessage",
    async (messageId, newContent, emoji, emojiSender, removeEmoji) => {
      try {
        let updatedMessage;
        if (removeEmoji && emoji && emojiSender) {
          await Message.findByIdAndUpdate(messageId, {
            $pull: { emoji: { emoji, sender: emojiSender } },
          });
          updatedMessage = await Message.findById(messageId).populate(
            "emoji.sender",
            "username profilePhoto",
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
            "username profilePhoto",
          );
        } else if (newContent?.trim()) {
          updatedMessage = await Message.findByIdAndUpdate(
            messageId,
            { message: newContent },
            { new: true },
          );
        }

        if (updatedMessage) {
          io.emit("messageUpdated", updatedMessage);
        }
      } catch (error) {
        console.error("Error updating message:", error);
      }
    },
  );

  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    // User joined group
  });

  socket.on("typing:start", (payload) => {
    const {
      chatId,
      isGroup,
      receiverId,
      memberIds = [],
      senderId,
      senderName,
    } = payload || {};

    if (!chatId || !senderId) return;

    const typingPayload = {
      chatId,
      isGroup: !!isGroup,
      senderId,
      senderName,
      isTyping: true,
    };

    if (isGroup) {
      memberIds
        .filter(
          (memberId) => memberId && memberId.toString() !== senderId.toString(),
        )
        .forEach((memberId) => {
          const receiverSocketId = getReceiverSocketId(memberId.toString());
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("typingStatus", typingPayload);
          }
        });
      return;
    }

    if (receiverId) {
      const receiverSocketId = getReceiverSocketId(receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typingStatus", typingPayload);
      }
    }
  });

  socket.on("typing:stop", (payload) => {
    const {
      chatId,
      isGroup,
      receiverId,
      memberIds = [],
      senderId,
      senderName,
    } = payload || {};

    if (!chatId || !senderId) return;

    const typingPayload = {
      chatId,
      isGroup: !!isGroup,
      senderId,
      senderName,
      isTyping: false,
    };

    if (isGroup) {
      memberIds
        .filter(
          (memberId) => memberId && memberId.toString() !== senderId.toString(),
        )
        .forEach((memberId) => {
          const receiverSocketId = getReceiverSocketId(memberId.toString());
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("typingStatus", typingPayload);
          }
        });
      return;
    }

    if (receiverId) {
      const receiverSocketId = getReceiverSocketId(receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typingStatus", typingPayload);
      }
    }
  });

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
