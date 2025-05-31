import React from "react";
import OtherUser from "./OtherUser";
import useGetOtherUsers from "../../../../hooks/useGetOtherUsers";
import useGetGroups from "../../../../hooks/usegetGroups";
import { useSelector } from "react-redux";

function OtherUsers() {
  useGetOtherUsers();
  useGetGroups();
  const { authUser, groups, otherUsers } = useSelector((store) => store.user);

  const authUserFullName = authUser?.fullName || "";

  const groupsWithAuthUser = Array.isArray(groups)
    ? groups.filter((group) =>
        group?.members?.some((member) => member?.fullName === authUserFullName)
      )
    : [];
  if (!otherUsers) return null;
  console.log("groups", groups);

  return (
    <div className="overflow-auto flex-1 sm:block">
      {groupsWithAuthUser &&
        groupsWithAuthUser?.map((group) => (
          <OtherUser key={group._id} user={group} />
        ))}
      {otherUsers?.map((user) => (
        <OtherUser key={user._id} user={user} />
      ))}
    </div>
  );
}

export default OtherUsers;
