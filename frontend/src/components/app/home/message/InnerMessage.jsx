import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import downArrow from "../../../../assets/down-arrow.svg";
import MessagePopup from "./MessagePopup";
import { Popover } from "@mui/material";
import { setEditMessage } from "../../../../redux/messageSlice";
import Picker from "emoji-picker-react";

function InnerMessage({ message, onDelete }) {
  const chatRef = useRef();
  const dispatch = useDispatch();
  const { authUser, selectedUser } = useSelector((store) => store.user);
  const { editMessage } = useSelector((store) => store.message);
  const [anchorEl, setAnchorEl] = useState(null);
  const emojiPickerRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
  const handleEmoji = () => {
    setShowEmojiPicker((prev) => !prev);
    console.log("Add emoji to message");
    handleClose();
  };

  const handleReaction = (emojiData) => {
    console.log("Reaction selected:", emojiData.emoji);

    // You can emit emoji with socket or update message text here
    // e.g., append emoji to input box or message text (if editing)
    setShowEmojiPicker(false);
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

        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MessagePopup
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onEdit={() => handleEdit(message._id)}
            onDelete={() => handleDelete(message._id)}
            authUser={authUser?._id === message?.senderId}
            onEmoji={handleEmoji}
          />
        </Popover>

        <span
          className={`absolute bottom-[-10px] bg-gray-700 rounded-full ${authUser?._id === message?.senderId ? "right-0" : "left-0"} `}
        >
          🤣
        </span>

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
    </div>
  );
}

export default InnerMessage;
