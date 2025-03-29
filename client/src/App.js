import React from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import FileUploadPage from "./Training/FileUploadPage";
import Crediantals from "./Training/Crediantals";
import Management from "./Training/Management";
import MarketStructure from "./Training/MarketStructure";
import CustomNavbar from "./CustomNavbar";
import  Login  from "./Login";
import { Register } from "./Register";
import PrivateRoute from "./PrivateRoute";
import Home from "./Training/Home";
import Users from "./UpdatePasswordForm";
import { MyProvider } from "./MyContext";
import LiveTrack from "./Tracking/LiveTrack";
import ShipmentTracking from "./Tracking/ShipmentTracking";
import UpsLiveTrack from "./Tracking/UpsLiveTrack";
import { useMyContext } from "./MyContext";
import TrainingDetails from "./Training/TrainingDetails";
import TrackingDetails from "./Tracking/TrackingDetails";

function AppContent() {
  const { authState } = useMyContext();
  const location = useLocation();
  const isAuthenticated = authState.isAuthenticated;
  const showNavbar = isAuthenticated && !['/'].includes(location.pathname);

  return (
    <>
      {showNavbar && <CustomNavbar />}
      <Routes>
        {/* Root route with immediate redirect if authenticated */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              authState.role === 'Training' ? (
                <Navigate to="/home" replace />
              ) : (
                <Navigate to="/trackhome" replace />
              )
            ) : (
              <Login />
            )
          } 
        />
        
        {/* Public routes */}
        <Route path="/user" element={<Users />} />
        <Route path="/register" element={<Register />} />

        {/* Training role routes */}
        {authState.role === 'Training' && (
          <>
            <Route path="/home" element={<PrivateRoute element={<Home />} />} />
            <Route path="/trainingdata" element={<PrivateRoute element={<TrainingDetails />} />} />
            <Route path="/credentials" element={<PrivateRoute element={<Crediantals />} />} />
            <Route path="/management" element={<PrivateRoute element={<Management />} />} />
            <Route path="/marketstructure" element={<PrivateRoute element={<MarketStructure />} />} />
            <Route path="/trackingdetails" element={<PrivateRoute element={<FileUploadPage />} />} />
          </>
        )}

        {/* Tracking role routes */}
        {authState.role === 'Tracking' && (
          <>
            <Route path="/trackhome" element={<PrivateRoute element={<ShipmentTracking />} />} />
            <Route path="/trainingdata" element={<PrivateRoute element={<TrackingDetails />} />} />
            <Route path="/livetrack" element={<PrivateRoute element={<LiveTrack />} />} />
            <Route path="/upslivetrack" element={<PrivateRoute element={<UpsLiveTrack />} />} />
          </>
        )}

        {/* Fallback route */}
        <Route path="*" element={<div className="container mt-5 text-center">404 Page Not Found</div>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <MyProvider>
          <AppContent />
        </MyProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;