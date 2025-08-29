// Login.js
import { useState, useEffect } from 'react';
import './Login.css';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useMyContext } from './MyContext';
import { validateLoginForm } from './utils/validators';
import { useNavigate } from 'react-router-dom';
import { loginUser } from './services/authService';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { updateAuth, authState } = useMyContext();

  // 🔹 Redirect if already logged in
  useEffect(() => {
    if ((authState.isAuthenticated && !authState.loading) || localStorage.getItem("userdata")) {
      navigate(authState.role === "Training" ? "/home" : "/traininghome", { replace: true });
    }
  }, [authState, navigate, authState.isAuthenticated, authState.loading, authState.role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateLoginForm(credentials);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const data = await loginUser(credentials);
      updateAuth(true, data.user.department, data.user.id);
      localStorage.setItem("userdata", JSON.stringify(data));
      localStorage.setItem("userRole", data.user.department);
      localStorage.setItem("userId", data.user.id);
      navigate(data.user.department === "Training" ? "/home" : "/traininghome", { replace: true });
      setCredentials({ email: "", password: "" });
    } catch (err) {
      setError(err.message);
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
      style={{ background: "linear-gradient(135deg, #ffffff 0%, #f3e7e9 100%)", overflow: "hidden" }}
    >
      {/* Heading */}
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-5 login-heading"
      >
        Welcome Back
      </motion.h1>

      <div className="row w-100 m-0">
        {/* Left side (logo) */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="col-md-6 d-flex justify-content-center align-items-center"
        >
          <img
            src="logoT.webp"
            alt="Company Logo"
            className="img-fluid w-75"
            style={{
              filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1))',
              transform: 'translateY(-10px)'
            }}
          />
        </motion.div>

        {/* Right side (form) */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="col-md-6 d-flex justify-content-center align-items-center p-2 p-lg-5"
        >
          <div className="card shadow-lg col-12 col-md-8 col-lg-10 border-0 rounded-4"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(225, 1, 116, 0.1)",
            }}
          >
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <h4 className="mb-4 text-center text-dark">Login</h4>

                {/* Email */}
                <div className="mb-3 position-relative">
                  <FaEnvelope className="position-absolute top-50 start-0 ms-3 translate-middle-y" style={{ color: '#E10174' }} />
                  <input
                    type="email"
                    className="form-control shadow-none border ps-5"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required
                  />
                </div>

                {/* Password */}
                <div className="mb-3 position-relative">
                  <FaLock className="position-absolute top-50 start-0 ms-3 translate-middle-y" style={{ color: '#E10174' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control shadow-none border ps-5"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    className="position-absolute top-50 end-0 me-3 bg-transparent border-0"
                    style={{ transform: 'translateY(-50%)' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash style={{ color: '#E10174' }} /> : <FaEye style={{ color: '#E10174' }} />}
                  </button>
                </div>

                {/* Forgot Password */}
                <a href="/user" className="text-decoration-none" style={{ color: '#E10174' }}>
                  Forgot password?
                </a>

                {/* Submit */}
                <motion.button
                  type="submit"
                  className="btn w-100 mt-3 mb-3 text-white"
                  style={{ backgroundColor: '#E10174', border: 'none' }}
                  disabled={isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;