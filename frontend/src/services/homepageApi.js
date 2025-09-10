// src/services/homepageApi.js
import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Your FastAPI backend URL
});

// Attach token dynamically before each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
    // ✅ Throw the full error object so we can access status codes
    throw error;
  }
};

/**
 * ✅ Fetch recent submissions for the current user
 * Backend returns: { success: true, reports: [...] }
 */
export const getRecentSubmissions = async (token) => {
  try {
    const response = await api.get(`/recent-submissions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // ✅ Return full response (has success + reports)
  } catch (error) {
    console.error("❌ Error fetching recent submissions:", error);
    throw error;
  }
};

/**
 * ✅ Check for duplicates before submission
 */
export const checkDuplicates = async (latitude, longitude, token) => {
  try {
    const formData = new FormData();
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);

    const response = await api.post(`/check-duplicates`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error checking duplicates:", error);
    throw error;
  }
};

/**
 * ✅ Get nearby reports count
 * Backend returns: { success: true, nearby_cases_count: 5, radius_km: 5 }
 */
export const getNearbyReportsCount = async (lat, lng, radiusKm = 5) => {
  try {
    const response = await api.get(`/nearby-reports`, {
      params: { lat, lng, radius_km: radiusKm },
    });
    return response.data.nearby_cases_count; // ✅ Return just the count
  } catch (error) {
    console.error("❌ Error fetching nearby reports count:", error);
    return 0; // ✅ Return 0 on error instead of throwing
  }
};
