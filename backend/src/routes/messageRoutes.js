import express from "express";
import {
  deleteMessage,
  editMessage,
  getMessage,
  sendMessage,
  getGroupMessage,
  uploadFiles,
} from "../controllers/messageControllers.js";
import upload from "../utils/upload.js";

const router = express.Router();

router.route("/send/:id").post(sendMessage);
router.route("/upload").post(upload.array("files", 10), uploadFiles);
router.route("/:id").get(getMessage);
router.get("/group/:groupId", getGroupMessage);
router.delete("/delete/:messageId", deleteMessage);
router.put("/edit/:messageId", editMessage);

export default router;
