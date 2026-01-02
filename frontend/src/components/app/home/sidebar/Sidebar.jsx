import React, { useEffect, useState } from "react";
import { BiSearchAlt2 } from "react-icons/bi";
import OtherUsers from "./OtherUsers";
import axiosInterceptors from "../../axiosInterceptors";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  setAuthUser,
  setGroups,
  setOtherUsers,
  setSelectedUser,
} from "../../../../redux/userSlice";
import Cookies from "js-cookie";
import useGetOtherUsers from "../../../../hooks/useGetOtherUsers";
import useGetGroups from "../../../../hooks/usegetGroups";

function Sidebar({ mobileWidth }) {
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: fetchedUsers } = useGetOtherUsers();
  const { data: fetchedGroups } = useGetGroups();

  useEffect(() => {
    if (fetchedUsers) {
      setAllUsers(fetchedUsers);
      dispatch(setOtherUsers(fetchedUsers));
    }
  }, [fetchedUsers]);

  useEffect(() => {
    if (fetchedGroups) {
      setAllGroups(fetchedGroups);
      dispatch(setGroups(fetchedGroups));
    }
  }, [fetchedGroups]);

  useEffect(() => {
    if (search.trim() === "") {
      dispatch(setOtherUsers(allUsers));
      dispatch(setGroups(allGroups));
    }
  }, [search]);

  const searchSubmitHandler = (e) => {
    e.preventDefault();
    const searchTerm = search.toLowerCase();

    const filteredUsers = allUsers?.filter((user) =>
      user.fullName.toLowerCase().includes(searchTerm)
    );
    const filteredGroups = allGroups?.filter((group) =>
      group.name.toLowerCase().includes(searchTerm)
    );

    if (filteredUsers.length > 0 || filteredGroups.length > 0) {
      dispatch(setOtherUsers(filteredUsers));
      dispatch(setGroups(filteredGroups));
    } else {
      toast.error("User or group not found!", { id: "search-error" });
      dispatch(setOtherUsers(allUsers));
      dispatch(setGroups(allGroups));
    }
  };

  const logoutHandler = async () => {
    try {
      const res = await axiosInterceptors.get(`/user/logout`);
      toast.success(res.data.message);
      Cookies.remove("AccessToken", { path: "/" });
      Cookies.remove("RefreshToken", { path: "/" });
      navigate("/login");
      dispatch(setSelectedUser(null));
      dispatch(setAuthUser(null));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className={`flex flex-col max-h-[80%] ${mobileWidth ? "w-[100%]" : "w-[40%] border-r border-slate-500 pr-4 pb-4"}`}
    >
      <form
        onSubmit={searchSubmitHandler}
        action=""
        className="flex items-center gap-3 w-full"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered rounded-md w-[80%]"
          type="text"
          placeholder="Search..."
        />
        <button type="submit" className="btn bg-zinc-700 text-white">
          <BiSearchAlt2 className="w-6 h-6 outline-none" />
        </button>
      </form>
      <OtherUsers />
      <div className="mt-2">
        <button onClick={logoutHandler} className="btn btn-sm">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
