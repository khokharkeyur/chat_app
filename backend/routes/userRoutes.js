import express from "express";
import {
  resetPassword,
  getAdminDetails,
  getOtherUsers,
  login,
  logout,
  register,
  updateProfile,
  refreshToken,
  blockUser,
  getBlockedUsers,
  unblockUser,
} from "../controllers/userControllers.js";
import upload from "../utils/upload.js";

const router = express.Router();

router.post("/register", upload.single("image"), register);
router.post("/login", login);
router.post("/refreshToken", refreshToken);
router.get("/logout", logout);
router.get("/", getOtherUsers);
router.get("/admin/:id", getAdminDetails);
router.put("/profile/update", upload.single("image"), updateProfile);
router.put("/resetPassword", resetPassword);
router.put("/block", blockUser);
router.put("/unBlock", unblockUser);
router.get("/blockedUsers", getBlockedUsers);

export default router;
