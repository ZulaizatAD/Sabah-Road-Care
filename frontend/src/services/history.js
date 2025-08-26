// src/services/history.js
import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // Your FastAPI backend URL
});

// Attach token dynamically before each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Or sessionStorage if you use that
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Get the current user's report history
 * @param {Object} filters Optional filters: { district, start_date, end_date, severity }
 * @returns {Promise<Array>} List of user's pothole reports
 */
export const getUserReports = async (filters = {}) => {
  try {
    const response = await api.get("/api/reports", { params: filters });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching report history:",
      error.response?.data || error.message
    );
    throw error;
  }
};
