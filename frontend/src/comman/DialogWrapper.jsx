import React, { useRef, useEffect } from "react";

const DialogWrapper = ({ id, children, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        const modal = document.getElementById(id);
        if (modal) {
          modal.close();
          if (onClose) onClose();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id, onClose]);

  return (
    <dialog id={id} className="modal modal-bottom sm:modal-middle">
      <div className="modal-box" ref={modalRef}>
        {children}
      </div>
    </dialog>
  );
};

export default DialogWrapper;
