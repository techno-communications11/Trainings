import React, { useState } from 'react';
import './Login.css'; // Custom styles for animations and additional styling
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from 'react-icons/fa'; // Import icons
import { motion } from 'framer-motion'; // For animations

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = '/home';
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <motion.div
      className="container-fluid min-vh-100 d-flex flex-column justify-content-center bg-gradient"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Centered Heading */}
      <motion.h1
        className="text-center mb-5"
        style={{ color: '#E10174', fontWeight: 'bold', fontSize: '2rem' }}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Techno Communications LLC
      </motion.h1>

      <div className="row w-100 m-0">
        {/* Left side with logo */}
        <motion.div
          className="col-lg-6 d-none d-lg-flex justify-content-center align-items-center"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <img
            src="logoT.webp"
            alt="Logo"
            className="img-fluid w-75"
          />
        </motion.div>

        {/* Right side with login form */}
        <motion.div
          className="col-lg-6 col-md-8 col-sm-12 mx-auto d-flex justify-content-center align-items-center p-4"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="card shadow-lg mx-auto border-0 rounded-1" style={{ maxWidth: '500px', width: '90%' }}>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <h4 className="mb-4 text-center text-dark">Login</h4>
                <div className="mb-3 position-relative">
                  <FaEnvelope className="position-absolute top-50 start-0 ms-3 translate-middle-y" style={{ color: '#E10174' }} />
                  <input
                    type="email"
                    className="form-control shadow-none border ps-5"
                    id="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div className="mb-3 position-relative">
                  <FaLock className="position-absolute top-50 start-0 ms-3 translate-middle-y" style={{ color: '#E10174' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control shadow-none border ps-5"
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                  />
                  <span
                    className="position-absolute top-50 end-0 me-3"
                    style={{ cursor: 'pointer', transform: 'translateY(-50%)' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash style={{ color: '#E10174' }} /> : <FaEye style={{ color: '#E10174' }} />}
                  </span>
                </div>
                <a href="/user" className="text-decoration-none" style={{ color: '#E10174' }}>
                  Forgot password?
                </a>
                <motion.button
                  type="submit"
                  className="btn w-100 mt-3 mb-3 text-white"
                  style={{ backgroundColor: '#E10174', border: 'none' }}
                  // whileHover={{ scale: 1.05 }}
                  // whileTap={{ scale: 0.95 }}
                >
                  Login
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