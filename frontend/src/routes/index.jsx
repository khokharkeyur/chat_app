import { createBrowserRouter } from "react-router-dom";
import SignupForm from "../pages/SignupForm";
import Dashboard from "../pages/dashBoard";
import Login from "../pages/Login";
import ForgetPassword from "../pages/ForgetPassword";
import MainLayout from "../layouts/MainLayout";
import PrivateRoutes from "../components/PrivateRoutes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
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
        element: <SignupForm />,
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
