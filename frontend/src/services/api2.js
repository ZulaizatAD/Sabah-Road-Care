import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

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

// Response interceptor for error handling
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

    const params = new URLSearchParams(filters);
    console.log("Sending request with params:", params.toString()); // Debugging statement
    const response = await api2.get(`/dashboard/stats?${params}`);
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
          { name: "Critical", value: 15, color: "#ff4444" },
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

    const params = new URLSearchParams(filters);
    console.log("Sending request with params:", params.toString()); // Debugging statement
    const response = await api2.get(`/dashboard/charts?${params}`);
    console.log("Received response:", response.data); // Debugging statement
    return response;
  },

  exportDashboard: async (format = "pdf") => {
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const csvContent = `Report Type,Count\nTotal Cases,45\nUnder Review,12\nApproved,15\nIn Progress,8\nCompleted,6\nRejected,4`;
      const blob = new Blob([csvContent], { type: "text/csv" });
      return { data: blob };
    }

    const response = await api2.get(`/dashboard/export?format=${format}`, {
      responseType: "blob",
    });
    console.log("Received response:", response); // Debugging statement
    return response;
  },
};

export default api2;
