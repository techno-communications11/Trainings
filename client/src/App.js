import { BrowserRouter, Routes, Route } from "react-router-dom";
import FileUploadPage from "./FileUploadPage";
import Crediantals from "./Crediantals";
import Management from "./Management";
import MarketStructure from "./MarketStructure";
import Navbar from "./Navbar";
import TrackingDetails from "./TrackingDetails";
import { Login } from "./Login";
import { Register } from "./Register";
import PrivateRoute from "./PrivateRoute"; // Import the PrivateRoute
import Home from "./Home";
import Users from "./UpdatePasswordForm";

function App() {
  // Check if the user is authenticated
  const isAuthenticated = Boolean(localStorage.getItem("token"));

  return (
    <div className="App">
      <BrowserRouter>
        {/* Conditionally render Navbar only if authenticated and not on the login page */}
        {isAuthenticated && (window.location.pathname !== '/'&&window.location.pathname!=='/user') && <Navbar />}

        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/home" element={<PrivateRoute element={<Home />} />} />
          <Route path="/trainingdata" element={<PrivateRoute element={<TrackingDetails />} />} />
          <Route path="/credentials" element={<PrivateRoute element={<Crediantals />} />} />
          <Route path="/management" element={<PrivateRoute element={<Management />} />} />
          <Route path="/marketstructure" element={<PrivateRoute element={<MarketStructure />} />} />
          <Route path="/trackingdetails" element={<PrivateRoute element={<FileUploadPage />} />} />
          <Route path="/user" element={<Users />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
