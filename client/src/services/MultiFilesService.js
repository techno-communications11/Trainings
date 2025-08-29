import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const uploadFiles = async (files) => {
  const formData = new FormData();
  Object.entries(files).forEach(([key, file]) => formData.append(key, file));

  const config = {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  };

  const response = await axios.post(`${BASE_URL}/upload`, formData, config);
  return response.data;
};

const MultiFilesService = { uploadFiles };

export default MultiFilesService;
