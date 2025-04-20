import express from "express";
import {
  deleteMessage,
  editMessage,
  getMessage,
  sendMessage,
  getGroupMessage,
} from "../controllers/messageControllers.js";

const router = express.Router();

router.route("/send/:id").post(sendMessage);
router.route("/:id").get(getMessage);
router.get("/group/:groupId", getGroupMessage);
router.delete("/delete/:messageId", deleteMessage);
router.put("/edit/:messageId", editMessage);

export default router;
