import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setMessages } from "../redux/messageSlice";
import { setGroups, removeGroup, updateSelectedUser } from "../redux/userSlice";

const useGetRealTimeEvents = () => {
  const { socket } = useSelector((store) => store.socket);
  const { messages } = useSelector((store) => store.message);
  const { groups, selectedUser } = useSelector((store) => store.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (socket) {
      socket.on("newMessage", (newMessage) => {
        if (
          newMessage.type === "group" &&
          selectedUser &&
          selectedUser._id === newMessage.groupId
        ) {
          dispatch(setMessages((prev) => [...(prev || []), newMessage]));
        } else if (
          newMessage.type === "user" &&
          selectedUser &&
          (selectedUser._id === newMessage.senderId ||
            selectedUser._id === newMessage.receiverId)
        ) {
          dispatch(setMessages((prev) => [...(prev || []), newMessage]));
        }
      });

      socket.on("messageUpdated", (updatedMessage) => {
        const updatedMessages = messages.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        );
        dispatch(setMessages(updatedMessages));
      });

      socket.on("messageDeleted", (deletedMessage) => {
        const updatedMessages = messages.filter(
          (msg) => msg._id !== deletedMessage._id
        );
        dispatch(setMessages(updatedMessages));
      });

      socket.on("groupCreated", (newGroup) => {
        dispatch(setGroups([...(groups || []), newGroup]));
      });

      socket.on("groupDeleted", ({ groupId }) => {
        dispatch(removeGroup(groupId));
      });

      socket.on("memberAdded", ({ groupId, memberId, updatedGroup }) => {
        dispatch(
          setGroups((prev) => {
            const exists = prev?.some((g) => g._id === groupId);
            if (exists) {
              return prev.map((g) => (g._id === groupId ? updatedGroup : g));
            } else {
              return [...(prev || []), updatedGroup];
            }
          })
        );
      });

      socket.on("groupUpdated", ({ groupId, updatedGroup }) => {
        const updatedGroups = groups?.map((group) =>
          group._id === groupId
            ? {
                ...group,
                members: updatedGroup?.members,
              }
            : group
        );
        dispatch(setGroups(updatedGroups));
        if (selectedUser?._id === groupId) {
          dispatch(updateSelectedUser(updatedGroup));
        }
      });

      socket.on("memberRemoved", ({ groupId, memberId }) => {
        const updatedGroups = groups?.map((group) =>
          group._id === groupId
            ? {
                ...group,
                members: group.members.filter(
                  (member) => member._id !== memberId
                ),
              }
            : group
        );
        dispatch(setGroups(updatedGroups));
        if (selectedUser?._id === groupId) {
          dispatch(
            updateSelectedUser({
              ...selectedUser,
              members: selectedUser.members.filter(
                (member) => member._id !== memberId
              ),
            })
          );
        }
      });
    }

    return () => {
      socket?.off("newMessage");
      socket?.off("messageUpdated");
      socket?.off("messageDeleted");
      socket?.off("groupCreated");
      socket?.off("groupDeleted");
      socket?.off("memberRemoved");
      socket?.off("memberAdded");
      socket?.off("groupUpdated");
    };
  }, [socket, messages, groups, dispatch]);

  return null;
};

export default useGetRealTimeEvents;
