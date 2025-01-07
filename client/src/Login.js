import React, { useState } from 'react';
import './Login.css'; // Optional: Custom styles if you want
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import the eye icons

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token); // Save the token
        // Redirect to /home after successful login
        window.location.href = '/home';
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column justify-content-center bg-gradient">
      {/* Centered Heading */}
      <h1 className="text-center mb-5" style={{ color: '#E10174', fontWeight: 'bold', fontSize: '2.5rem' }}>
        Techno Communications LLC
      </h1>

      <div className="row w-100 m-0">
        {/* Left side with logo */}
        <div className="col-md-6 bg-pink d-flex justify-content-center align-items-center">
          <img
            src="logo - Copy.png"
            alt="Logo"
            className="img-fluid w-75"
          />
        </div>

        {/* Right side with login form */}
        <div className="col-md-6 d-flex justify-content-center align-items-center p-5">
          <div className="card shadow-lg w-75 border-0 rounded-1">
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <h4 className="mb-4 text-center text-dark">Login</h4>
                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control  shadow-none border"
                    id="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div className="mb-1 position-relative">
                  <input
                    type={showPassword ? "text" : "password"} // Toggle between text and password input type
                    className="form-control shadow-none border"
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                  />
                  {/* Eye icon for password visibility toggle */}
                  <span 
                    className="position-absolute top-50 end-0 me-3" 
                    style={{ cursor: 'pointer', transform: 'translateY(-50%)' }} 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Toggle the icon */}
                  </span>
                </div>
                <button type="submit" className="btn btn-pink w-100 text-white mt-3 mb-3">Login</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Login };
