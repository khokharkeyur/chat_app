import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    authUser: [],
    groups: [],
    otherUsers: null,
    selectedUser: null,
    // searchUser: [],
    onlineUsers: null,
    typingIndicators: {},
  },
  reducers: {
    setAuthUser: (state, action) => {
      state.authUser = action.payload;
    },
    setOtherUsers: (state, action) => {
      state.otherUsers = action.payload;
    },
    setGroups: (state, action) => {
      state.groups = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    updateSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setTypingIndicator: (state, action) => {
      const { chatId, isGroup, userId, userName } = action.payload;
      if (!chatId || !userId) return;

      const existing = state.typingIndicators[chatId] || {
        isGroup: !!isGroup,
        users: [],
      };

      const alreadyTyping = existing.users.some(
        (user) => user.userId === userId,
      );
      const nextUsers = alreadyTyping
        ? existing.users.map((user) =>
            user.userId === userId
              ? { ...user, userName: userName || user.userName }
              : user,
          )
        : [...existing.users, { userId, userName: userName || "Someone" }];

      state.typingIndicators[chatId] = {
        isGroup: !!isGroup,
        users: nextUsers,
      };
    },
    clearTypingIndicator: (state, action) => {
      const { chatId, userId } = action.payload;
      if (!chatId || !state.typingIndicators[chatId]) return;

      if (!userId) {
        delete state.typingIndicators[chatId];
        return;
      }

      const remainingUsers = state.typingIndicators[chatId].users.filter(
        (user) => user.userId !== userId,
      );

      if (remainingUsers.length === 0) {
        delete state.typingIndicators[chatId];
      } else {
        state.typingIndicators[chatId].users = remainingUsers;
      }
    },
    clearAllTypingIndicators: (state) => {
      state.typingIndicators = {};
    },
    updateUserLastMessage: (state, action) => {
      const { userId, lastMessage } = action.payload;
      state.otherUsers = state.otherUsers.map((user) =>
        user._id === userId ? { ...user, lastMessage } : user,
      );
    },
    updateGroupLastMessage: (state, action) => {
      const { groupId, lastMessage } = action.payload;
      state.groups = state.groups.map((group) =>
        group._id === groupId ? { ...group, lastMessage } : group,
      );
    },
    removeGroup: (state, action) => {
      state.groups = state.groups?.filter(
        (group) => group._id !== action.payload,
      );
      if (state.selectedUser?._id === action.payload) {
        state.selectedUser = null;
      }
    },
    removeOtherUser: (state, action) => {
      state.otherUsers = state.otherUsers.filter(
        (user) => user._id !== action.payload,
      );
    },
  },
});

export const {
  setAuthUser,
  setOtherUsers,
  setSelectedUser,
  setOnlineUsers,
  setGroups,
  setTypingIndicator,
  clearTypingIndicator,
  clearAllTypingIndicators,
  updateSelectedUser,
  removeGroup,
  removeOtherUser,
  updateUserLastMessage,
  updateGroupLastMessage,
} = userSlice.actions;
export default userSlice.reducer;
