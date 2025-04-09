import { Navigate } from "react-router-dom";
import { useMyContext } from "./MyContext";

const PrivateRoute = ({ element }) => {
  const { authState } = useMyContext();

  if (authState.loading) {
    return <div className="container mt-5 text-center">Loading...</div>;
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default PrivateRoute;