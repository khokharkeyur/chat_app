import React, { useEffect, useState } from "react";
import HomePage from "../components/app/home";
import Tooltip from "@mui/material/Tooltip";
import { Avatar, Divider, IconButton, Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInterceptors from "../components/app/axiosInterceptors";
import DialogWrapper from "../comman/DialogWrapper";

function Dashboard() {
  const navigate = useNavigate();

  const [adminDetails, setAdminDetails] = useState();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const { authUser } = useSelector((store) => store.user);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openDialog = () => {
    const modal = document.getElementById("adminDetailsDialog");
    if (modal) modal.showModal();
    handleClose();
  };

  const closeDialog = () => {
    const modal = document.getElementById("adminDetailsDialog");
    if (modal) modal.close();
  };

  const openBlockedUserDialog = () => {
    const modal = document.getElementById("blockedUsersDialog");
    if (modal) modal.showModal();
    handleClose();
  };

  const closeBlockedUserDialog = () => {
    const modal = document.getElementById("blockedUsersDialog");
    if (modal) modal.close();
  };
  useEffect(() => {
    const fetchAdminDetails = async () => {
      if (!authUser?._id) return;

      try {
        const res = await axiosInterceptors.get(`/user/admin/${authUser._id}`);
        setAdminDetails(res?.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchAdminDetails();
  }, [authUser]);

  const fetchBlockedUsers = async () => {
    try {
      const response = await axiosInterceptors.get("/user/blockedUsers");
      setBlockedUsers(response.data.blockedUsers);
    } catch (error) {
      console.error("Error fetching blocked users:", error);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const handleEditProfile = () => {
    navigate("/signup", { state: { adminDetails } });
  };

  const handleUnBlock = async (userId) => {
    try {
      const response = await axiosInterceptors.put("/user/unBlock", { userId });

      if (response.status === 200) {
        setBlockedUsers((prev) => prev.filter((user) => user._id !== userId));
      }
    } catch (error) {
      console.error(
        "Error unblocking user:",
        error.response?.data?.message || error.message
      );
    }
  };

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
            <Avatar sx={{ width: 32, height: 32 }}>
              {adminDetails?.fullName?.charAt(0)}
            </Avatar>
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
          <MenuItem onClick={handleEditProfile}>
            <Avatar /> Edit Profile
          </MenuItem>
          <MenuItem onClick={() => navigate("/forgetPassword")}>
            <Avatar /> Change Password
          </MenuItem>
          <MenuItem onClick={openBlockedUserDialog}>
            <Avatar /> Blocked User
          </MenuItem>
          <Divider />
        </Menu>
      </div>

      <DialogWrapper id="adminDetailsDialog" onClose={closeDialog}>
        <div>
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
      </DialogWrapper>

      <DialogWrapper id="blockedUsersDialog" onClose={closeBlockedUserDialog}>
        <h3 className="font-bold text-lg">Blocked Users</h3>
        {blockedUsers.length > 0 ? (
          blockedUsers.map((user) => (
            <div
              key={user._id}
              className=" rounded-full flex justify-between mx-3 my-3"
            >
              <div className="flex">
                <img
                  src={user.profilePhoto}
                  alt={user.fullName}
                  className="mr-4 w-12"
                />
                <p className="pt-2 pb-4">{user.fullName}</p>
              </div>
              <button className="btn" onClick={() => handleUnBlock(user._id)}>
                Unblock
              </button>
            </div>
          ))
        ) : (
          <p>No blocked users found.</p>
        )}
        <div className="modal-action w-full">
          <button className="btn flex w-full" onClick={closeBlockedUserDialog}>
            Close
          </button>
        </div>
      </DialogWrapper>

      <HomePage />
    </div>
  );
}

export default Dashboard;
