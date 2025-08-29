// FileInput component
import { FaCloudUploadAlt, FaFile } from "react-icons/fa";
export function FileInput({ file, onChange }) {
  return (
    <div  className="upload-box position-relative mb-4 p-4 rounded-3 border-2 border-primary border-dashed bg-light text-center">
      <input
        type="file"
        style={{cursor:'pointer'}}
        className="position-absolute top-0 start-0 opacity-0 w-100 h-100 cursor-pointer"
        onChange={onChange}
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
  );
}
