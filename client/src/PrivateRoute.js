import { Navigate } from "react-router-dom";

// PrivateRoute checks if the user is authenticated
const PrivateRoute = ({ element, ...rest }) => {
  const isAuthenticated = Boolean(localStorage.getItem("token")); // Check if token exists in localStorage (or cookies)

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return element; // Render the protected route
};

export default PrivateRoute;
