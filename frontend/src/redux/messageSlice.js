import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    messages: [],
    editMessage: null,
    uploadingFiles: [],
  },
  reducers: {
    ensureUploadingFiles: (state) => {
      if (!Array.isArray(state.uploadingFiles)) {
        state.uploadingFiles = [];
      }
    },
    setMessages: (state, action) => {
      state.messages =
        typeof action.payload === "function"
          ? action.payload(state.messages)
          : action.payload;
    },
    setEditMessage: (state, action) => {
      state.editMessage = action.payload;
    },
    addUploadingFile: (state, action) => {
      if (!Array.isArray(state.uploadingFiles)) {
        state.uploadingFiles = [];
      }
      state.uploadingFiles.push(action.payload);
    },
    updateUploadingFile: (state, action) => {
      if (!Array.isArray(state.uploadingFiles)) {
        state.uploadingFiles = [];
      }
      const index = state.uploadingFiles.findIndex(
        (f) => f.id === action.payload.id,
      );
      if (index !== -1) {
        state.uploadingFiles[index] = {
          ...state.uploadingFiles[index],
          ...action.payload,
        };
      }
    },
    removeUploadingFile: (state, action) => {
      if (!Array.isArray(state.uploadingFiles)) {
        state.uploadingFiles = [];
        return;
      }
      state.uploadingFiles = state.uploadingFiles.filter(
        (f) => f.id !== action.payload,
      );
    },
    clearUploadingFiles: (state) => {
      state.uploadingFiles = [];
    },
  },
});

export const {
  ensureUploadingFiles,
  setMessages,
  setEditMessage,
  addUploadingFile,
  updateUploadingFile,
  removeUploadingFile,
  clearUploadingFiles,
} = messageSlice.actions;
export default messageSlice.reducer;
