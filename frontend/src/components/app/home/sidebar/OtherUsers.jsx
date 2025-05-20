import React from "react";
import OtherUser from "./OtherUser";
import useGetOtherUsers from "../../../../hooks/useGetOtherUsers";
import useGetGroups from "../../../../hooks/usegetGroups";
import { useSelector } from "react-redux";

function OtherUsers() {
  useGetOtherUsers();
  useGetGroups();
  const otherUsers = useSelector((store) => store.user.otherUsers);
  const groups = useSelector((store) => store.user.groups);
  const authUser = useSelector((store) => store.user);

  const groupMembers = Array.isArray(groups)
    ? groups?.flatMap(
        (group) => group?.members.map((member) => member?.fullName) || []
      )
    : [];
  const authUserFullName = authUser?.authUser?.fullName;
  const isAuthUserInGroup = groupMembers.includes(authUserFullName);

  if (!otherUsers) return null;

  return (
    <div className="overflow-auto flex-1 sm:block">
      {isAuthUserInGroup &&
        groups?.map((group) => <OtherUser key={group._id} user={group} />)}
      {otherUsers?.map((user) => (
        <OtherUser key={user._id} user={user} />
      ))}
    </div>
  );
}

export default OtherUsers;
