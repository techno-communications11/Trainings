const CustomAlert = ({ message, onClose }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#4CAF50",
        color: "white",
        padding: "25px 40px",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        zIndex: 1000,
      }}
    >
      <span style={{ marginRight: "20px" }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          backgroundColor: "transparent",
          border: "none",
          color: "white",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        ×
      </button>
    </div>
  );
};
export default CustomAlert;