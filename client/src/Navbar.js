import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleLogout = () => {
    localStorage.clear(); // Clears the local storage
    window.location.href = "/"; // Redirect to the home page
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow">
      <div className="container-fluid">
        <div className="d-flex align-items-center">
          <img src="logo.webp" height={40} alt="Logo" />
          <a className="navbar-brand fw-bold fs-6" href="/home">
            Techno Communications LLC
          </a>
        </div>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-controls="navbarNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/trainingdata">
                Training Data
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/trackingdetails">
                Upload
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/marketstructure">
                Market Structure
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/management">
                Management
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/credentials">
                Credentials
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/register">
                Register
              </Link>
            </li>
            <li className="nav-item">
              <button
                className="btn btn-danger mx-2 btn-small"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
