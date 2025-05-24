import React from "react";
import { MenuItem, MenuList, Popover } from "@mui/material";

function MessagePopup({
  anchorEl,
  open,
  onClose,
  onEdit,
  onDelete,
  onEmoji,
  authUser,
}) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      PaperProps={{
        sx: {
          backgroundColor: "transparent",
          boxShadow: "none",
        },
      }}
    >
      <div className="bg-neutral text-neutral-content rounded-lg shadow-lg border border-neutral-700 min-w-[130px] py-2">
        <ul className="flex flex-col">
          <li
            className="px-4 py-2 hover:bg-neutral-700 cursor-pointer text-sm"
            onClick={onEmoji}
          >
            Add Emoji
          </li>
          {authUser && (
            <li
              className="px-4 py-2 hover:bg-neutral-700 cursor-pointer text-sm"
              onClick={onEdit}
            >
              Edit
            </li>
          )}
          {authUser && (
            <li
              className="px-4 py-2 hover:bg-red-700 cursor-pointer text-sm text-red-300"
              onClick={onDelete}
            >
              Delete
            </li>
          )}
        </ul>
      </div>
    </Popover>
  );
}

export default MessagePopup;
