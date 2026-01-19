import OtherUser from "./OtherUser";

function OtherUsers({ filteredGroups, filteredUsers }) {
  return (
    <div className="overflow-auto flex-1 sm:block mt-2">
      {filteredGroups &&
        filteredGroups?.map((group) => (
          <OtherUser key={group._id} user={group} />
        ))}
      {filteredUsers?.map((user) => (
        <OtherUser key={user._id} user={user} />
      ))}
      {filteredGroups?.length == 0 && filteredUsers?.length === 0 && (
        <div className="text-center text-gray-500">No other users found.</div>
      )}
    </div>
  );
}

export default OtherUsers;
