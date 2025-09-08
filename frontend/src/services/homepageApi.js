// src/services/homepageApi.js
import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Your FastAPI backend URL
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
 * ✅ Submit a new pothole report
 */
export const submitReport = async (formData, token) => {
  try {
    const response = await api.post(`/report`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error submitting report:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * ✅ Fetch recent submissions for the current user
 * Backend: GET /recent-submissions
 */
export const getRecentSubmissions = async (token) => {
  try {
    const response = await api.get(`/recent-submissions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching recent submissions:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * ✅ Check for duplicates before submission
 */
export const checkDuplicates = async (reportData, token) => {
  try {
    const formData = new FormData();
    formData.append("latitude", reportData.latitude);
    formData.append("longitude", reportData.longitude);

    const response = await api.post(`/check-duplicates`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error checking duplicates:", error);
    throw error.response?.data || error.message;
  }
};

// ✅ Get only the count of nearby reports
export const getNearbyReportsCount = async (lat, lng, radiusKm = 5) => {
  try {
    const response = await api.get(`/nearby-reports`, {
      params: { lat, lng, radius_km: radiusKm },
    });
    return response.data.nearby_cases_count; // ✅ only return the number
  } catch (error) {
    console.error("❌ Error fetching nearby reports count:", error);
    throw error;
  }
};
