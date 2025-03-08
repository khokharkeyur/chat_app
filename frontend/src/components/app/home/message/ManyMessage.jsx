import React from "react";
import InnerMessage from "./InnerMessage";
import useGetMessages from "../../../../hooks/useGetMessages";
import { useSelector, useDispatch } from "react-redux";
import useGetRealTimeMessage from "../../../../hooks/useGetRealTimeMessage";
import axiosInterceptors from "../../axiosInterceptors/index";

function ManyMessage() {
  useGetMessages();
  useGetRealTimeMessage();
  const { messages } = useSelector((store) => store.message);
  const { socket } = useSelector((store) => store.socket);

  const handleEditMessage = async (messageId, newMessageContent) => {
    try {
      // const response = await axiosInterceptors.put(
      //   `/message/edit/${messageId}`,
      //   {
      //     message: newContent,
      //   }
      // );
      socket.emit("editMessage", messageId, newMessageContent);

      await axiosInterceptors.put(`/messages/edit/${messageId}`, {
        message: newMessageContent,
      });
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      socket.emit("deleteMessage", messageId);
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
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
            />
          );
        })}
    </div>
  );
}

export default ManyMessage;
