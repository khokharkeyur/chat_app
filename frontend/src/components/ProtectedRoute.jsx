import { Navigate, Outlet } from "react-router-dom";

const PrivateRoutes = () => {
  const token = localStorage.getItem("Token");
  
  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;
