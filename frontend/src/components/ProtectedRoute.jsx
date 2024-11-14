import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'cookies-js'; 

const PrivateRoutes = () => {
  const auth = { token: true };
  const token = Cookies.get('token');
  console.log('Token:', token); 
  

  return (
    auth.token ? <Outlet /> : <Navigate to="/login" />
  );
};

export default PrivateRoutes;
