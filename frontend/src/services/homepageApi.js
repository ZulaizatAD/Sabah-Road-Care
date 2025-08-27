// src/api/homepage.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // Your FastAPI backend URL
});

// Submit a new pothole report
export const submitReport = async (formData, token) => {
  try {
    const response = await api.post(`api/homepage/report`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`, // ✅ send JWT
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error submitting report:", error);
    throw error;
  }
};

// Fetch reports for the current user
export const getMyReports = async (token) => {
  try {
    const response = await api.get(`api/homepage/my-reports`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching reports:", error);
    throw error;
  }
};
