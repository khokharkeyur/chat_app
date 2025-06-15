import { Group } from "../models/groupModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const createGroup = async (req, res) => {
  try {
    const { groupName, memberIds, adminId } = req.body;
    if (!groupName) {
      return res.status(400).json({ message: "Group name is required" });
    }
    if (!memberIds || memberIds.length === 1) {
      return res
        .status(400)
        .json({ message: "At least one member ID is required" });
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

    const populatedGroup = await Group.findById(newGroup._id).populate({
      path: "members",
      select: "-password -blockedUsers -__v",
    });

    memberIds.forEach((memberId) => {
      const memberSocketId = getReceiverSocketId(memberId.toString());
      if (memberSocketId) {
        io.to(memberSocketId).emit("groupCreated", populatedGroup);
      }
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
    const populatedGroup = await Group.findById(id).populate({
      path: "members",
      select: "-password -blockedUsers -__v",
    });
    deletedGroup.members.forEach((memberId) => {
      const memberSocketId = getReceiverSocketId(memberId.toString());
      if (memberSocketId) {
        io.to(memberSocketId).emit("groupDeleted", { groupId: id });
      }
    });

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

    const populatedGroup = await Group.findById(groupId).populate({
      path: "members",
      select: "-password -blockedUsers -__v",
    });

    const removedMemberSocketId = getReceiverSocketId(memberId);
    if (removedMemberSocketId) {
      io.to(removedMemberSocketId).emit("memberRemoved", {
        groupId,
        memberId,
        updatedGroup: populatedGroup,
      });
    }
    group.members.forEach((remainingMemberId) => {
      const memberSocketId = getReceiverSocketId(remainingMemberId.toString());
      if (memberSocketId) {
        io.to(memberSocketId).emit("memberRemoved", {
          groupId,
          memberId,
          updatedGroup: populatedGroup,
        });
      }
    });
    return res.status(200).json({
      message: "Member removed successfully",
      group,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addMembersToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body; // Expecting an array of member IDs

    if (!groupId || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Group ID and memberIds array are required" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Add only new members (avoid duplicates)
    const newMembers = memberIds.filter(
      (id) => !group.members.map((m) => m.toString()).includes(id)
    );
    group.members.push(...newMembers);

    await group.save();

    const populatedGroup = await Group.findById(groupId).populate({
      path: "members",
      select: "-password -blockedUsers -__v",
    });

    // Notify newly added members
    newMembers.forEach((memberId) => {
      const memberSocketId = getReceiverSocketId(memberId.toString());
      if (memberSocketId) {
        io.to(memberSocketId).emit("memberAdded", {
          groupId,
          memberId,
          updatedGroup: populatedGroup,
        });
      }
    });

    // Notify all group members (including existing) about the update
    group.members.forEach((memberId) => {
      const memberSocketId = getReceiverSocketId(memberId.toString());
      if (memberSocketId) {
        io.to(memberSocketId).emit("groupUpdated", {
          groupId,
          updatedGroup: populatedGroup,
        });
      }
    });

    return res.status(200).json({
      message: "Members added successfully",
      group: populatedGroup,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllGroups = async (req, res) => {
  try {
    const userId = req.id
    const groups = await Group.find({members: userId}).populate({
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
