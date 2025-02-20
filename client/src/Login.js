import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';

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
    <div className="container-fluid min-vh-100 d-flex flex-column justify-content-center" 
         style={{ 
           background: 'linear-gradient(120deg, #f6f9fc 0%, #eef2f7 100%)',
         }}>
      <h1 className="text-center mb-5 fw-bold"
          style={{ 
            color: '#E10174',
            fontSize: '4.5rem',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
        Welcome Back..
      </h1>

      <div className="row w-100 m-0">
        <div className="col-lg-6 d-none d-lg-flex justify-content-center align-items-center">
          <img
            src="logoT.webp"
            alt="Logo"
            className="img-fluid w-75"
            style={{
              filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1))',
              transform: 'translateY(-10px)'
            }}
          />
        </div>

        <div className="col-lg-6 col-md-8 col-sm-12 mx-auto d-flex justify-content-center align-items-center p-1">
          <div className="card shadow-lg mx-auto border-0" 
               style={{ 
                 maxWidth: '500px', 
                 width: '90%',
                 borderRadius: '15px',
                 background: 'rgba(255, 255, 255, 0.95)',
                 backdropFilter: 'blur(10px)'
               }}>
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger" 
                     role="alert"
                     style={{
                       borderRadius: '10px',
                       border: 'none',
                       background: 'rgba(220, 53, 69, 0.1)',
                       color: '#dc3545'
                     }}>
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <h4 className="mb-3 text-center fw-bold"
                    style={{ color: '#2c3e50' }}>
                  Login
                </h4>
                
                <div className="mb-2 position-relative">
                  <div className="input-group">
                    <span className="input-group-text border-end-0"
                          style={{ 
                            background: 'transparent',
                            borderColor: '#e1e8ef'
                          }}>
                      <FaEnvelope style={{ color: '#E10174' }} />
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0 shadow-none"
                      style={{
                        borderColor: '#e1e8ef',
                        padding: '0.75rem',
                        fontSize: '0.95rem'
                      }}
                      id="email"
                      name="email"
                      value={credentials.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      required
                    />
                  </div>
                </div>

                <div className="mb-2 position-relative">
                  <div className="input-group">
                    <span className="input-group-text border-end-0 "
                          style={{ 
                            background: 'transparent',
                            borderColor: '#e1e8ef'
                          }}>
                      <FaLock style={{ color: '#E10174' }} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control border-start-0 border-end-0 shadow-none"
                      style={{
                        borderColor: '#e1e8ef',
                        padding: '0.75rem',
                        fontSize: '0.95rem'
                      }}
                      id="password"
                      name="password"
                      value={credentials.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      required
                    />
                    <span
                      className="input-group-text border-start-0"
                      style={{ 
                        cursor: 'pointer',
                        background: 'transparent',
                        borderColor: '#e1e8ef'
                      }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 
                        <FaEyeSlash style={{ color: '#E10174' }} /> : 
                        <FaEye style={{ color: '#E10174' }} />
                      }
                    </span>
                  </div>
                </div>

                <div className="mb-1">
                  <a href="/user" 
                     className="text-decoration-none"
                     style={{ 
                       color: '#E10174',
                       fontSize: '0.9rem',
                       fontWeight: '500'
                     }}>
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  className="btn w-100 mt-1 mb-1 text-white"
                  style={{ 
                    backgroundColor: '#E10174',
                    border: 'none',
                    padding: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(225, 1, 116, 0.2)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Login };