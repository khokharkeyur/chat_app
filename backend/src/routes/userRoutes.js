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
  sendOtp,
  verifyOtp,
} from "../controllers/userControllers.js";
import { authLimiter, otpLimiter } from "../middleware/rateLimiter.js";
import upload from "../utils/upload.js";

const router = express.Router();

router.post("/register", authLimiter, upload.single("image"), register);
router.post("/login", authLimiter, login);
router.post("/refreshToken", authLimiter, refreshToken);
router.get("/logout", logout);
router.get("/", getOtherUsers);
router.get("/admin/:id", getAdminDetails);
router.put("/profile/update", upload.single("image"), updateProfile);
router.put("/resetPassword", authLimiter, resetPassword);
router.put("/block", blockUser);
router.put("/unblock", unblockUser);
router.get("/blockedUsers", getBlockedUsers);
router.post("/sendOtp", otpLimiter, sendOtp);
router.post("/verifyOtp", otpLimiter, verifyOtp);

export default router;
