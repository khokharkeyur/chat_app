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
  updateSelectedUser,
  removeGroup,
  removeOtherUser,
  updateUserLastMessage,
  updateGroupLastMessage,
} = userSlice.actions;
export default userSlice.reducer;
