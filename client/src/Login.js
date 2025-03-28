import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useMyContext } from "./MyContext";
import CustomAlert from "./CustomAlert";
import "./Login.css";

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { updateAuth } = useMyContext();
  const [showAlert, setShowAlert] = useState(false);

  // Clear error when user starts typing
  useEffect(() => {
    if (error && (credentials.email || credentials.password)) {
      setError("");
      setShowAlert(false);
    }
  }, [credentials.email, credentials.password, error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!credentials.email || !credentials.password) {
      setError("Both email and password are required");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (credentials.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowAlert(false);
  
    if (!validateForm()) {
      setShowAlert(true);
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Step 1: Perform the login request
      const loginResponse = await fetch(
        `${process.env.REACT_APP_BASE_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify(credentials),
        }
      );
  
      if (!loginResponse.ok) {
        const errorData = await loginResponse.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed");
      }
  
      // Step 2: If login is successful, fetch user details
      const userResponse = await fetch(
        `${process.env.REACT_APP_BASE_URL}/users/me`,
        {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        }
      );
  
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }
  
      const userData = await userResponse.json();
      const { role, id } = userData;
  
      // Step 3: Update authentication state and redirect
      updateAuth(true, role, id);
  
      navigate(
        {
          Training: "/home",
          Tracking: "/trackhome",
        }[role] || "/",
        { replace: true }
      );
    } catch (err) {
      setError(err.message || "An error occurred during login");
      setShowAlert(true);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="container-fluid min-vh-100 d-flex flex-column justify-content-center position-relative"
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f3e7e9 100%)",
        overflow: "hidden",
      }}
    >
      {/* Decorative Elements */}
      <div className="position-absolute bg-blob top-blob" />
      <div className="position-absolute bg-blob bottom-blob" />

      {/* Main Content */}
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-5 login-heading"
      >
        Welcome Back!
      </motion.h1>

      <div className="row w-100 m-0">
        {/* Logo Section */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="col-md-6 d-flex justify-content-center align-items-center"
        >
          <motion.img
            transition={{ type: "spring", stiffness: 300 }}
            src="logoT.webp"
            alt="Company Logo"
            className="img-fluid w-75"
          />
        </motion.div>

        {/* Login Form Section */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="col-md-6 d-flex justify-content-center align-items-center p-2 p-lg-5"
        >
          <div
            className="card shadow-lg col-12 col-md-8 col-lg-10 border-0 rounded-4"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(225, 1, 116, 0.1)",
            }}
          >
            <div className="card-body p-5">
              {showAlert && (
                <CustomAlert
                  message={error}
                  type="error"
                  onClose={() => setShowAlert(false)}
                />
              )}

              <form onSubmit={handleSubmit}>
                <h4 className="mb-4 text-center fw-bold login-subheading">
                  Login to Your Account
                </h4>

                {/* Email Input */}
                <div className="mb-3 position-relative">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    className="form-control login-input"
                    id="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required
                    autoComplete="username"
                  />
                </div>

                {/* Password Input */}
                <div className="mb-3 position-relative">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control login-input"
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                    minLength="6"
                    autoComplete="current-password"
                  />
                  <motion.span
                    // whileHover={{ scale: 1.2 }}
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </motion.span>
                </div>
                <div>
                  <a href="/user" className="text-decoration-none">
                    Forgot Password?
                  </a>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="btn login-button w-100 mt-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div
                      className="spinner-border spinner-border-sm"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    "Login"
                  )}
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export { Login };
