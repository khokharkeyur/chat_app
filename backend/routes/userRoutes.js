import express from 'express'
import { resetPassword, getAdminDetails,getOtherUsers, login, logout, register, updateProfile } from '../controllers/userControllers.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
import upload from '../utils/upload.js';

const router = express.Router();

router.route("/register").post(upload.single("image"), register);
router.route("/login").post(login)
router.route("/logout").get(logout)
router.route("/").get(isAuthenticated,getOtherUsers)
router.route("/admin/:id").get(isAuthenticated, getAdminDetails); 
router.route("/profile/update").put(isAuthenticated, upload.single("image"), updateProfile);
router.route("/resetPassword").put(resetPassword);

export default router;