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
} from "../controllers/userControllers.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import upload from "../utils/upload.js";

const router = express.Router();

router.route("/register").post(upload.single("image"), register);
router.route("/login").post(login);
router.route("/refreshToken").post(refreshToken); 
router.route("/logout").get(logout);
router.route("/").get(isAuthenticated, getOtherUsers);
router.route("/admin/:id").get(isAuthenticated, getAdminDetails);
router
  .route("/profile/update")
  .put(isAuthenticated, upload.single("image"), updateProfile);
router.route("/resetPassword").put(isAuthenticated, resetPassword);

router.route("/block").put(isAuthenticated, blockUser);

export default router;
