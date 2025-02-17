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

  socket.on("editMessage", async (messageId, newContent) => {
    try {
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { message: newContent },
        { new: true }
      );

      io.emit("messageUpdated", updatedMessage);
    } catch (error) {
      console.error("Error updating message:", error);
    }
  });

  socket.on("deleteMessage", async (messageId) => {
    try {
      const deletedMessage = await Message.findByIdAndDelete(messageId);

      io.emit("messageDeleted", deletedMessage);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  });

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
