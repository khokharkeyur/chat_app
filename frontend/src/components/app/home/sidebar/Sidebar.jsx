import React, { useEffect, useMemo, useState } from "react";
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
import { useSelector } from "react-redux";

function Sidebar({ mobileWidth }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const users = useSelector((state) => state.user.otherUsers) || [];
  const groups = useSelector((state) => state.user.groups) || [];

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: fetchedUsers } = useGetOtherUsers();
  const { data: fetchedGroups } = useGetGroups();

  useEffect(() => {
    if (fetchedUsers) dispatch(setOtherUsers(fetchedUsers));
    if (fetchedGroups) dispatch(setGroups(fetchedGroups));
  }, [fetchedUsers, fetchedGroups]);

  const filteredData = useMemo(() => {
    let filteredUsers = [...users];
    let filteredGroups = [...groups];

    if (search.trim()) {
      const term = search.toLowerCase();
      filteredUsers = filteredUsers.filter((u) =>
        u.fullName.toLowerCase().includes(term),
      );
      filteredGroups = filteredGroups.filter((g) =>
        g.name.toLowerCase().includes(term),
      );
    }

    // 🎯 Filter
    if (filter === "users") filteredGroups = [];
    if (filter === "groups") filteredUsers = [];

    return { filteredUsers, filteredGroups };
  }, [users, groups, search, filter]);

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
      <div className="items-center gap-3 w-full">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered rounded-md w-full"
          type="text"
          placeholder="Search..."
        />
      </div>
      <div className="flex gap-2 mt-3 mb-3">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-1 rounded-full text-sm transition
      ${
        filter === "all"
          ? "bg-zinc-700 text-white"
          : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
      }`}
        >
          All
        </button>

        <button
          onClick={() => setFilter("groups")}
          className={`px-4 py-1 rounded-full text-sm transition
      ${
        filter === "groups"
          ? "bg-zinc-700 text-white"
          : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
      }`}
        >
          Groups
        </button>

        <button
          onClick={() => setFilter("users")}
          className={`px-4 py-1 rounded-full text-sm transition
      ${
        filter === "users"
          ? "bg-zinc-700 text-white"
          : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
      }`}
        >
          Users
        </button>
      </div>
      <OtherUsers
        filteredGroups={filteredData?.filteredGroups}
        filteredUsers={filteredData?.filteredUsers}
      />
      <div className="mt-2">
        <button onClick={logoutHandler} className="btn btn-sm">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
