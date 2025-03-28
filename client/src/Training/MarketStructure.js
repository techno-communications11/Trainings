import React, { useState } from 'react';
import axios from 'axios';
import { FaCloudUploadAlt, FaFile, FaCheckCircle } from 'react-icons/fa';

function MarketStructure() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  function handleChange(event) {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError('');
    setSuccess('');
  }

  function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const url = `${process.env.REACT_APP_BASE_URL}/marketstructureFile`;
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      Credentialials: 'include', // Important for sending cookies
    };

    axios.post(url, formData, config)
      .then((response) => {
        console.log(response.data);
        if(response.data.message) {
          setSuccess('File uploaded successfully!');
          setFile(null);
          event.target.reset();
        }
      })
      .catch(error => {
        console.error('Error uploading file:', error);
        setError('Failed to upload file. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: '500px', width: '90%' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="display-6 text-primary mb-3">
              <FaCloudUploadAlt size={50} />
            </div>
            <h2 className="fw-bold mb-2">Market Structure File Upload</h2>
            <p className="text-muted">Upload your management documents here</p>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center animate__animated animate__shake" role="alert">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success d-flex align-items-center animate__animated animate__fadeIn" role="alert">
              <FaCheckCircle className="me-2" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="upload-box position-relative mb-4 p-4 rounded-3 border-2 border-primary border-dashed bg-light text-center">
              <input 
                type="file" 
                className="position-absolute top-0 start-0 opacity-0 w-100 h-100 cursor-pointer" 
                onChange={handleChange}
                required
              />
              {file ? (
                <div className="text-success">
                  <FaFile className="me-2" size={20} />
                  <span className="fw-semibold">{file.name}</span>
                </div>
              ) : (
                <div className="text-muted">
                  <FaCloudUploadAlt size={30} className="mb-2" />
                  <p className="mb-0">Drag and drop your file here or click to browse</p>
                  <small>Supported formats: PDF, DOC, DOCX, XLS, XLSX</small>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 py-3 rounded-3 shadow-sm"
              disabled={!file || isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <FaCloudUploadAlt className="me-2" />
                  Upload File
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .border-dashed {
          border-style: dashed !important;
        }

        .upload-box {
          transition: all 0.3s ease;
        }

        .upload-box:hover {
          background-color: rgba(13, 110, 253, 0.05) !important;
          cursor: pointer;
        }

        .cursor-pointer {
          cursor: pointer;
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
    </div>
  );
}

export default MarketStructure;