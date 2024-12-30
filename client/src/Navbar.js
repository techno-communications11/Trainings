import React, { useState } from "react";
import {Link} from 'react-router-dom'
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleLogout = () => {
    localStorage.clear(); // Clears the local storage
    window.location.href = '/'; // Redirect to the home page
  };
  

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow">
      <div className="container-fluid">
      <div className="navbar-nav me-auto"> 
        <img src="logo - Copy.png" height={50} alt="Logo" />
         <a className="navbar-brand fw-bold" href="/home"> Techno Communications LLC </a> 
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
              <Link className="nav-link fw-medium" as={Link} to="/trainingdata">
                Training Data
              </Link>
            </li>
          <li className="nav-item">
              <Link className="nav-link fw-medium" as={Link} to="/trackingdetails">
                Upload
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium" as={Link} to="/marketstructure">
                Market Structure
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium" as={Link} to="/management">
                Management
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium" as={Link} to="/credentials">
                Credentials
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium" as={Link} to="/register">
                Register
              </Link>
            </li>
            <li className="nav-item">
              <button className="btn btn-danger mx-2 btn-small" onClick={handleLogout} >
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
