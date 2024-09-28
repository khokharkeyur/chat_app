import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    authUser: null,
    Groups:null,
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
      state.Groups = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    // setSearchUser: (state, action) => {
    //   state.searchUser = action.payload;
    // },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    }
  },
});

export const { setAuthUser, setOtherUsers, setSelectedUser,setOnlineUsers,setGroups } =
  userSlice.actions;
export default userSlice.reducer;
