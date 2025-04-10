import React from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import FileUploadPage from "./Training/FileUploadPage";
import Crediantals from "./Training/Crediantals";
import Management from "./Training/Management";
import MarketStructure from "./Training/MarketStructure";
import CustomNavbar from "./CustomNavbar";
import Login from "./Login";
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
  // const navigate = useNavigate();
  const { authState } = useMyContext();
  const location = useLocation();

  if (authState.loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border p-5" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const showNavbar = authState.isAuthenticated && location.pathname !== '/';

  return (
    <>
      {showNavbar && <CustomNavbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/user" element={<Users />} />
        <Route path="/register" element={<PrivateRoute element={<Register />} />} />
        <Route path="/home" element={<PrivateRoute element={<Home />} />} />
        <Route path="/trackhome" element={<PrivateRoute element={<ShipmentTracking />} />} />
        <Route path="/trainingdata" element={<PrivateRoute element={
          authState.role === 'Training' ? <TrainingDetails /> : <TrackingDetails />
        } />} />
        <Route path="/credentials" element={<PrivateRoute element={<Crediantals />} />} />
        <Route path="/management" element={<PrivateRoute element={<Management />} />} />
        <Route path="/marketstructure" element={<PrivateRoute element={<MarketStructure />} />} />
        <Route path="/trackingdetails" element={<PrivateRoute element={<FileUploadPage />} />} />
        <Route path="/livetrack" element={<PrivateRoute element={<LiveTrack />} />} />
        <Route path="/upslivetrack" element={<PrivateRoute element={<UpsLiveTrack />} />} />
        <Route path="*" element={<div className="container mt-5 text-center">404 Page Not Found</div>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppWithProvider />
      </BrowserRouter>
    </div>
  );
}

function AppWithProvider() {
  const navigate = useNavigate();
  return (
    <MyProvider navigate={navigate}>
      <AppContent />
    </MyProvider>
  );
}

export default App;