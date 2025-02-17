import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import downArrow from "../../../../assets/down-arrow.svg";
import MessagePopup from "./MessagePopup";
import { Popover } from "@mui/material";
import axiosInterceptors from "../../axiosInterceptors";

function InnerMessage({ message, onEdit, onDelete }) {
  const chatRef = useRef();
  const { authUser, selectedUser } = useSelector((store) => store.user);
  const [anchorEl, setAnchorEl] = useState(null);
  const { socket } = useSelector((store) => store.socket);

  const createdAt = new Date(message.createdAt);
  const formattedTime = createdAt.toTimeString().split(" ")[0];

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = async () => {
    const newMessageContent = prompt(
      "Enter the new message content:",
      message.message
    );
    if (newMessageContent && newMessageContent.trim() !== "") {
      try {
        socket.emit("editMessage", message._id, newMessageContent);

        await axiosInterceptors.put(`/messages/edit/${message._id}`, {
          message: newMessageContent,
        });

        onEdit(message._id, newMessageContent);
      } catch (error) {
        console.error("Error editing message:", error);
      }
    }
  };
  const handleDelete = async () => {
    try {
      
      socket.emit("deleteMessage", message._id);

      await axiosInterceptors.delete(`/messages/delete/${message._id}`);

      onDelete(message._id);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };
  const handleEmoji = () => {
    console.log("Add emoji to message");
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? "message-popup" : undefined;

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
        }`}
      >
        {message?.message}
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
            onEmoji={handleEmoji}
          />
        </Popover>
      </div>
    </div>
  );
}

export default InnerMessage;
