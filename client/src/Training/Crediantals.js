import { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import uploadService from "../services/uploadService"; // Abstracted API call
import { UploadButton } from "../utils/UploadButton";
import { Alert } from "../utils/Alert";
import { FileInput } from "../utils/FileInput";

// Main component
function Credentials() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFile(event.target.files[0]);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await uploadService.uploadFile(file);
      if (response.message) {
        setSuccess("File uploaded successfully!");
        setFile(null);
        event.target.reset();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to upload file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div
        className="card shadow-lg border-0 rounded-4"
        style={{ maxWidth: "500px", width: "90%" }}
      >
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="display-6 text-primary mb-3">
              <FaCloudUploadAlt size={50} />
            </div>
            <h2 className="fw-bold mb-2">Credentials File Upload</h2>
            <p className="text-muted">Upload your management documents here</p>
          </div>

          <Alert type="error" message={error} />
          <Alert type="success" message={success} />

          <form onSubmit={handleSubmit}>
            <FileInput file={file} onChange={handleChange} />
            <UploadButton isLoading={isLoading} disabled={!file || isLoading} />
          </form>
        </div>
      </div>
    </div>
  );
}

export default Credentials;
