import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const PrivateRoutes = () => {
  const accessToken = Cookies.get("AccessToken");
  const refreshToken = Cookies.get("RefreshToken");

  // Require a valid access token for private routes. Relying on a stored
  // refresh token alone can incorrectly grant access when the access token
  // is missing or expired.
  return accessToken ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;
