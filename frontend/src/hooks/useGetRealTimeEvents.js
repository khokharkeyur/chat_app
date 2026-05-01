import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setMessages } from "../redux/messageSlice";
import {
  setGroups,
  removeGroup,
  updateSelectedUser,
  updateUserLastMessage,
  updateGroupLastMessage,
  setSelectedUser,
  setTypingIndicator,
  clearTypingIndicator,
} from "../redux/userSlice";
import { useSocket } from "../config/SocketContext";

const useGetRealTimeEvents = () => {
  const socket = useSocket();
  const { groups, selectedUser } = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const groupsRef = useRef(groups || []);
  const selectedUserRef = useRef(selectedUser);
  const typingTimeoutRef = useRef({});

  useEffect(() => {
    groupsRef.current = groups || [];
  }, [groups]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    if (socket) {
      socket.on("newMessage", (newMessage) => {
        const currentSelectedUser = selectedUserRef.current;
        if (
          newMessage.type === "group" &&
          currentSelectedUser &&
          currentSelectedUser._id === newMessage.groupId
        ) {
          dispatch(setMessages((prev) => [...(prev || []), newMessage]));
          dispatch(
            clearTypingIndicator({
              chatId: newMessage.groupId,
              userId: newMessage.senderId,
            }),
          );
        } else if (
          newMessage.type === "user" &&
          currentSelectedUser &&
          (currentSelectedUser._id === newMessage.senderId ||
            currentSelectedUser._id === newMessage.receiverId)
        ) {
          dispatch(setMessages((prev) => [...(prev || []), newMessage]));
          dispatch(
            clearTypingIndicator({
              chatId:
                newMessage.senderId === currentSelectedUser._id
                  ? newMessage.senderId
                  : newMessage.receiverId,
              userId: newMessage.senderId,
            }),
          );
        }
      });

      socket.on("typingStatus", ({
        chatId,
        isGroup,
        senderId,
        senderName,
        isTyping,
      }) => {
        if (!chatId || !senderId) return;

        const targetChatId = isGroup ? chatId : senderId;

        const timeoutKey = `${targetChatId}:${senderId}`;
        const existingTimeout = typingTimeoutRef.current[timeoutKey];
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          delete typingTimeoutRef.current[timeoutKey];
        }

        if (isTyping) {
          dispatch(
            setTypingIndicator({
              chatId: targetChatId,
              isGroup,
              userId: senderId,
              userName: senderName,
            }),
          );

          typingTimeoutRef.current[timeoutKey] = setTimeout(() => {
            dispatch(
              clearTypingIndicator({ chatId: targetChatId, userId: senderId }),
            );
            delete typingTimeoutRef.current[timeoutKey];
          }, 3000);
          return;
        }

        dispatch(
          clearTypingIndicator({ chatId: targetChatId, userId: senderId }),
        );
      });

      socket.on("messageUpdated", (updatedMessage) => {
        dispatch(
          setMessages((prev) =>
            (prev || []).map((msg) =>
              msg._id === updatedMessage._id ? updatedMessage : msg,
            ),
          ),
        );
      });

      socket.on("deleteMessage", ({ messageId }) => {
        dispatch(
          setMessages((prev) =>
            (prev || []).filter((msg) => msg._id !== messageId),
          ),
        );
      });

      socket.on("groupCreated", (newGroup) => {
        const existingGroups = groupsRef.current || [];
        const alreadyExists = existingGroups.some(
          (group) => group._id === newGroup._id,
        );
        const nextGroups = alreadyExists
          ? existingGroups
          : [...existingGroups, newGroup];
        groupsRef.current = nextGroups;
        dispatch(setGroups(nextGroups));
      });

      socket.on("lastMessageUpdated", (payload) => {
        if (payload.type === "group") {
          dispatch(
            updateGroupLastMessage({
              groupId: payload.groupId,
              lastMessage: payload.lastMessage,
            }),
          );
        } else if (payload.userId) {
          dispatch(
            updateUserLastMessage({
              userId: payload.userId,
              lastMessage: payload.lastMessage,
            }),
          );
        }
      });
      socket.on("groupDeleted", ({ groupId }) => {
        dispatch(removeGroup(groupId));
      });

      socket.on("memberAdded", ({ updatedGroup }) => {
        const oldGroups = groupsRef.current || [];

        const index = oldGroups.findIndex((g) => g._id === updatedGroup._id);

        let newGroups;

        if (index !== -1) {
          newGroups = [...oldGroups];
          newGroups[index] = updatedGroup;
        } else {
          newGroups = [...oldGroups, updatedGroup];
        }

        groupsRef.current = newGroups;
        dispatch(setGroups(newGroups));
      });

      socket.on("groupUpdated", ({ groupId, updatedGroup }) => {
        const updatedGroups = (groupsRef.current || []).map((group) =>
          group._id === groupId
            ? {
                ...group,
                members: updatedGroup?.members,
                admin: updatedGroup?.admin,
              }
            : group,
        );
        groupsRef.current = updatedGroups;
        dispatch(setGroups(updatedGroups));
        if (selectedUserRef.current?._id === groupId) {
          dispatch(updateSelectedUser(updatedGroup));
        }
      });

      socket.on("memberRemoved", ({ groupId }) => {
        const oldGroups = groupsRef.current || [];
        const newGroups = oldGroups.filter((g) => g._id !== groupId);
        groupsRef.current = newGroups;
        dispatch(setGroups(newGroups));
        if (selectedUserRef.current?._id === groupId) {
          dispatch(setSelectedUser(null));
        }
      });
    }

    return () => {
      socket?.off("newMessage");
      socket?.off("messageUpdated");
      socket?.off("deleteMessage");
      socket?.off("groupCreated");
      socket?.off("groupDeleted");
      socket?.off("memberRemoved");
      socket?.off("memberAdded");
      socket?.off("groupUpdated");
      socket?.off("lastMessageUpdated");
      socket?.off("typingStatus");

      Object.values(typingTimeoutRef.current).forEach((timeoutId) =>
        clearTimeout(timeoutId),
      );
      typingTimeoutRef.current = {};
    };
  }, [socket, dispatch]);

  return null;
};

export default useGetRealTimeEvents;
