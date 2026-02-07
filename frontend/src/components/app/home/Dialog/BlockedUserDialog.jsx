import React from "react";
import DialogWrapper from "../../../../comman/DialogWrapper";

const BlockedUserDialog = ({ blockedUsers, onClose, handleUnBlock }) => {
  return (
    <>
      <DialogWrapper id="blockedUsersDialog" onClose={onClose}>
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
                  className="mr-4 w-12 rounded-full"
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
          <button className="btn flex w-full" onClick={onClose}>
            Close
          </button>
        </div>
      </DialogWrapper>
    </>
  );
};

export default BlockedUserDialog;
