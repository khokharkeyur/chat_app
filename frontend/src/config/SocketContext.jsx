import { createContext, useContext, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setOnlineUsers } from "../redux/userSlice";
import { socket } from "../services/socket";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((store) => store.user);

  useEffect(() => {
    if (!authUser) return;

    socket.auth = { userId: authUser._id };
    socket.connect();

    socket.on("getOnlineUsers", (users) => {
      dispatch(setOnlineUsers(users));
    });

    return () => {
      socket.off("getOnlineUsers");
      socket.disconnect();
    };
  }, [authUser]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
