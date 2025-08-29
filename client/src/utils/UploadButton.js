// UploadButton component
import { FaCloudUploadAlt} from "react-icons/fa";
export function UploadButton({ isLoading, disabled }) {
  return (
    <button type="submit" className="btn btn-primary w-100 py-3 rounded-3 shadow-sm" disabled={disabled}>
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
  );
}