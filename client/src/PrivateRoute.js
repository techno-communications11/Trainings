// PrivateRoute.js
import { useMyContext } from "./MyContext";
import Loader from "./utils/Loader";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element }) => {
  const { authState } = useMyContext();
  

  if (authState.loading) {
    return (<Loader/>);
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default PrivateRoute;