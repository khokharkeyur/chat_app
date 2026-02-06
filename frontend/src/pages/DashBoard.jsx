import React, { useEffect, useState } from "react";
import HomePage from "../components/app/home";
import Tooltip from "@mui/material/Tooltip";
import { Avatar, Divider, IconButton, Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInterceptors from "../components/app/axiosInterceptors";
import AdminDetailsDialog from "../components/app/home/Dialog/AdminDetailsDialog";
import BlockedUserDialog from "../components/app/home/Dialog/BlockedUserDialog";

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

  const openDialog = (id) => {
    const modal = document.getElementById(id);
    if (modal) modal.showModal();
    handleClose();
  };

  const closeDialog = (id) => {
    const modal = document.getElementById(id);
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
      const response = await axiosInterceptors.put("/user/unblock", { userId });

      if (response.status === 200) {
        setBlockedUsers((prev) => prev.filter((user) => user._id !== userId));
      }
    } catch (error) {
      console.error(
        "Error unblocking user:",
        error.response?.data?.message || error.message,
      );
    }
  };

  return (
    <div className="w-[100%]">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold text-center flex items-center">
          Chat App
        </h2>
        <div className=" flex">
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
            <MenuItem onClick={() => openDialog("adminDetailsDialog")}>
              <Avatar /> Profile
            </MenuItem>
            <MenuItem onClick={handleEditProfile}>
              <Avatar /> Edit Profile
            </MenuItem>
            <MenuItem onClick={() => navigate("/forgetPassword")}>
              <Avatar /> Change Password
            </MenuItem>
            <MenuItem onClick={() => openDialog("blockedUsersDialog")}>
              <Avatar /> Blocked User
            </MenuItem>
            <Divider />
          </Menu>
        </div>
      </div>

      <AdminDetailsDialog
        adminDetails={adminDetails}
        onClose={() => closeDialog("adminDetailsDialog")}
      />
      <BlockedUserDialog
        blockedUsers={blockedUsers}
        onClose={() => closeDialog("blockedUsersDialog")}
        handleUnBlock={handleUnBlock}
      />
      <HomePage />
    </div>
  );
}

export default Dashboard;
