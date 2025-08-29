// components/FileUploader.jsx
import { useState } from "react";
import { FileInput } from "../utils/FileInput";
import { Alert } from "../utils/Alert";
import {MarketFileService} from '../services/MarketFileService'
import { FaCloudUploadAlt } from "react-icons/fa";


export function MarketStructure() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await MarketFileService(file);
      if (data.message) {
        setSuccess("File uploaded successfully!");
        setFile(null);
      }
    } catch (err) {
      setError("Failed to upload file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: "500px", width: "90%" }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="display-6 text-primary mb-3">
              <FaCloudUploadAlt size={50} />
            </div>
            <h2 className="fw-bold mb-2">Market Structure File Upload</h2>
            <p className="text-muted">Upload your management documents here</p>
          </div>

          <Alert type="error" message={error} />
          <Alert type="success" message={success} />

          <form onSubmit={handleSubmit}>
            <FileInput file={file} onChange={handleChange} accept=".pdf,.doc,.docx,.xls,.xlsx" />
            <button
              type="submit"
              className="btn btn-primary w-100 py-3 rounded-3 shadow-sm"
              disabled={!file || isLoading}
            >
              {isLoading ? "Uploading..." : <><FaCloudUploadAlt className="me-2" /> Upload File</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
