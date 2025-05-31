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
      // console.log('action', action.payload)
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
    removeGroup: (state, action) => {
      state.groups = state.groups?.filter(
        (group) => group._id !== action.payload
      );
      if (state.selectedUser?._id === action.payload) {
        state.selectedUser = null;
      }
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
} = userSlice.actions;
export default userSlice.reducer;
