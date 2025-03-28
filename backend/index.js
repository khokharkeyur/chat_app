import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoute from "./routes/userRoutes.js";
import messageRoute from "./routes/messageRoutes.js";
import groupRouter from "./routes/groupRoutes.js";
import cors from "cors";
import { app, server } from "./socket/socket.js";

import cookieParser from "cookie-parser";

dotenv.config();

const PORT = process.env.PORT;

const url = "mongodb://127.0.0.1:27017/chatApp";

// Connect to MongoDB
mongoose.connect(url);
const db = mongoose.connection;

db.on("error", (error) => {
  console.error("Database connection error:", error);
});

db.once("open", () => {
  console.log("Connected to MongoDB");
  //   setupRoute(app)
});

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRoute);
app.use("/api/message", messageRoute);
app.use("/api/group", groupRouter);

server.listen(PORT, () => {
  console.log(`Server Start at port ${PORT}`);
});
