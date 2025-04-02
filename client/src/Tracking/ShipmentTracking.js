import React, { useState, useRef } from "react";
import { TruckIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ShipmentTracking = () => {
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState(null);
  const [fedexFile, setFedexFile] = useState(null);
  const [upsFile, setUpsFile] = useState(null);
  const [isDraggingFedex, setIsDraggingFedex] = useState(false);
  const [isDraggingUPS, setIsDraggingUPS] = useState(false);
  const [isProcessingFedex, setIsProcessingFedex] = useState(false);
  const [isProcessingUPS, setIsProcessingUPS] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");

  const fedexInputRef = useRef(null);
  const upsInputRef = useRef(null);

  const showStatus = (message, type = "info") => {
    setStatusMessage({ message, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleDragEnter = (e, carrier) => {
    e.preventDefault();
    e.stopPropagation();
    carrier === "FedEx" ? setIsDraggingFedex(true) : setIsDraggingUPS(true);
  };

  const handleDragLeave = (e, carrier) => {
    e.preventDefault();
    e.stopPropagation();
    carrier === "FedEx" ? setIsDraggingFedex(false) : setIsDraggingUPS(false);
  };

  const handleDrop = (e, carrier) => {
    e.preventDefault();
    e.stopPropagation();

    carrier === "FedEx" ? setIsDraggingFedex(false) : setIsDraggingUPS(false);

    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) {
      carrier === "FedEx" ? setFedexFile(file) : setUpsFile(file);
      showStatus(`${carrier} file selected: ${file.name}`, "success");
    } else {
      showStatus("Please upload a CSV file", "danger");
    }
  };

  const handleFedExUpload = async (e) => {
    e.preventDefault();
    if (!fedexFile) return showStatus("Please select a FedEx file", "warning");

    setIsProcessing(true);
    setIsProcessingFedex(true);
    setProcessingMessage("Processing FedEx tracking data...");

    const formData = new FormData();
    formData.append("file", fedexFile);

    try {
      showStatus("Processing FedEx file...", "info");
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/upload-fedex`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to process FedEx file");
      }

      showStatus("FedEx processing complete! Redirecting...", "success");
      navigate("/trainingdata");
    } catch (error) {
      console.error("FedEx upload error:", error);
      showStatus(error.message, "danger");
    } finally {
      setIsProcessing(false);
      setIsProcessingFedex(false);
      setProcessingMessage("");
    }
  };

  const handleUPSUpload = async (e) => {
    e.preventDefault();
    if (!upsFile) return showStatus("Please select a UPS file", "warning");

    setIsProcessing(true);
    setIsProcessingUPS(true);
    setProcessingMessage("Processing UPS tracking data...");

    const formData = new FormData();
    formData.append("file", upsFile);

    try {
      showStatus("Processing UPS file...", "info");
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/upload-ups`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to process UPS file");
      }

      showStatus("UPS processing complete! Redirecting...", "success");
      navigate("/trainingdata");
    } catch (error) {
      console.error("UPS upload error:", error);
      showStatus(error.message, "danger");
    } finally {
      setIsProcessing(false);
      setIsProcessingUPS(false);
      setProcessingMessage("");
    }
  };

  const handleFileChange = (e, carrier) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".csv")) {
      carrier === "FedEx" ? setFedexFile(file) : setUpsFile(file);
      showStatus(`${carrier} file selected: ${file.name}`, "success");
    } else {
      showStatus("Please upload a CSV file", "danger");
    }
  };

  const ShipmentCard = ({
    carrier,
    logo,
    isDragging,
    file,
    inputRef,
    onUpload,
    isProcessing,
  }) => (
    <div className="col-md-6">
      <div className="card h-100 shadow border-0">
        <div className="card-body p-3">
          <div className="text-center ">
            <img
              src={logo}
              alt={`${carrier} Logo`}
              className="img-fluid "
              style={{ maxHeight: "60px" }}
            />
            <h4 className="card-title">{carrier} Tracking</h4>
          </div>

          <form onSubmit={onUpload} className="mt-1">
            <div
              className={`drop-zone p-5 mb-2 rounded-3 text-center position-relative ${
                isDragging ? "bg-light border-primary" : "bg-light"
              }`}
              style={{
                border: `2px dashed ${isDragging ? "#0d6efd" : "#dee2e6"}`,
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onDragEnter={(e) => handleDragEnter(e, carrier)}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={(e) => handleDragLeave(e, carrier)}
              onDrop={(e) => handleDrop(e, carrier)}
              onClick={() => inputRef.current?.click()}
            >
              <input
                type="file"
                ref={inputRef}
                className="d-none"
                accept=".csv"
                onChange={(e) => handleFileChange(e, carrier)}
              />
              <div className="mb-2">
                <i
                  className={`bi ${
                    file ? "bi-file-earmark-check" : "bi-cloud-upload"
                  } fs-1 ${isDragging ? "text-primary" : "text-secondary"}`}
                ></i>
              </div>
              <div className="mb-2">
                {file ? (
                  <span className="text-success">
                    <i className="bi bi-check-circle me-2"></i>
                    {file.name}
                  </span>
                ) : (
                  <span>Drag & drop your {carrier} CSV file here</span>
                )}
              </div>
              <div className="text-muted small">or click to browse</div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-100 mb-1 ${
                !file || isProcessing ? "disabled" : ""
              }`}
              disabled={!file || isProcessing}
            >
              {isProcessing ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="bi bi-gear me-2"></i>
                  Generate {carrier} Tracking
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-3 position-relative">
      {/* Full-page overlay loader */}
      {isProcessing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            zIndex: 1050,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            className="spinner-border text-primary"
            style={{ width: "3rem", height: "3rem" }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="mt-3 text-primary">{processingMessage}</h4>
          <p className="text-muted">Please wait while we process your file...</p>
        </div>
      )}

      {statusMessage && (
        <div
          className={`alert alert-${statusMessage.type} alert-dismissible fade show mb-4`}
        >
          {statusMessage.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setStatusMessage(null)}
          ></button>
        </div>
      )}

      <div className="row g-4">
        <h3
          className="d-flex justify-content-center align-items-center fw-bold text-primary mb-4"
          style={{
            fontFamily: "'Roboto', sans-serif",
            letterSpacing: "0.5px",
            textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          <TruckIcon className="me-3 fs-1" style={{ color: "#2c3e50" }} />
          <span className="border-bottom border-3 border-warning pb-2">
            Track Your Shipments
          </span>
        </h3>
        <ShipmentCard
          carrier="FedEx"
          logo="/fedex.webp"
          isDragging={isDraggingFedex}
          file={fedexFile}
          inputRef={fedexInputRef}
          onUpload={handleFedExUpload}
          isProcessing={isProcessingFedex}
        />
        <ShipmentCard
          carrier="UPS"
          logo="/ups.jpg"
          isDragging={isDraggingUPS}
          file={upsFile}
          inputRef={upsInputRef}
          onUpload={handleUPSUpload}
          isProcessing={isProcessingUPS}
        />
      </div>

      <div className="alert alert-info mt-4">
        <strong>Note:</strong> The Excel sheet should only contain tracking
        numbers with the column header "TrackingNumber". Other columns will be
        ignored.
      </div>
    </div>
  );
};

export default ShipmentTracking;