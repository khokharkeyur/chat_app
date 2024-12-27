import React from "react";
import { MenuItem, MenuList, Popover } from "@mui/material";

function MessagePopup({ anchorEl, open, onClose, onEdit, onDelete, onEmoji }) {
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
    >
      <MenuList>
        <MenuItem onClick={onEmoji}>Add Emoji</MenuItem>
        <MenuItem onClick={onEdit}>Edit</MenuItem>
        <MenuItem onClick={onDelete}>Delete</MenuItem>
      </MenuList>
    </Popover>
  );
}

export default MessagePopup;