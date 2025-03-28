import React, { useState } from "react";
import axios from "axios";
import { HiMiniEye } from "react-icons/hi2";
import { BsFillEyeSlashFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import CustomAlert from "./CustomAlert";

const UpdatePasswordForm = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState({
    sendOtp: false,
    verifyOtp: false,
    updatePassword: false
  });
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "" // 'success' or 'error'
  });

  const showAlertMessage = (message, type) => {
    setAlert({
      show: true,
      message,
      type
    });
    setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleSendOtp = async () => {
    if (!email) {
      showAlertMessage("Please enter your email address", "error");
      return;
    }

    setIsLoading(prev => ({ ...prev, sendOtp: true }));
    setError("");
    
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/send-otp`,
        { email }
      );
      
      if (response.status === 200) {
        showAlertMessage("OTP sent to your email.", "success");
        setOtpSent(true);
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send OTP. Please try again.";
      showAlertMessage(message, "error");
    } finally {
      setIsLoading(prev => ({ ...prev, sendOtp: false }));
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      showAlertMessage("Please enter the OTP", "error");
      return;
    }

    setIsLoading(prev => ({ ...prev, verifyOtp: true }));
    setError("");
    
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/verify-otp`,
        { email, otp }
      );
      
      if (response.status === 200) {
        showAlertMessage("OTP verified successfully.", "success");
        setOtpVerified(true);
      }
    } catch (error) {
      const message = error.response?.data?.message || "Invalid OTP. Please try again.";
      showAlertMessage(message, "error");
    } finally {
      setIsLoading(prev => ({ ...prev, verifyOtp: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showAlertMessage("New password and confirm password do not match.", "error");
      return;
    }
    if (newPassword.length < 6) {
      showAlertMessage("Password should be at least 6 characters long.", "error");
      return;
    }

    setIsLoading(prev => ({ ...prev, updatePassword: true }));
    setError("");
    
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/update-password`,
        { email, password: newPassword }
      );
      
      if (response.status === 200) {
        showAlertMessage("Password updated successfully. Redirecting to login...", "success");
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update password.";
      showAlertMessage(message, "error");
    } finally {
      setIsLoading(prev => ({ ...prev, updatePassword: false }));
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card shadow-lg border-0 rounded-3">
          <div className="text-center py-3">
            <h4 className="mb-0">Update Password</h4>
          </div>
          <div className="card-body p-4">
            {/* Custom Alert */}
            {alert.show && (
              <CustomAlert
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert(prev => ({ ...prev, show: false }))}
              />
            )}

            <form onSubmit={handleSubmit} className="needs-validation">
              {!otpSent && (
                <div className="mb-4">
                  <label htmlFor="email" className="form-label fw-bold">
                    Email Address
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-envelope-fill"></i>
                    </span>
                    <input
                      type="email"
                      id="email"
                      className="form-control form-control-lg border shadow-none"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading.sendOtp}
                    />
                  </div>
                  <div className="d-grid gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={handleSendOtp}
                      disabled={isLoading.sendOtp}
                    >
                      {isLoading.sendOtp ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Sending...
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {otpSent && !otpVerified && (
                <div className="mb-4">
                  <label htmlFor="otp" className="form-label fw-bold">
                    Enter OTP
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-shield-lock-fill"></i>
                    </span>
                    <input
                      type="text"
                      id="otp"
                      className="form-control form-control-lg shadow-none"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      disabled={isLoading.verifyOtp}
                    />
                  </div>
                  <div className="d-grid gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={handleVerifyOtp}
                      disabled={isLoading.verifyOtp}
                    >
                      {isLoading.verifyOtp ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Verifying...
                        </>
                      ) : (
                        "Verify OTP"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {otpVerified && (
                <>
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="form-label fw-bold">
                      New Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-key-fill"></i>
                      </span>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        id="newPassword"
                        className="form-control form-control-lg shadow-none"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={isLoading.updatePassword}
                      />
                      <button
                        type="button"
                        className="btn btn-light border"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        disabled={isLoading.updatePassword}
                      >
                        {showNewPassword ? (
                          <HiMiniEye size={20} />
                        ) : (
                          <BsFillEyeSlashFill size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="confirmPassword"
                      className="form-label fw-bold"
                    >
                      Confirm Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-key-fill"></i>
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        className="form-control form-control-lg shadow-none"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading.updatePassword}
                      />
                      <button
                        type="button"
                        className="btn btn-light border"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={isLoading.updatePassword}
                      >
                        {showConfirmPassword ? (
                          <HiMiniEye size={20} />
                        ) : (
                          <BsFillEyeSlashFill size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg"
                      disabled={isLoading.updatePassword}
                    >
                      {isLoading.updatePassword ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordForm;