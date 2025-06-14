import React, { useEffect, useRef, useState } from "react";
import axiosInterceptors from "../components/app/axiosInterceptors";
import toast from "react-hot-toast";
import deleteIcon from "../assets/delete.png";
import { useDispatch, useSelector } from "react-redux";
import { setGroups, updateSelectedUser } from "../redux/userSlice";
import DialogWrapper from "./DialogWrapper";

const CommanGroupModal = ({
  selectedUser,
  authUser,
  otherUsers,
  groupName,
  setGroupName,
  groupMember,
  setGroupMember,
  createGroup,
}) => {
  const dispatch = useDispatch();
  const Groups = useSelector((store) => store.user.groups);
  const [isAddMemberMode, setIsAddMemberMode] = useState(false);

  const deleteGroup = async (groupId) => {
    if (!groupId) return;
    try {
      const response = await axiosInterceptors.delete(`/group/${groupId}`);
      const updatedGroups = Groups?.filter((group) => group._id !== groupId);
      dispatch(setGroups(updatedGroups));
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error deleting group:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete group";
      toast.error(errorMessage);
    }
  };

  const removeMemberFromGroup = async (groupId, memberId) => {
    if (!groupId || !memberId) return;
    try {
      const response = await axiosInterceptors.delete(
        `/group/${groupId}/member/${memberId}`
      );

      toast.success(response.data.message);
    } catch (error) {
      console.error("Error removing member:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to remove member";
      toast.error(errorMessage);
    }
  };

  const addMembersToGroup = async () => {
    const existingIds = selectedUser?.members?.map((m) => m._id) || [];
    const newMemberIds = groupMember
      .map((m) => m._id)
      .filter((id) => !existingIds.includes(id));

    if (!selectedUser?._id || newMemberIds.length === 0) {
      toast.error("No new members selected.");
      return;
    }

    try {
      const res = await axiosInterceptors.post(
        `/group/add-members/${selectedUser._id}`,
        { memberIds: newMemberIds }
      );
      toast.success(res.data.message || "Members added!");
      setIsAddMemberMode(false);
      setGroupMember([]);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add members to group"
      );
    }
  };

  const userclick = (user) => {
    setGroupMember((prevGroupMember) => {
      if (prevGroupMember.some((member) => member._id === user._id)) {
        return prevGroupMember;
      }
      return [...prevGroupMember, user];
    });
  };

  const removeMember = (userToRemove) => {
    setGroupMember((prevGroupMember) =>
      prevGroupMember.filter((user) => user._id !== userToRemove._id)
    );
  };

  const GroupMemberIsAuthUser = selectedUser?.members?.find(
    (member) => member?.fullName === authUser?.fullName
  );

  return (
    <DialogWrapper
      id="my_modal_5"
      onClose={() => {
        setGroupMember([]);
        setGroupName("");
        setIsAddMemberMode(false);
      }}
    >
      <div>
        {selectedUser?.members?.length > 0 && !isAddMemberMode ? (
          <>
            <div className="flex flex-col">
              <img
                src={selectedUser?.profilePhoto}
                alt=""
                className="w-12 rounded-full m-auto"
              />
              <p className="pt-2 m-auto">{selectedUser?.name}</p>
            </div>
            <div>
              <span>Group Members</span>
              {selectedUser?.members?.map((member) => (
                <div
                  key={member._id}
                  className="w-full rounded-full flex justify-between mx-3 my-3"
                >
                  <div className="flex">
                    <img
                      src={member?.profilePhoto}
                      alt=""
                      className="mr-4 w-12"
                    />
                    <p className="pt-2 pb-4">
                      {member?.fullName === GroupMemberIsAuthUser?.fullName
                        ? "You"
                        : member?.fullName}
                    </p>
                  </div>
                  <button
                    className={`btn ${
                      selectedUser?.admin === authUser?._id ? "" : "hidden"
                    } ${selectedUser?.admin === member?._id ? "hidden" : ""}`}
                    onClick={() =>
                      removeMemberFromGroup(selectedUser?._id, member._id)
                    }
                  >
                    Remove Member
                  </button>
                  <button
                    className={`btn ${
                      selectedUser?.admin === authUser?._id ? "hidden" : ""
                    } ${selectedUser?.admin === member?._id ? "" : "hidden"}`}
                  >
                    Admin
                  </button>
                </div>
              ))}
            </div>
            <div className="modal-action">
              <form method="dialog">
                <button
                  className="btn"
                  onClick={() => {
                    setGroupMember([]);
                  }}
                >
                  Close
                </button>
                <button
                  className={`btn ml-3 ${
                    selectedUser?.admin === authUser?._id ? "" : "hidden"
                  }`}
                  onClick={() => {
                    setIsAddMemberMode(true);
                    setGroupName(selectedUser?.name || "");
                    setGroupMember(selectedUser?.members || []);
                  }}
                >
                  Add Member
                </button>
                <button
                  className={`btn mx-3 ${
                    selectedUser?.admin === authUser?._id ? "" : "hidden"
                  }`}
                  onClick={() => {
                    deleteGroup(selectedUser?._id);
                  }}
                >
                  <img src={deleteIcon} className="w-4" alt="" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-lg w-full max-w-xl text-white">
              <h3 className="text-2xl font-semibold mb-4">
                {isAddMemberMode ? "Add Members to Group" : "Create New Group"}
              </h3>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  disabled={isAddMemberMode}
                />
              </div>

              {/* Available Members */}
              <div className="mb-6">
                <p className="text-sm font-medium mb-3">Add Members</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-52 overflow-y-auto">
                  {otherUsers?.map((user) =>
                    groupMember.find(
                      (member) => member._id === user._id
                    ) ? null : (
                      <div
                        key={user._id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-800 cursor-pointer transition"
                        onClick={() => userclick(user)}
                      >
                        <img
                          src={user.profilePhoto}
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span>{user.fullName}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {groupMember.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium mb-3">Selected Members</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {groupMember.map((user) => (
                      <div
                        key={user._id}
                        className={`flex items-center gap-3 p-2 rounded-md transition ${
                          selectedUser?.members?.find(
                            (member) => member._id === user._id
                          )
                            ? "bg-gray-600 cursor-not-allowed"
                            : "bg-blue-800/40 hover:bg-blue-700/50 cursor-pointer"
                        }`}
                        onClick={() =>
                          selectedUser?.members?.find(
                            (member) => member._id === user._id
                          )
                            ? null
                            : removeMember(user)
                        }
                      >
                        <img
                          src={user.profilePhoto}
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span>{user.fullName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-md text-white font-medium transition"
                  onClick={() => {
                    if (isAddMemberMode) {
                      addMembersToGroup();
                    } else {
                      createGroup();
                    }
                    setGroupMember([]);
                    setIsAddMemberMode(false);
                  }}
                >
                  {isAddMemberMode ? "Add Members" : "Create Group"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </DialogWrapper>
  );
};

export default CommanGroupModal;
