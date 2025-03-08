import express from "express";
import {
  deleteMessage,
  editMessage,
  getMessage,
  sendMessage,
} from "../controllers/messageControllers.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.route("/send/:id").post(isAuthenticated, sendMessage);
router.route("/:id").get(isAuthenticated, getMessage);
router.delete("/delete/:messageId", deleteMessage);
router.put("/edit/:messageId", editMessage);

export default router;
