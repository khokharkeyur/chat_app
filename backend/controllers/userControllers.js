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
        return res.status(400).json({ message: "Username already exists, try a different one" });
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
        profilePhoto = gender === "male" 
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
      const { fullName, username, gender,adminId } = req.body;
  
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

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        };
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect username or password",
                success: false
            })
        };
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect username or password",
                success: false
            })
        };
        const tokenData = {
            userId: user._id
        };

        const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' }).json({
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
            profilePhoto: user.profilePhoto
        });

    } catch (error) {
        console.log(error);
    }
}
export const logout = (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "logged out successfully."
        })
    } catch (error) {
        console.log(error);
    }
}
export const getOtherUsers = async (req, res) => {
    try {
        const loggedInUserId = req.id;
        const otherUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        return res.status(200).json(otherUsers);
    } catch (error) {
        console.log(error);
    }
}

export const getAdminDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.findById(id).select('-password');

    if (!admin) {
      return res.status(404).json({ message: "Admin not found", success: false });
    }

    return res.status(200).json({
      _id: admin._id,
      username: admin.username,
      fullName: admin.fullName,
      profilePhoto: admin.profilePhoto,
      gender: admin.gender,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
