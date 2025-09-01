import React, { useState } from "react";
import { Link } from "react-router-dom";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import "./Styles/CustomNavbar.css";
import { useMyContext } from "./MyContext";

const CustomNavbar = () => {
  const { authState, logout } = useMyContext();
  const [isOpen, setIsOpen] = useState(false);

  if (authState.loading || !authState.isAuthenticated) {
    return null;
  }

  const homeRoute = {
    Training: "/home",
    Tracking: "/traininghome",
  }[authState.role] || "/";

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const handleNavLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <Navbar expand="lg" bg="light" className="shadow" expanded={isOpen}>
      <Container fluid>
        <div className="d-flex align-items-center">
          <img src="logo.webp" height={40} alt="Logo" />
          <Navbar.Brand as={Link} to={homeRoute} className="fw-bold fs-6">
            Techno Communications LLC
          </Navbar.Brand>
        </div>

        <Navbar.Toggle
          aria-controls="navbarNav"
          onClick={() => setIsOpen(!isOpen)}
        />

        <Navbar.Collapse id="navbarNav">
          <Nav className="ms-auto align-items-center">
            {authState.role === "Tracking" && (
              <>
                <Nav.Item>
                  <Button
                    as={Link}
                    to="/upslivetrack"
                    variant="outline-success"
                    className="mx-1 px-4 py-2 rounded-pill shadow-sm"
                    onClick={handleNavLinkClick}
                  >
                    <img
                      src="/ups.jpg"
                      height={30}
                      alt="UPS"
                      className="me-2"
                    />
                    Track One
                  </Button>
                </Nav.Item>

                <Nav.Item>
                  <Button
                    as={Link}
                    to="/livetrack"
                    variant="outline-success"
                    className="mx-1 px-4 py-2 rounded-pill shadow-sm"
                    onClick={handleNavLinkClick}
                  >
                    <img
                      src="/fedex.webp"
                      height={30}
                      alt="FedEx"
                      className="me-2"
                    />
                    Track One
                  </Button>
                </Nav.Item>

                <Nav.Item>
                  <Button
                    as={Link}
                    to="/trainingdata"
                    variant="outline-primary"
                    className="mx-1 px-4 py-2 rounded-pill shadow-sm"
                    onClick={handleNavLinkClick}
                  >
                    Tracking Details
                  </Button>
                </Nav.Item>
              </>
            )}

            {authState.role === "Training" && (
              <>
                <Nav.Item>
                  <Nav.Link
                    as={Link}
                    to="/trainingdata"
                    onClick={handleNavLinkClick}
                  >
                    Training Data
                  </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                  <Nav.Link
                    as={Link}
                    to="/trackingdetails"
                    onClick={handleNavLinkClick}
                  >
                    Upload
                  </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                  <Nav.Link
                    as={Link}
                    to="/marketstructure"
                    onClick={handleNavLinkClick}
                  >
                    Market Structure
                  </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                  <Nav.Link
                    as={Link}
                    to="/management"
                    onClick={handleNavLinkClick}
                  >
                    Management
                  </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                  <Nav.Link
                    as={Link}
                    to="/credentials"
                    onClick={handleNavLinkClick}
                  >
                    Credentials
                  </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                  <Nav.Link as={Link} to="/register" onClick={handleNavLinkClick}>
                    Register
                  </Nav.Link>
                </Nav.Item>
              </>
            )}

            <Button
              variant="outline-danger"
              className="jira-logout-btn ms-2"
              onClick={handleLogout}
            >
              <RiLogoutBoxRLine class курс="me-1" /> Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;