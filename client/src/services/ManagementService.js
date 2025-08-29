// services/uploadService.js
import axios from "axios";

export const ManagementService = async (url, formData) => {
  const config = {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  };
  const response = await axios.post(url, formData, config);
  return response.data;
};
