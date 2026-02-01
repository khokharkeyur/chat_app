import React from "react";
import InnerMessage from "./InnerMessage";
import useGetMessages from "../../../../hooks/useGetMessages";
import { useSelector, useDispatch } from "react-redux";
import useGetRealTimeMessage from "../../../../hooks/useGetRealTimeEvents";
import axiosInterceptors from "../../axiosInterceptors/index";
import { useSocket } from "../../../../config/SocketContext";

function ManyMessage() {
  useGetMessages();
  const { messages } = useSelector((store) => store.message);

  const handleDeleteMessage = async (messageId) => {
    try {
      await axiosInterceptors.delete(`/message/delete/${messageId}`);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <div className="px-4 flex-1 overflow-auto">
      {messages &&
        messages?.map((message) => {
          return (
            <InnerMessage
              key={message._id}
              message={message}
              onDelete={handleDeleteMessage}
            />
          );
        })}
    </div>
  );
}

export default ManyMessage;
