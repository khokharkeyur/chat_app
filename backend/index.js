import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { app, server } from "./socket/socket.js";

import cookieParser from "cookie-parser";
import { setupRoutes } from "./routes/index.js";

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
    setupRoutes(app)
});

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

server.listen(PORT, () => {
  console.log(`Server Start at port ${PORT}`);
});
