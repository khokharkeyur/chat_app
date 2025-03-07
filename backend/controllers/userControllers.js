import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import firebase from "../config/firebase.config.js";

export const register = async (req, res) => {
  try {
    const { fullName, username, password, confirmPassword, gender } = req.body;

    if (!fullName || !username || !password || !confirmPassword || !gender) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password do not match" });
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Username already exists, try a different one" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let profilePhoto;
    if (req.file) {
      const storageRef = firebase.storage().ref();
      const imageFileName = Date.now() + "-" + req.file.originalname;
      const fileRef = storageRef.child("images/" + imageFileName);

      await fileRef.put(req.file.buffer);
      profilePhoto = await fileRef.getDownloadURL();
    } else {
      profilePhoto =
        gender === "male"
          ? `https://avatar.iran.liara.run/public/boy?username=${username}`
          : `https://avatar.iran.liara.run/public/girl?username=${username}`;
    }
    await User.create({
      fullName,
      username,
      password: hashedPassword,
      profilePhoto,
      gender,
    });

    res.status(201).json({
      message: "Account created successfully.",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, username, gender, adminId } = req.body;

    if (!fullName || !username || !gender) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(adminId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.fullName = fullName;
    user.username = username;
    user.gender = gender;
    if (req.file) {
      if (
        user.profilePhoto &&
        !user.profilePhoto.includes("avatar.iran.liara.run")
      ) {
        const fileRef = firebase.storage().refFromURL(user.profilePhoto);
        await fileRef.delete();
      }

      const storageRef = firebase.storage().ref();
      const imageFileName = Date.now() + "-" + req.file.originalname;
      const fileRef = storageRef.child("images/" + imageFileName);

      await fileRef.put(req.file.buffer);
      user.profilePhoto = await fileRef.getDownloadURL();
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      success: true,
      user: {
        fullName: user.fullName,
        username: user.username,
        profilePhoto: user.profilePhoto,
        gender: user.gender,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { userId, newPassword, confirmPassword } = req.body;
    if (!userId || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password has been reset successfully.",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        message: "Incorrect username or password",
        success: false,
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect username or password",
        success: false,
      });
    }
    const tokenData = {
      userId: user._id,
    };

    const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });
    const refreshToken = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      token,
      refreshToken,
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      profilePhoto: user.profilePhoto,
    });
  } catch (error) {
    console.log(error);
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token missing." });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res.status(401).json({ message: "Invalid refresh token." });
  }
};

export const logout = (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "logged out successfully.",
    });
  } catch (error) {
    console.log(error);
  }
};
export const getOtherUsers = async (req, res) => {
  try {
    const loggedInUserId = req.id;
    const loggedInUser = await User.findById(loggedInUserId);
    if (!loggedInUser) {
      return res.status(404).json({ message: "Logged-in user not found" });
    }
    const blockedUsers = loggedInUser.blockedUsers || [];

    const otherUsers = await User.find({
      _id: { $ne: loggedInUserId, $nin: blockedUsers },
    }).select("-password");

    return res.status(200).json(otherUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAdminDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.findById(id).select("-password");

    if (!admin) {
      return res
        .status(404)
        .json({ message: "Admin not found", success: false });
    }

    return res.status(200).json({
      _id: admin._id,
      username: admin.username,
      fullName: admin.fullName,
      profilePhoto: admin.profilePhoto,
      gender: admin.gender,
      blockedUsers: admin.blockedUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const loggedInUserId = req.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userToBlock = await User.findById(userId);
    const loggedInUser = await User.findById(loggedInUserId);

    if (!userToBlock) {
      return res.status(404).json({ message: "User to block not found" });
    }

    if (loggedInUserId === userId) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }
    if (loggedInUser.blockedUsers.includes(userId)) {
      return res.status(400).json({ message: "User is already blocked" });
    }
    loggedInUser.blockedUsers.push(userId);
    await loggedInUser.save();

    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBlockedUsers = async (req, res) => {
  try {
    const loggedInUserId = req.id;

    const user = await User.findById(loggedInUserId).populate(
      "blockedUsers",
      "-password"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      blockedUsers: user.blockedUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const loggedInUserId = req.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const loggedInUser = await User.findById(loggedInUserId);

    if (!loggedInUser.blockedUsers.includes(userId)) {
      return res.status(400).json({ message: "User is not blocked" });
    }
    loggedInUser.blockedUsers = loggedInUser.blockedUsers.filter(
      (blockedUserId) => !blockedUserId.equals(userId)
    );
    await loggedInUser.save();

    res.status(200).json({ message: "User unblocked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
