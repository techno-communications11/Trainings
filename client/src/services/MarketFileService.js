// services/uploadService.js
import axios from "axios";
const BASE_URL = process.env.REACT_APP_BASE_URL;
export const MarketFileService = async ( file) => {
  const formData = new FormData();
  formData.append("file", file);
   console.log(file);

  const config = {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  };

  const response = await axios.post(`${BASE_URL}/marketstructureFile` ,formData, config);
   console.log(response);
  return response.data;
};
