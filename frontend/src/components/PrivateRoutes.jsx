import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const PrivateRoutes = () => {
  const accessToken = Cookies.get("AccessToken");
  const refreshToken = Cookies.get("RefreshToken");

  return accessToken || refreshToken ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;
