import { Navigate } from "react-router-dom";
import { useMyContext } from "./MyContext";

// PrivateRoute checks if the user is authenticated
const PrivateRoute = ({ element, ...rest }) => {
 // Check if token exists in localStorage (or cookies)
  const { authState } = useMyContext();
  const isAuthenticated = authState.isAuthenticated; // Check if the user is authenticated

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if(isAuthenticated && window.location.pathname === '/') {
    if(authState.role === 'Training') {
      window.location.href = '/home';
    }
    else if(authState.role === 'Tracking') {
      window.location.href = '/trackhome';
    }
  }

  return element; // Render the protected route
};

export default PrivateRoute;



