import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import FileUploadPage from "./FileUploadPage";
import Credentials from "./Crediantals"; // Fixed typo in component name
import Management from "./Management";
import MarketStructure from "./MarketStructure";
import Navbar from "./Navbar";
import TrackingDetails from "./TrackingDetails";
import { Login } from "./Login";
import { Register } from "./Register";
import PrivateRoute from "./PrivateRoute"; // Import the PrivateRoute
import Home from "./Home";
import Users from "./UpdatePasswordForm";
import { useEffect, useState } from "react";

// Create a separate component for routing logic
function AppRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true); // Add a loading state

  // Check if the user is authenticated
  const isAuthenticated = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    if (isAuthenticated && location.pathname === "/") {
      navigate("/home"); // Redirect to home if already logged in and trying to access the login page
    }
    setIsLoading(false); // Set loading to false after the check
  }, [isAuthenticated, navigate, location.pathname]);

  // If loading, render nothing (or a loading spinner)
  if (isLoading) {
    return null; // Or return a loading spinner
  }

  return (
    <>
      {/* Conditionally render Navbar only if authenticated and not on the login page */}
      {isAuthenticated && location.pathname !== "/" && <Navbar />}

      <Routes>
        {/* Public routes */}
       {!isAuthenticated&& <Route path="/" element={<Login />} />}

        {/* Protected routes */}
        <Route path="/home" element={<PrivateRoute element={<Home />} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/trainingdata" element={<PrivateRoute element={<TrackingDetails />} />} />
        <Route path="/credentials" element={<PrivateRoute element={<Credentials />} />} />
        <Route path="/management" element={<PrivateRoute element={<Management />} />} />
        <Route path="/marketstructure" element={<PrivateRoute element={<MarketStructure />} />} />
        <Route path="/trackingdetails" element={<PrivateRoute element={<FileUploadPage />} />} />
        <Route path="/user" element={<Users />} />
      </Routes>
    </>
  );
}

// Main App component
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </div>
  );
}

export default App;