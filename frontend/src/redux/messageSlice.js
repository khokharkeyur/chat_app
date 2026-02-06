import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    messages: [],
    editMessage: null,
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages =
        typeof action.payload === "function"
          ? action.payload(state.messages)
          : action.payload;
    },
    setEditMessage: (state, action) => {
      state.editMessage = action.payload;
    },
  },
});

export const { setMessages, setEditMessage } = messageSlice.actions;
export default messageSlice.reducer;
