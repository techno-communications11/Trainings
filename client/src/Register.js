import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // For password visibility toggle
import './Login.css'; // Optional: Custom styles if you want

const Register = () => {
  const [userData, setUserData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Manage password visibility
  const [confirmPassword, setConfirmPassword] = useState(''); // For validation purposes

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password match (confirmPassword is just for validation, not visible)
    if (userData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Please login.');
        setError('');
        setUserData({ email: '', password: '' });
        setConfirmPassword('');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className='d-flex  flex-column justify-content-center align-items-center' >{success && <div class="alert alert-success alert-dismissible mt-5">
        
        <strong>{success}</strong> 
      </div>}

    
    <div className="container-fluid d-flex justify-content-center align-items-center bg-gradient mt-5">
      {/* Centered Heading */}
      
      
      <div className="row w-100 justify-content-center">
        {/* Image on the left */}
        <div className="col-md-5 d-flex justify-content-center align-items-center">
          <img 
            src="logoT.webp" // Replace with   logo URL
            alt="Logo"
            className="img-fluid animate__animated animate__fadeIn" 
            style={{ maxWidth: '600px', height:"300px" }} 
          />
        </div>

        {/* Form on the right */}
        <div className="col-md-5">
          <div className="card shadow-lg border-0 rounded-lg p-4">
            <div className="card-body animate__animated animate__fadeIn animate__delay-1s">
              {error && <div className="alert alert-danger">{error}</div>}
              

              <form onSubmit={handleSubmit}>
                <h4 className="mb-4 text-center text-dark">Register</h4>

                {/* Email Field */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required
                  />
                </div>

                {/* Password Field */}
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
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-pink w-100 text-white mt-3">Register</button>
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
