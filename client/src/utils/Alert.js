// Alert component
import { FaCheckCircle } from "react-icons/fa";
export function Alert({ type, message }) {
  const icon = type === "success" ? <FaCheckCircle className="me-2" /> : <i className="fas fa-exclamation-circle me-2"></i>;
  const className = type === "success" ? "alert alert-success" : "alert alert-danger";
  const animation = type === "success" ? "animate__fadeIn" : "animate__shake";

  if (!message) return null;

  return (
    <div className={`${className} d-flex align-items-center animate__animated ${animation}`} role="alert">
      {icon}
      {message}
    </div>
  );
}