import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import firebase from "../config/firebase.config.js";
import { SMTPClient } from "emailjs";
import { getLastMessageBetweenUsers } from "../utils/lastMessage.js";

const client = new SMTPClient({
  user: process.env.USER_EMAIL,
  password: process.env.USER_PASSWORD,
  host: "smtp.gmail.com",
  ssl: true,
});

export const register = async (req, res) => {
  try {
    const { fullName, username, password, confirmPassword, gender, email } =
      req.body;

    if (
      !fullName ||
      !username ||
      !password ||
      !confirmPassword ||
      !gender ||
      !email
    ) {
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
      const avatarColor = getColorFromString(username);
      profilePhoto = `https://ui-avatars.com/api/?name=${username}&background=${avatarColor}&color=ffffff`;
    }
    await User.create({
      fullName,
      username,
      password: hashedPassword,
      profilePhoto,
      gender,
      email,
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
    const { userId, email, otp, newPassword, confirmPassword } = req.body;
    if ((!userId && !email) || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    let user;

    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email });
      if (!user || !user.otp) {
        return res.status(404).json({ message: "User or OTP not found" });
      }
      if (user.otpExpireAt < Date.now()) {
        return res.status(400).json({ message: "OTP expired" });
      }
      if (user.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = null;
    user.otpExpireAt = null;

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

    const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
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
    return res.status(500).json({ message: "Server error" });
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
      { expiresIn: "1d" },
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
    return res.status(500).json({ message: "Server error" });
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

    const usersWithLastMessage = await Promise.all(
      otherUsers.map(async (user) => {
        const lastMessage = await getLastMessageBetweenUsers(
          loggedInUserId,
          user._id,
        );
        return {
          ...user.toObject(),
          lastMessage: lastMessage
            ? { message: lastMessage.message, createdAt: lastMessage.createdAt }
            : null,
        };
      }),
    );

    return res.status(200).json(usersWithLastMessage);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
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
      email: admin.email,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
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
    return res.status(500).json({ message: "Server error" });
  }
};

export const getBlockedUsers = async (req, res) => {
  try {
    const loggedInUserId = req.id;

    const user = await User.findById(loggedInUserId).populate(
      "blockedUsers",
      "-password",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      blockedUsers: user.blockedUsers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
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
      (blockedUserId) => !blockedUserId.equals(userId),
    );
    await loggedInUser.save();

    res.status(200).json({ message: "User unblocked successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpireAt = Date.now() + 5 * 60 * 1000;

    await user.save();
    const message = {
      text: `Hello ${user.fullName}, your OTP is: ${otp}`,
      from: `chatApp <${process.env.USER_EMAIL}>`,
      to: `${user.fullName} <${email}>`,
      subject: "Your OTP Code",
    };

    client.send(message, (err, message) => {
      if (err) {
        console.error("Email send error:", err);
        return res.status(500).json({ message: "Failed to send email" });
      }

      return res.status(200).json({
        success: true,
        message: "OTP sent to your email successfully",
      });
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
    const user = await User.findOne({ email });
    if (!user || !user.otp) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (user.otpExpireAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
