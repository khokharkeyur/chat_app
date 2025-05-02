import React from "react";
import axiosInterceptors from "../components/app/axiosInterceptors";
import toast from "react-hot-toast";
import deleteIcon from "../assets/delete.png";
import { useDispatch } from "react-redux";
import { setGroups, updateSelectedUser } from "../redux/userSlice";

const CommanGroupModal = ({
  selectedUser,
  authUser,
  otherUsers,
  groupName,
  setGroupName,
  groupMember,
  setGroupMember,
  newGroup,
  createGroup,
}) => {
  const dispatch = useDispatch();

  const deleteGroup = async (groupId) => {
    if (!groupId) return;
    try {
      const response = await axiosInterceptors.delete(`/group/${groupId}`);
      dispatch(
        setGroups((prevGroups) =>
          prevGroups.filter((group) => group.id !== groupId)
        )
      );
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

      const updatedSelectedUser = {
        ...selectedUser,
        members: selectedUser.members.filter(
          (member) => member._id !== memberId
        ),
      };

      dispatch(updateSelectedUser(updatedSelectedUser));
    } catch (error) {
      console.error("Error removing member:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to remove member";
      toast.error(errorMessage);
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
    <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
      <div className="modal-box">
        {selectedUser?.members?.length > 0 ? (
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
            <h3 className="font-bold text-lg">Create New Group</h3>
            <div className="flex flex-col ">
              <label htmlFor="" className="my-2">
                Enter Group Name
              </label>
              <input
                type="text"
                className="w-[60%] bg-slate-800"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <p className="pt-2 pb-4">
              Add Members in this Group
              {otherUsers?.map((user) => (
                <div
                  key={user._id}
                  className={`flex items-center gap-2 mb-3 cursor-pointer ${
                    groupMember.find((member) => member._id === user._id)
                      ? "hidden"
                      : ""
                  }`}
                  onClick={() => userclick(user)}
                >
                  <img
                    src={user.profilePhoto}
                    alt=""
                    className="w-12 rounded-full"
                  />
                  <p className="">{user.fullName}</p>
                </div>
              ))}
            </p>
            <div>
              {groupMember.length > 0 && (
                <p className="mb-3">Selected Members</p>
              )}
              {groupMember?.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-2 mb-3 cursor-pointer"
                  onClick={() => removeMember(user)}
                >
                  <img
                    src={user.profilePhoto}
                    alt=""
                    className="w-12 rounded-full"
                  />
                  <p className="">{user.fullName}</p>
                </div>
              ))}
            </div>
            <div className="modal-action">
              <form method="dialog">
                <button
                  className="btn mx-3"
                  onClick={() => {
                    createGroup();
                    setGroupMember([]);
                  }}
                >
                  Create Group
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setGroupMember([]);
                  }}
                >
                  Close
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
};

export default CommanGroupModal;
