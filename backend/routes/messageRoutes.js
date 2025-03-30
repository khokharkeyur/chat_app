import express from "express";
import {
  deleteMessage,
  editMessage,
  getMessage,
  sendMessage,
} from "../controllers/messageControllers.js";

const router = express.Router();

router.route("/send/:id").post(sendMessage);
router.route("/:id").get(getMessage);
router.delete("/delete/:messageId", deleteMessage);
router.put("/edit/:messageId", editMessage);

export default router;
