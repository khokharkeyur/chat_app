import express from "express";
import {
  createGroup,
  getAllGroups,
  deleteGroup,
  removeMemberFromGroup,
  addMembersToGroup,
} from "../controllers/groupController.js";

const router = express.Router();

router.post("/create", createGroup);
router.delete("/:id", deleteGroup);
router.get("/", getAllGroups);
router.post("/remove-member", removeMemberFromGroup);
router.post("/add-members/:groupId", addMembersToGroup);

export default router;
