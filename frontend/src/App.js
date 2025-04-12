import React, { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useLocation,
} from "react-router-dom";
import Signup from "./pages/SignupForm";
import Dashboard from "./pages/dashBoard";
import Login from "./pages/Login";
import ForgetPassword from "./pages/ForgetPassword";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import { setSocket } from "./redux/socketSlice";
import { setOnlineUsers } from "./redux/userSlice";
import PrivateRoutes from "./components/PrivateRoutes";

function AppContent() {
  const location = useLocation();
  const { authUser } = useSelector((store) => store.user);
  const { socket } = useSelector((store) => store.socket);
  const dispatch = useDispatch();

  useEffect(() => {
    if (authUser) {
      const socketio = io(`http://localhost:8080`, {
        query: {
          userId: authUser._id,
        },
      });
      dispatch(setSocket(socketio));

      socketio?.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });
      return () => socketio.close();
    } else {
      if (socket) {
        socket.close();
        dispatch(setSocket(null));
      }
    }
  }, [authUser]);

  return (
    <div
      className={`p-4 h-screen flex items-center justify-center ${location.pathname === "/signup" ? "" : "h-screen"}`}
    >
      <Outlet />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppContent />,
    children: [
      {
        path: "/",
        element: <PrivateRoutes />,
        children: [
          {
            path: "/",
            element: <Dashboard />,
          },
        ],
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/forgetPassword",
        element: <ForgetPassword />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
