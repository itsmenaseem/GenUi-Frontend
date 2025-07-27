import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoutes = () => {
  const token = useSelector((state) => state.auth.token);
  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Else render children (Outlet)
  return <Outlet />;
};

export default PrivateRoutes;
