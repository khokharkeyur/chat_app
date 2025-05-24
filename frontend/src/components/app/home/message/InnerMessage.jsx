import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import downArrow from "../../../../assets/down-arrow.svg";
import MessagePopup from "./MessagePopup";
import { Popover } from "@mui/material";
import { setEditMessage } from "../../../../redux/messageSlice";
import Picker from "emoji-picker-react";
import axiosInterceptors from "../../axiosInterceptors";

function InnerMessage({ message, onDelete }) {
  const chatRef = useRef();
  const dispatch = useDispatch();
  const { authUser, selectedUser } = useSelector((store) => store.user);
  const { socket } = useSelector((store) => store.socket);
  const { editMessage } = useSelector((store) => store.message);
  const [anchorEl, setAnchorEl] = useState(null);
  const emojiPickerRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiTargetId, setEmojiTargetId] = useState(null);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
  const [emojiSenderDetails, setEmojiSenderDetails] = useState(null);
  const [popupPosition, setPopupPosition] = useState("bottom");

  const createdAt = new Date(message.createdAt);
  const formattedTime = createdAt.toTimeString().split(" ")[0];

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        showEmojiPicker
      ) {
        setShowEmojiPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  useEffect(() => {
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      const buffer = 200;
      const shouldShowAbove = window.innerHeight - rect.bottom < buffer;
      setPopupPosition(shouldShowAbove ? "top" : "bottom");
    }
  }, [anchorEl]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = async () => {
    dispatch(setEditMessage(message));
    handleClose();
  };
  const handleDelete = async () => {
    try {
      onDelete(message._id);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };
  const handleEmoji = (messageId) => {
    setShowEmojiPicker((prev) => !prev);
    setEmojiTargetId(messageId);
    handleClose();
  };

  const handleReaction = async (emojiData) => {
    console.log("Reaction selected:", emojiData.emoji);
    const emoji = emojiData.emoji;
    if (emoji && emojiTargetId) {
      socket.emit("editMessage", emojiTargetId, null, emoji, authUser._id);

      await axiosInterceptors.put(`/message/edit/${emojiTargetId}`, {
        emoji: emoji,
        emojiSender: authUser._id,
      });
    }

    setShowEmojiPicker(false);
    setEmojiTargetId(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? "message-popup" : undefined;

  const isEditing = editMessage?._id === message._id;

  return (
    <div
      ref={chatRef}
      className={`chat ${authUser?._id === message?.senderId ? "chat-end" : "chat-start"}`}
    >
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img
            alt="Avatar"
            src={
              message?.senderId === authUser?._id
                ? authUser?.profilePhoto
                : selectedUser?.members
                  ? selectedUser.members.find(
                      (member) => member._id === message?.senderId
                    )?.profilePhoto
                  : selectedUser?.profilePhoto
            }
          />
        </div>
      </div>
      <div className="chat-header">
        <time className="text-xs opacity-50">{formattedTime}</time>
      </div>
      <div
        className={`chat-bubble group relative pr-8 py-2 px-4 rounded-lg text-left ${
          message?.senderId !== authUser?._id ? "bg-gray-200 text-black" : ""
        } ${isEditing ? "border-2 border-blue-500 shadow-lg" : ""}`}
      >
        {message?.message}
        {isEditing && (
          <span className="text-xs text-blue-500 font-semibold">
            (Editing...)
          </span>
        )}
        <span
          className="w-5 h-5 ml-2 opacity-0 cursor-pointer transition-opacity duration-200 group-hover:opacity-100 absolute right-0 top-4 transform -translate-y-1/2 text-xs"
          onClick={handleClick}
        >
          <img src={downArrow} alt="" className="w-4 h-4" />
        </span>
        {/* {message.emoji && message.emojiSender && (
          <div
            className={`absolute bottom-[-20px] flex items-center gap-1 text-xs bg-gray-800 text-white p-1 px-2 rounded-full ${authUser?._id === message?.senderId ? "right-0" : "left-0"}`}
          >
            <img
              src={message.emojiSender.profilePhoto}
              alt="Emoji Sender"
              className="w-4 h-4 rounded-full"
            />
            <span>{message.emoji}</span>
            <span className="ml-1">by {message.emojiSender.username}</span>
          </div>
        )} */}
        {message.emoji && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setEmojiAnchorEl(e.currentTarget);
              setEmojiSenderDetails(message.emojiSender);
            }}
            className={`cursor-pointer absolute bottom-[-10px] bg-gray-700 text-white px-2 py-1 rounded-full text-sm ${authUser?._id === message?.senderId ? "right-0" : "left-0"}`}
          >
            {message.emoji}
          </span>
        )}
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className={`absolute z-50 ${authUser?._id === message?.senderId ? "right-0" : "left-0"} rounded-lg`}
          >
            <Picker
              reactionsDefaultOpen={true}
              onReactionClick={handleReaction}
              theme="dark"
              allowExpandReactions={false}
            />
          </div>
        )}
      </div>
      <Popover
        open={Boolean(emojiAnchorEl)}
        anchorEl={emojiAnchorEl}
        onClose={() => setEmojiAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        PaperProps={{
          sx: {
            marginLeft: authUser?._id === message?.senderId ? "0" : "5px",
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
      >
        {emojiSenderDetails ? (
          <div
            className="p-4 max-w-xs rounded-lg bg-neutral text-neutral-content shadow-lg border border-neutral-700"
            style={{
              backgroundColor: "var(--fallback-b1, oklch(var(--b1) / 1))",
            }}
          >
            <div className="flex items-center gap-3">
              <img
                src={emojiSenderDetails?.profilePhoto}
                alt="Sender"
                className="w-10 h-10 rounded-full border border-gray-600"
              />
              <div>
                <p className="text-sm font-semibold">
                  {emojiSenderDetails.username}
                </p>
                <p className="text-xs text-gray-400">
                  Reacted with {message.emoji}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-neutral text-neutral-content shadow-lg">
            Loading...
          </div>
        )}
      </Popover>

      <MessagePopup
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onEdit={() => handleEdit(message._id)}
        onDelete={() => handleDelete(message._id)}
        authUser={authUser?._id === message?.senderId}
        onEmoji={() => handleEmoji(message._id)}
      />
    </div>
  );
}

export default InnerMessage;
