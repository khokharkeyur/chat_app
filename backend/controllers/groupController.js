import { Group } from "../models/groupModel.js";

export const createGroup = async (req, res) => {
  try {
    const { groupName, memberIds, adminId } = req.body;
    if (!groupName || !memberIds || !Array.isArray(memberIds)) {
      return res
        .status(400)
        .json({ message: "Group name and member IDs are required" });
    }
    const existingGroup = await Group.findOne({ name: groupName });
    if (existingGroup) {
      return res.status(400).json({ message: "Group name already exists" });
    }
    const groupProfilePhoto = `https://avatar.iran.liara.run/public/boy?username=${encodeURIComponent(
      groupName
    )}`;
    const newGroup = await Group.create({
      name: groupName,
      members: memberIds,
      admin: adminId,
      profilePhoto: groupProfilePhoto,
    });

    return res.status(201).json({
      message: "Group created successfully",
      group: newGroup,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Group ID is required" });
    }

    const deletedGroup = await Group.findByIdAndDelete(id);
    if (!deletedGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    return res.status(200).json({
      message: "Group deleted successfully",
      group: deletedGroup,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const removeMemberFromGroup = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;

    if (!groupId || !memberId) {
      return res
        .status(400)
        .json({ message: "Group ID and Member ID are required" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    group.members = group.members.filter(
      (member) => member.toString() !== memberId
    );

    await group.save();

    return res.status(200).json({
      message: "Member removed successfully",
      group,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate({
      path: "members",
      select: "-password -blockedUsers -__v",
    });
    return res.status(200).json({
      message: "Groups retrieved successfully",
      groups,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
