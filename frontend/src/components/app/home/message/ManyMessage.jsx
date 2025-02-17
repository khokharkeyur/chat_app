import React from "react";
import InnerMessage from "./InnerMessage";
import useGetMessages from "../../../../hooks/useGetMessages";
import { useSelector, useDispatch } from "react-redux";
import useGetRealTimeMessage from "../../../../hooks/useGetRealTimeMessage";
import axiosInterceptors from "../../axiosInterceptors/index";
import { editMessage, deleteMessage } from "../../../../redux/messageSlice";

function ManyMessage() {
  useGetMessages();
  useGetRealTimeMessage();
  const dispatch = useDispatch();
  const { messages } = useSelector((store) => store.message);

  const handleEditMessage = async (messageId, newContent) => {
    try {
      const response = await axiosInterceptors.put(`/message/edit/${messageId}`, {
        message: newContent,
      });
      dispatch(editMessage(response.data));
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axiosInterceptors.delete(`/message/delete/${messageId}`);
      dispatch(deleteMessage(messageId));
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
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
            />
          );
        })}
    </div>
  );
}

export default ManyMessage;
