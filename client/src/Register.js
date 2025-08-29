import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Alert } from "./utils/Alert";
import { InputField } from "./utils/InputField";
import { registerUser } from "./services/authService";
import "./Login.css";

export function Register() {
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    role: "Training",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value }); // e.target.name must exist
  };

  const validateForm = () => {
    if (!userData.email || !userData.password || !confirmPassword) {
      setError("All fields are required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (userData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (userData.password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await registerUser(userData);
      setSuccess("Registration successful!");
      setUserData({ email: "", password: "", role: "Training" });
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light">
      <Alert type="success" message={success} onClose={() => setSuccess("")} />
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-5 d-flex justify-content-center align-items-center mb-4 mb-md-0 gap-5">
            <img src="logoT.webp" alt="Logo" className="img-fluid" />
          </div>

          <div className="col-md-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-4">
                <Alert
                  type="error"
                  message={error}
                  onClose={() => setError("")}
                />
                <h2 className="text-center mb-4">Create Account</h2>

                <form onSubmit={handleSubmit}>
                  <InputField
                    label="Email Address"
                    type="email"
                    name="email" // <-- Must pass name
                    value={userData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />

                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      name="role"
                      value={userData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="Training">Training</option>
                      <option value="Tracking">Tracking</option>
                    </select>
                  </div>

                  <InputField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    name="password" // <-- Must pass name
                    value={userData.password}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
                    required
                    minLength="8"
                  >
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </InputField>

                  <InputField
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    minLength="8"
                  >
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </InputField>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Registering...
                      </>
                    ) : (
                      "Register"
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
}
