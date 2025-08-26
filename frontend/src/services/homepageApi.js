import axios from "axios";

// Base URL (falls back to localhost if .env not set)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// Demo toggle
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Attach JWT if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export const homepageAPI = {
  /**
   * Submit a new pothole report with photos
   */
  submitReport: async ({
    email,
    district,
    latitude,
    longitude,
    address,
    remarks,
    photo_top,
    photo_far,
    photo_close,
  }) => {
    if (DEMO_MODE) {
      await new Promise((res) => setTimeout(res, 1000));
      return {
        data: {
          message: "Report submitted (demo mode)",
          case_id: "SRC-DEMO-123",
          severity: "Medium",
          status: "Submitted",
          photos: {
            top: "/demo/top.jpg",
            far: "/demo/far.jpg",
            close: "/demo/close.jpg",
          },
          location: { latitude, longitude, address },
          district,
        },
      };
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("district", district);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("address", address);
    if (remarks) formData.append("remarks", remarks);

    // photos (backend expects these names)
    formData.append("photo_top", photo_top);
    formData.append("photo_far", photo_far);
    formData.append("photo_close", photo_close);

    const response = await api.post("/homepage/report", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  },

  /**
   * Get user’s report history
   */
  getUserReports: async (email) => {
    if (DEMO_MODE) {
      await new Promise((res) => setTimeout(res, 800));
      return {
        data: [
          {
            case_id: "SRC-DEMO-123",
            district: "Demo District",
            severity: "Low",
            status: "Submitted",
            date_created: new Date().toISOString(),
            last_date_status_update: new Date().toISOString(),
            location: {
              latitude: 1.234,
              longitude: 103.123,
              address: "123 Demo Street",
              road_name: "Demo Road",
            },
            photos: {
              top: "/demo/top.jpg",
              far: "/demo/far.jpg",
              close: "/demo/close.jpg",
            },
          },
        ],
      };
    }

    const response = await api.get("/homepage/my-reports", {
      params: { email },
    });
    return response;
  },
};

export default api;
