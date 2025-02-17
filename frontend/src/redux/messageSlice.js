import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    messages: null,
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    editMessage: (state, action) => {
      const updatedMessage = action.payload;
      if (state.messages) {
        state.messages = state.messages.map((message) =>
          message._id === updatedMessage._id ? updatedMessage : message
        );
      }
    },
    deleteMessage: (state, action) => {
      const messageId = action.payload;
      if (state.messages) {
        state.messages = state.messages.filter(
          (message) => message._id !== messageId
        );
      }
    },
  },
});

export const { setMessages, editMessage, deleteMessage } = messageSlice.actions;
export default messageSlice.reducer;
