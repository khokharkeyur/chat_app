import React from "react";
import SendInput from "./SendInput";
import ManyMessage from "./ManyMessage";
import { useDispatch, useSelector } from "react-redux";
import useGetOtherUsers from "../../../../hooks/useGetOtherUsers";
import axiosInterceptors from "../../axiosInterceptors";
import toast from "react-hot-toast";
import deleteIcon from "../../../../assets/delete.png";
import { setGroups, updateSelectedUser } from "../../../../redux/userSlice";

function Message() {
  const { selectedUser, authUser, otherUsers } = useSelector(
    (store) => store.user
  );
  useGetOtherUsers();
  const [groupMember, setGroupMember] = React.useState([]);
  const [groupName, setGroupName] = React.useState("");
  const dispatch = useDispatch();

  const authUserId = authUser?._id;
  function newGroup() {
    if (!otherUsers) return;
  }

  function viewProfile() {
    if (!otherUsers) return;
  }
  const handleBlockUser = async (userId) => {
    try {
      const res = await axiosInterceptors.put(
        "/user/block",
        { userId },
      );
      if (res.status === 200) {
        console.log("User blocked successfully");
      }
  
    } catch (error) {
      console.error("Error blocking user:", error.response?.data?.message || error.message);
    }
  };
  function userclick(user) {
    setGroupMember((prevGroupMember) => {
      if (prevGroupMember.some((member) => member._id === user._id)) {
        return prevGroupMember;
      }
      return [...prevGroupMember, user];
    });
  }

  function removeMember(userToRemove) {
    setGroupMember((prevGroupMember) =>
      prevGroupMember.filter((user) => user._id !== userToRemove._id)
    );
  }
  async function createGroup() {
    try {
      const updatedGroupMembers = [...groupMember, { _id: authUserId }];
      const groupMemberIds = updatedGroupMembers.map((user) => user._id);
      const payload = {
        groupName: groupName,
        memberIds: groupMemberIds,
        adminId: authUserId,
      };

      const response = await axiosInterceptors.post("/group/create", payload);
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  }
  const deleteGroup = async (groupId) => {
    if (!groupId) return;
    try {
      const response = await axiosInterceptors.delete(`/group/${groupId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
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
        `/group/${groupId}/member/${memberId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
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
  const GroupMemberIsAuthUser = selectedUser?.members?.find(
    (member) => member?.fullName === authUser?.fullName
  );

  return (
    <>
      {selectedUser !== null ? (
        <div className="md:min-w-[550px] flex flex-col">
          <div className="flex gap-2 items-center bg-zinc-700 text-white px-4 py-2 mb-2 w-full">
            <div>
              <button
                className="w-full grid grid-cols-2 items-center cursor-pointer gap-1"
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
                <div className="">
                  <img
                    src={selectedUser?.profilePhoto}
                    alt=""
                    className="w-12 h-12 rounded-full"
                  />
                </div>
                <p>{selectedUser?.fullName || selectedUser?.name}</p>
              </button>
              <dialog
                id="view_profile"
                className="modal modal-bottom sm:modal-middle"
              >
                <div className="modal-box">
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
              </dialog>
            </div>
            <div className="flex flex-col flex-1">
              <div className="flex gap-2 flex-1 justify-end">
                {/* create group */}
                {selectedUser?.members?.length > 0 ? (
                  <div>
                    <button
                      className="btn"
                      onClick={() => {
                        document.getElementById("my_modal_5").showModal();
                        newGroup();
                      }}
                    >
                      show groups
                    </button>
                    <dialog
                      id="my_modal_5"
                      className="modal modal-bottom sm:modal-middle"
                    >
                      <div className="modal-box">
                        <div className="flex flex-col">
                          <img
                            src={selectedUser?.profilePhoto}
                            alt=""
                            className="w-12 rounded-full m-auto"
                          />
                          <p className="pt-2 m-auto">{selectedUser?.name}</p>
                        </div>
                        <div>
                          <span>group Member</span>
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
                                  {member?.fullName ===
                                  GroupMemberIsAuthUser?.fullName
                                    ? "You"
                                    : member?.fullName}
                                </p>
                              </div>
                              <button
                                className={`btn ${selectedUser?.admin === authUser?._id ? "" : "hidden"} ${selectedUser?.admin === member?._id ? "hidden" : ""}`}
                                onClick={() =>
                                  removeMemberFromGroup(
                                    selectedUser?._id,
                                    member._id
                                  )
                                }
                              >
                                remove member
                              </button>
                              <button
                                className={`btn ${selectedUser?.admin === authUser?._id ? "hidden" : ""} ${selectedUser?.admin === member?._id ? "" : "hidden"}`}
                              >
                                admin
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
                              className={`btn mx-3 ${selectedUser?.admin === authUser?._id ? "" : "hidden"}`}
                              onClick={() => {
                                deleteGroup(selectedUser?._id);
                              }}
                            >
                              <img src={deleteIcon} className="w-4" alt="" />
                            </button>
                          </form>
                        </div>
                      </div>
                    </dialog>
                  </div>
                ) : (
                  <div className="create-group">
                    <button
                      className="btn"
                      onClick={() => {
                        document.getElementById("my_modal_5").showModal();
                        newGroup();
                      }}
                    >
                      New group
                    </button>
                    <dialog
                      id="my_modal_5"
                      className="modal modal-bottom sm:modal-middle"
                    >
                      <div className="modal-box">
                        <h3 className="font-bold text-lg">create new group</h3>
                        <div className="flex flex-col ">
                          <label htmlFor="" className="my-2">
                            enter group name
                          </label>
                          <input
                            type="text"
                            className="w-[60%] bg-slate-800"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                          />
                        </div>
                        <p className="pt-2 pb-4">
                          Add member in this group
                          {otherUsers?.map((user) => (
                            <div
                              key={user._id}
                              className={`flex items-center gap-2 mb-3 cursor-pointer ${groupMember.find((member) => member._id === user._id) ? "hidden" : ""}`}
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
                            <p className="mb-3">selected member</p>
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
                              create group
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
                      </div>
                    </dialog>
                  </div>
                )}
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
