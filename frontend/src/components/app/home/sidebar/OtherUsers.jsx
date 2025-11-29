import React from "react";
import OtherUser from "./OtherUser";
import useGetOtherUsers from "../../../../hooks/useGetOtherUsers";
import useGetGroups from "../../../../hooks/usegetGroups";
import { useSelector } from "react-redux";

function OtherUsers() {
  useGetOtherUsers();
  useGetGroups();
  const { groups, otherUsers } = useSelector((store) => store.user);
  console.log("groups on otherUser", groups);

  return (
    <div className="overflow-auto flex-1 sm:block">
      {groups &&
        groups?.map((group) => <OtherUser key={group._id} user={group} />)}
      {otherUsers?.map((user) => (
        <OtherUser key={user._id} user={user} />
      ))}
    </div>
  );
}

export default OtherUsers;
