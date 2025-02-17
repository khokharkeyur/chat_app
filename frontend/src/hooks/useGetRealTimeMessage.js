import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setMessages } from "../redux/messageSlice";

const useGetRealTimeMessage = () => {
  const { socket } = useSelector((store) => store.socket);
  const { messages } = useSelector((store) => store.message);
  const dispatch = useDispatch();

  useEffect(() => {
    if (socket) {
      socket.on("newMessage", (newMessage) => {
        dispatch(setMessages([...messages, newMessage]));
      });

      socket.on("messageUpdated", (updatedMessage) => {
        const updatedMessages = messages.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        );
        dispatch(setMessages(updatedMessages));
      });

      socket.on("messageDeleted", (deletedMessage) => {
        const updatedMessages = messages.filter(
          (msg) => msg._id !== deletedMessage._id
        );
        dispatch(setMessages(updatedMessages));
      });
    }

    return () => {
      socket?.off("newMessage");
      socket?.off("messageUpdated");
      socket?.off("messageDeleted");
    };
  }, [socket, messages, dispatch]);

  return null;
};

export default useGetRealTimeMessage;
