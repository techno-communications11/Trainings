import React, { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { FaFileUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Alert } from "../utils/Alert"; // Your existing components
import { FileInput } from "../utils/FileInput";
import MultiFilesService from "../services/MultiFilesService";

export default function FileUploadPage() {
  const [files, setFiles] = useState({ file1: null, file2: null });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (key) => (e) => {
    setFiles({ ...files, [key]: e.target.files[0] });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.file1 || !files.file2) {
      setError("Both files are required.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await MultiFilesService.uploadFiles(files);
      if (response.message === "Files processed successfully!") {
        setSuccess(response.message);
        setTimeout(() => navigate("/trainingdata"), 2000);
      }
      setFiles({ file1: null, file2: null });
      e.target.reset();
    } catch {
      setError("File upload failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 bg-light py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6} xl={5}>
          <div className="bg-white rounded-3 shadow-lg p-4 p-md-5">
            <div className="text-center mb-5">
              <div className="display-6 text-primary mb-3">
                <FaFileUpload size={45} />
              </div>
              <h2 className="fw-bold text-dark mb-2">File Upload For Training</h2>
              <p className="text-muted">Upload your progress reports</p>
            </div>

            <Alert type="error" message={error} />
            <Alert type="success" message={success} />

            <Form onSubmit={handleSubmit}>
              <p className="text-blue-800">Skill profile</p>
              <FileInput file={files.file1} onChange={handleChange("file1")} />
              <p>user Assignments</p>
              <FileInput file={files.file2}  onChange={handleChange("file2")} />

              <Button
                variant="primary"
                type="submit"
                size="lg"
                className="w-100 py-2 rounded-3 shadow-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaFileUpload className="me-2 " /> Upload Files
                  </>
                )}
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
