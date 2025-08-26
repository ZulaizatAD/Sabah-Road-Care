import axios from "axios";

const API_URL = "http://127.0.0.1:8000/homepage"; // ✅ matches backend prefix

// Submit a new pothole report
export const submitReport = async (formData, token) => {
  try {
    const response = await axios.post(`${API_URL}/report`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`, // ✅ send JWT
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Submit report failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Fetch reports for current logged-in user
export const getMyReports = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/my-reports`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Fetch reports failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};
