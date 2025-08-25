import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const historyApi = axios.create({
  baseURL: API_BASE_URL,
});

historyApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getUserReports = async (filters = {}) => {
  const { data } = await historyApi.get("/api/reports", { params: filters });
  return data;
};

export default { getUserReports };
