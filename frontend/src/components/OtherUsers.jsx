import React from "react";
import OtherUser from "./OtherUser";
import useGetOtherUsers from "../hooks/useGetOtherUsers";
import { useSelector } from "react-redux";

function OtherUsers() {
  useGetOtherUsers();

  const { otherUsers } = useSelector((store) => store.user);
  if (!otherUsers) return; // early return in react

  return (
    <div className="overflow-auto flex-1">
      {otherUsers?.map((user) => {
        return <OtherUser key={user._id} user={user} />;
      })}
    </div>
  );
}

export default OtherUsers;
