import React, { useState } from "react";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { FaFileUpload, FaFile, FaCheckCircle } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const FileUploadPage = () => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate=useNavigate()

  const handleFile1Change = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile1(file);
    }
  };

  const handleFile2Change = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile2(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!file1 || !file2) {
      setError("Both files are required.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file1", file1);
    formData.append("file2", file2);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.data.message === 'Files processed successfully!') {
        setSuccess(response.data.message);
        setTimeout(() => {
         
          navigate('/home'); // Navigate after setting the success message
        }, 2000); // Delay is a single number in milliseconds
      }
      
      
      setFile1(null);
      setFile2(null);
      // Reset file inputs
      e.target.reset();
    } catch (error) {
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

            {error && (
              <Alert variant="danger" className="animate__animated animate__shake">
                <div className="d-flex align-items-center">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                </div>
              </Alert>
            )}

            {success && (
              <Alert variant="success" className="animate__animated animate__fadeIn">
                <div className="d-flex align-items-center">
                  <FaCheckCircle className="me-2" />
                  {success}
                </div>
              </Alert>
            )}

            <Form onSubmit={handleSubmit} className="upload-form">
              <div className="upload-section mb-3">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-dark mb-3">
                    Skill Profile Progress Summary
                  </Form.Label>
                  <div className="upload-box p-4 rounded-3 border-2 border-dashed border-primary bg-light">
                    <Form.Control
                      type="file"
                      required
                      onChange={handleFile1Change}
                      accept=".jpg,.png,.pdf,.docx,.txt"
                      className="custom-file-input"
                    />
                    {file1 ? (
                      <div className="mt-3 text-success">
                        <FaFile className="me-2" />
                        <small className="fw-semibold">{file1.name}</small>
                      </div>
                    ) : (
                      <div className="text-center text-muted">
                        <small>Drag and drop or click to upload</small>
                      </div>
                    )}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-dark mb-3">
                    User Assignments Status By Group
                  </Form.Label>
                  <div className="upload-box p-4 rounded-3 border-2 border-dashed border-primary bg-light">
                    <Form.Control
                      type="file"
                      required
                      onChange={handleFile2Change}
                      accept=".jpg,.png,.pdf,.docx,.txt"
                      className="custom-file-input"
                    />
                    {file2 ? (
                      <div className="mt-3 text-success">
                        <FaFile className="me-2" />
                        <small className="fw-semibold">{file2.name}</small>
                      </div>
                    ) : (
                      <div className="text-center text-muted">
                        <small>Drag and drop or click to upload</small>
                      </div>
                    )}
                  </div>
                </Form.Group>
              </div>

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
                    <FaFileUpload className="me-2" /> Upload Files
                  </>
                )}
              </Button>
            </Form>
          </div>
        </Col>
      </Row>

      <style jsx>{`
        .upload-box {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .upload-box:hover {
          background-color: rgba(13, 110, 253, 0.05) !important;
          cursor: pointer;
        }

        .custom-file-input {
          cursor: pointer;
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
        }

        .border-dashed {
          border-style: dashed !important;
        }

        .animate__animated {
          animation-duration: 0.5s;
        }

        .animate__shake {
          animation-name: shake;
        }

        .animate__fadeIn {
          animation-name: fadeIn;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </Container>
  );
};

export default FileUploadPage;