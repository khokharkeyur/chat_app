import React from "react";
import SendInput from "./SendInput";
import ManyMessage from "./ManyMessage";
import { useDispatch, useSelector } from "react-redux";
import useGetOtherUsers from "../../../../hooks/useGetOtherUsers";
import axiosInterceptors from "../../axiosInterceptors";
import toast from "react-hot-toast";
import CommanGroupModal from "../../../../comman/CommanGroupModal";
import DialogWrapper from "../../../../comman/DialogWrapper";
import useGetRealTimeEvents from "../../../../hooks/useGetRealTimeEvents";
import useGetGroups from "../../../../hooks/usegetGroups";
import { removeOtherUser, setSelectedUser } from "../../../../redux/userSlice";

function Message() {
  useGetRealTimeEvents();
  useGetGroups();

  const { selectedUser, authUser, otherUsers } = useSelector(
    (store) => store.user
  );
  useGetOtherUsers();
  const [groupMember, setGroupMember] = React.useState([]);
  const [groupName, setGroupName] = React.useState("");

  const authUserId = authUser?._id;
  function viewProfile() {
    if (!otherUsers) return;
  }
  const dispatch = useDispatch();
  const handleBlockUser = async (userId) => {
    try {
      const res = await axiosInterceptors.put("/user/block", { userId });
      if (res.status === 200) {
        const modal = document.getElementById("view_profile");
        if (modal) modal.close();
        dispatch(setSelectedUser(null));
        dispatch(removeOtherUser(userId));
        toast.success("User blocked successfully");
      }
    } catch (error) {
      console.error(
        "Error blocking user:",
        error.response?.data?.message || error.message
      );
    }
  };

  async function createGroup() {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }
    if (groupMember.length === 0) {
      toast.error("Please add at least one member to the group");
      return;
    }
    try {
      const updatedGroupMembers = [...groupMember, { _id: authUserId }];
      const groupMemberIds = updatedGroupMembers.map((user) => user._id);
      const payload = {
        groupName: groupName,
        memberIds: groupMemberIds,
        adminId: authUserId,
      };

      const response = await axiosInterceptors.post("/group/create", payload);
      setGroupName("");
      setGroupMember([]);

      const modal = document.getElementById("my_modal_5");
      if (modal) {
        modal.close();
      }
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  }

  return (
    <>
      {selectedUser !== null ? (
        <div className="md:min-w-[550px] flex flex-col">
          <div className="flex gap-2 items-center bg-zinc-700 text-white px-4 py-2 mb-2 w-full">
            <div>
              <button
                className="w-full flex items-center cursor-pointer gap-2"
                onClick={() => {
                  if (
                    !selectedUser.members ||
                    selectedUser.members.length === 0
                  ) {
                    document.getElementById("view_profile").showModal();
                    viewProfile();
                  }
                }}
              >
                <div>
                  <img
                    src={selectedUser?.profilePhoto}
                    alt=""
                    className="w-12 h-12 rounded-full"
                  />
                </div>
                <p>{selectedUser?.fullName || selectedUser?.name}</p>
              </button>
              <DialogWrapper id="view_profile">
                <div>
                  {selectedUser && (
                    <div className="flex flex-col justify-center items-center">
                      <img
                        src={selectedUser?.profilePhoto}
                        alt=""
                        className="w-20 h-20 rounded-full"
                      />
                      <p>{selectedUser?.fullName}</p>
                      <div className="flex gap-3 mt-3">
                        <p className="font-semibold text-xl">username:</p>
                        <p className="text-xl">{selectedUser?.username}</p>
                      </div>
                      <div className="flex gap-3 mt-3">
                        <p className="font-semibold text-xl">gender:</p>
                        <p className="text-xl">{selectedUser?.gender}</p>
                      </div>
                    </div>
                  )}
                  <div className="modal-action">
                    <form method="dialog" className="w-full flex">
                      <div className="w-full flex gap-4">
                        <p
                          className="btn text-red-500"
                          onClick={() => handleBlockUser(selectedUser?._id)}
                        >
                          Block
                        </p>
                        <p className="btn text-red-500">Report</p>
                      </div>
                      <button
                        className="btn flex justify-end"
                        onClick={() => {
                          setGroupMember([]);
                        }}
                      >
                        Close
                      </button>
                    </form>
                  </div>
                </div>
              </DialogWrapper>
            </div>
            <div className="flex flex-col flex-1">
              <div className="flex gap-2 flex-1 justify-end">
                <button
                  className="btn"
                  onClick={() => {
                    document.getElementById("my_modal_5").showModal();
                  }}
                >
                  {selectedUser?.members?.length > 0
                    ? "Show Groups"
                    : "New Group"}
                </button>
                <CommanGroupModal
                  selectedUser={selectedUser}
                  authUser={authUser}
                  otherUsers={otherUsers}
                  groupName={groupName}
                  setGroupName={setGroupName}
                  groupMember={groupMember}
                  setGroupMember={setGroupMember}
                  createGroup={createGroup}
                />
              </div>
            </div>
          </div>
          <ManyMessage />
          <SendInput />
        </div>
      ) : (
        <div className="md:min-w-[550px] flex flex-col justify-center items-center">
          <h1 className="text-4xl  font-bold">Hi,{authUser?.fullName} </h1>
          <h1 className="text-2xl ">Let's start conversation</h1>
        </div>
      )}
    </>
  );
}

export default Message;
