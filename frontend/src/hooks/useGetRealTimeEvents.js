import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setMessages } from "../redux/messageSlice";
import {
  setGroups,
  removeGroup,
  updateSelectedUser,
  updateUserLastMessage,
  updateGroupLastMessage,
  setSelectedUser,
} from "../redux/userSlice";

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

      socket.on("deleteMessage", ({ messageId }) => {
        dispatch(setMessages(messages.filter((msg) => msg._id !== messageId)));
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

      socket.on("lastMessageUpdated", (payload) => {
        console.log("payload.type", payload);
        if (payload.type === "group") {
          dispatch(
            updateGroupLastMessage({
              groupId: payload.groupId,
              lastMessage: payload.lastMessage,
            })
          );
        } else if (payload.userId) {
          dispatch(
            updateUserLastMessage({
              userId: payload.userId,
              lastMessage: payload.lastMessage,
            })
          );
        }
      });
      socket.on("groupDeleted", ({ groupId }) => {
        dispatch(removeGroup(groupId));
      });

      socket.on("memberAdded", ({ memberId, updatedGroup }) => {
        const oldGroups = groups || [];

        const index = oldGroups.findIndex((g) => g._id === updatedGroup._id);

        let newGroups;

        if (index !== -1) {
          newGroups = [...oldGroups];
          newGroups[index] = updatedGroup;
        } else {
          newGroups = [...oldGroups, updatedGroup];
        }

        dispatch(setGroups(newGroups));
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
        const oldGroups = groups || [];
        const newGroups = oldGroups.filter((g) => g._id !== groupId);
        dispatch(setGroups(newGroups));

        // const updatedGroups = groups?.map((group) =>
        //   group._id === groupId
        //     ? {
        //         ...group,
        //         members: group.members.filter(
        //           (member) => member._id !== memberId
        //         ),
        //       }
        //     : group
        // );
        // console.log("updatedGroups after member removal", updatedGroups);
        // dispatch(setGroups(updatedGroups));
        if (selectedUser?._id === groupId) {
          dispatch(setSelectedUser(null));
        }
      });
    }

    return () => {
      socket?.off("newMessage");
      socket?.off("messageUpdated");
      socket?.off("deleteMessage");
      socket?.off("messageDeleted");
      socket?.off("groupCreated");
      socket?.off("groupDeleted");
      socket?.off("memberRemoved");
      socket?.off("memberAdded");
      socket?.off("groupUpdated");
      socket?.off("lastMessageUpdated");
    };
  }, [socket, messages, groups, dispatch]);

  return null;
};

export default useGetRealTimeEvents;
