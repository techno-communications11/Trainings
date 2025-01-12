import React, { useState } from "react";
import axios from "axios";
import { HiMiniEye } from "react-icons/hi2";
import { BsFillEyeSlashFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

const UpdatePasswordForm = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/send-otp`,
        { email }
      );
      if (response.status === 200) {
        setSuccess("OTP sent to your email.");
        setOtpSent(true);
      }
    } catch (error) {
      setError("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/verify-otp`,
        { email, otp }
      );
      if (response.status === 200) {
        setSuccess("OTP verified successfully.");
        setOtpVerified(true);
        setError("");
      }
    } catch (error) {
      setError("Invalid OTP. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password should be at least 6 characters long.");
      return;
    }
    setError("");

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/update-password`,
        {
          email,
          password: newPassword,
        }
      );
      if (response.status === 200) {
        setSuccess("Password updated successfully.");
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      setError("Failed to update password.");
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
            {error && (
              <div
                className="alert alert-danger alert-dismissible fade show"
                role="alert"
              >
                {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError("")}
                ></button>
              </div>
            )}
            {success && (
              <div
                className="alert alert-success alert-dismissible fade show"
                role="alert"
              >
                {success}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSuccess("")}
                ></button>
              </div>
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
                    />
                  </div>
                  <div className="d-grid gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={handleSendOtp}
                    >
                      Send OTP
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
                    />
                  </div>
                  <div className="d-grid gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={handleVerifyOtp}
                    >
                      Verify OTP
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
                      />
                      <button
                        type="button"
                        className="btn btn-light border"
                        onClick={() => setShowNewPassword(!showNewPassword)}
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
                      />
                      <button
                        type="button"
                        className="btn btn-light border"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
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
                    <button type="submit" className="btn btn-primary btn-lg">
                      Update Password
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
