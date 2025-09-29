import React from "react";
import DialogWrapper from "../../../../comman/DialogWrapper";

const AdminDetailsDialog = ({ adminDetails, onClose }) => {
  return (
    <div>
      <DialogWrapper id="adminDetailsDialog" onClose={onClose}>
        <>
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
            <button className="btn flex justify-end" onClick={onClose}>
              Close
            </button>
          </div>
        </>
      </DialogWrapper>
    </div>
  );
};

export default AdminDetailsDialog;
