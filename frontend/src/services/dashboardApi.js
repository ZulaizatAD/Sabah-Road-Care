import axios from "axios";

// Ensure the base URL matches the backend's URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"; // Updated to match backend

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "false";

const api2 = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for file uploads
});

// Request interceptor for auth
api2.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api2.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem("authToken");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export const dashboardAPI = {
  getDashboardStats: async (filters = {}) => {
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const baseStats = {
        totalCases: 45 + Math.floor(Math.random() * 20),
        underReview: 12 + Math.floor(Math.random() * 8),
        approved: 15 + Math.floor(Math.random() * 10),
        inProgress: 8 + Math.floor(Math.random() * 7),
        completed: 6 + Math.floor(Math.random() * 4),
        rejected: 4 + Math.floor(Math.random() * 3),
      };
      return { data: baseStats };
    }

    // Remove empty/null/undefined values from filters
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([key, value]) => value !== null && value !== undefined && value !== ""
      )
    );

    const params = new URLSearchParams(cleanFilters);
    console.log("Sending request with params:", params.toString()); // Debugging statement

    // FIXED: Remove /api prefix to match backend routes
    const response = await api2.get(`api/dashboard/stats?${params}`);
    console.log("Received response:", response.data); // Debugging statement
    return response;
  },

  getChartsData: async (filters = {}) => {
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const demoChartsData = {
        pieData: [
          { name: "Low", value: 25, color: "#82ca9d" },
          { name: "Medium", value: 35, color: "#ffc658" },
          { name: "High", value: 25, color: "#ff7c7c" },
        ],
        trendData: [
          { month: "Jan", cases: 20 },
          { month: "Feb", cases: 35 },
          { month: "Mar", cases: 45 },
          { month: "Apr", cases: 50 },
          { month: "May", cases: 60 },
          { month: "Jun", cases: 65 },
        ],
      };
      return { data: demoChartsData };
    }

    // Remove empty/null/undefined values from filters
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([key, value]) => value !== null && value !== undefined && value !== ""
      )
    );

    const params = new URLSearchParams(cleanFilters);
    console.log("Sending request with params:", params.toString()); // Debugging statement

    // FIXED: Remove /api prefix to match backend routes
    const response = await api2.get(`api/dashboard/charts?${params}`);
    console.log("Received response:", response.data); // Debugging statement
    return response;
  },

  // Added the missing report count endpoint
  getReportCount: async (filters = {}) => {
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { data: { number_of_cases: 45 + Math.floor(Math.random() * 20) } };
    }

    // Remove empty/null/undefined values from filters
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([key, value]) => value !== null && value !== undefined && value !== ""
      )
    );

    const params = new URLSearchParams(cleanFilters);
    console.log("Sending request with params:", params.toString());

    const response = await api2.get(`api/dashboard/reports/count?${params}`);
    console.log("Received response:", response.data);
    return response;
  },

  exportDashboard: async (format = "pdf") => {
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const csvContent = `Report Type,Count\nTotal Cases,45\nUnder Review,12\nApproved,15\nIn Progress,8\nCompleted,6\nRejected,4`;
      const blob = new Blob([csvContent], { type: "text/csv" });
      return { data: blob };
    }

    // FIXED: Remove /api prefix (you'll need to implement this endpoint in backend)
    const response = await api2.get(`api/dashboard/export?format=${format}`, {
      responseType: "blob",
    });
    console.log("Received response:", response); // Debugging statement
    return response;
  },
};

export default api2;
