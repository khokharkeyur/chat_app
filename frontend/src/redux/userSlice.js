import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    authUser: null,
    groups: null,
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
      state.selectedUser = action.payload; // New action to update selectedUser
    },
    // setSearchUser: (state, action) => {
    //   state.searchUser = action.payload;
    // },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
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
} = userSlice.actions;
export default userSlice.reducer;
