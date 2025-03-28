import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Register = () => {
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    role: 'Training'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!userData.email || !userData.password || !confirmPassword) {
      setError('All fields are required');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (userData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    if (userData.password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess('Registration successful! Redirecting to login...');
      // setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light">
      {success && (
        <div className="alert alert-success alert-dismissible mt-5 w-100 text-center">
          <strong>{success}</strong>
        </div>
      )}

      <div className="container my-5 ">
        <div className="row justify-content-center">
          <div className="col-md-5 d-flex justify-content-center align-items-center mb-4 mb-md-0 gap-5">
            <img
              src="logoT.webp"
              alt="Company Logo"
              className="img-fluid"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>

          <div className="col-md-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-4">
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show">
                    {error}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setError('')}
                    ></button>
                  </div>
                )}

                <h2 className="text-center mb-4">Create Account</h2>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={userData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="role" className="form-label">Role</label>
                    <select
                      className="form-select"
                      id="role"
                      name="role"
                      value={userData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="Training">Training</option>
                      <option value="Tracking">Tracking</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="input-group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control"
                        id="password"
                        name="password"
                        value={userData.password}
                        onChange={handleChange}
                        placeholder="At least 8 characters"
                        required
                        minLength="8"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <div className="input-group">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="form-control"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        required
                        minLength="8"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Registering...
                      </>
                    ) : (
                      'Register'
                    )}
                  </button>
                </form>

                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Register };