import React, { useEffect, useRef, useState } from "react";
import HomePage from "./HomePage";
import Tooltip from "@mui/material/Tooltip";
import { Avatar, Divider, IconButton, Menu, MenuItem } from "@mui/material";
import { useSelector } from "react-redux";
import axios from "axios";

function Dashboard() {
  const [adminDetails,setAdminDetails] = useState()
  const { authUser } = useSelector((store) => store.user);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const dialogRef = useRef(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
    handleClose();
  };

  const closeDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
  };

  useEffect(() => {
    const fetchAdminDetails = async () => {
      if (!authUser?._id) return;

      try {
        axios.defaults.withCredentials = true;
        const res = await axios.get(`http://localhost:8080/api/user/admin/${authUser._id}`);
        setAdminDetails(res?.data)
        
      } catch (error) {
        console.log(error);
      }
    };

    fetchAdminDetails();
  }, [authUser]);
  return (
    <div>
      <div className="w-full flex justify-end">
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar sx={{ width: 32, height: 32 }}>M</Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: "visible",
                background: "#1F2937",
                color: "white",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                "&::before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem onClick={openDialog}>
            <Avatar /> Profile
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <Avatar /> Edit Profile
          </MenuItem>
          <Divider />
        </Menu>
      </div>

      <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          {adminDetails && (
            <div className="flex flex-col justify-center items-center">
              <img
                src={adminDetails.profilePhoto}
                alt=""
                className="w-20 h-20 rounded-full"
              />
              <p>{adminDetails.fullName}</p>
              <div className="flex gap-3 mt-3">
                <p className="font-semibold text-xl">Username:</p>
                <p className="text-xl">{adminDetails.username}</p>
              </div>
              <div className="flex gap-3 mt-3">
                <p className="font-semibold text-xl">Gender:</p>
                <p className="text-xl">{adminDetails.gender}</p>
              </div>
            </div>
          )}
          <div className="modal-action">
            <button className="btn flex justify-end" onClick={closeDialog}>
              Close
            </button>
          </div>
        </div>
      </dialog>

      <HomePage />
    </div>
  );
}

export default Dashboard;
