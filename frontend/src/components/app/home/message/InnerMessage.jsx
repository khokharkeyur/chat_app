import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import downArrow from "../../../../assets/down-arrow.svg";
import MessagePopup from "./MessagePopup";
import { setEditMessage } from "../../../../redux/messageSlice";
import Picker from "emoji-picker-react";
import axiosInterceptors from "../../axiosInterceptors";
import EmojiReactions from "./EmojiReactions";

function InnerMessage({ message, onDelete }) {
  const chatRef = useRef();
  const dispatch = useDispatch();
  const { authUser, selectedUser } = useSelector((store) => store.user);
  const { editMessage } = useSelector((store) => store.message);
  const [anchorEl, setAnchorEl] = useState(null);
  const emojiPickerRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiTargetId, setEmojiTargetId] = useState(null);

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
  const handleEmoji = (messageId) => {
    setShowEmojiPicker((prev) => !prev);
    setEmojiTargetId(messageId);
    handleClose();
  };
  const handleReaction = async (emojiData) => {
    const emoji = emojiData.emoji;
    if (emoji && emojiTargetId) {
      await axiosInterceptors.put(`/message/edit/${emojiTargetId}`, {
        emoji: emoji,
        emojiSender: authUser._id,
      });
    }

    setShowEmojiPicker(false);
    setEmojiTargetId(null);
  };
  const handleRemoveReaction = async (emoji, emojiSender) => {
    if (!emoji || !emojiSender) return;
    try {
      await axiosInterceptors.put(`/message/edit/${message._id}`, {
        emoji,
        emojiSender,
        removeEmoji: true,
      });
    } catch (error) {
      console.error("Error removing emoji reaction:", error);
    }
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
        {message.emoji && message.emoji.length > 0 && (
          <EmojiReactions
            reactions={message.emoji}
            isOwnMessage={authUser._id === message.senderId}
            auth={authUser}
            onRemoveReaction={handleRemoveReaction}
          />
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
