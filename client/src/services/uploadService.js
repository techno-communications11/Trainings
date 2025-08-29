import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const uploadFile = async (file) => {
  const url = `${BASE_URL}/crediantalsFile`;
  const formData = new FormData();
  formData.append("file", file);

  const config = {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  };

  const response = await axios.post(url, formData, config);
  return response.data;
};

const uploadService = { uploadFile };

export default uploadService;
