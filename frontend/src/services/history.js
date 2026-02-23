import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
const DEMO_REPORTS_KEY = "src_demo_reports_v1";

const api = axios.create({
  baseURL: API_BASE_URL,
});

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

const createSeedReports = () => [
  {
    case_id: `SRC_${Date.now() - 86400000}`,
    district: "Kota Kinabalu",
    status: "Completed",
    severity: "Medium",
    priority: "High",
    description: "Pothole near traffic light was repaired.",
    latitude: 5.9804,
    longitude: 116.0735,
    date_created: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    case_id: `SRC_${Date.now() - 43200000}`,
    district: "Penampang",
    status: "Under Review",
    severity: "Low",
    priority: "Medium",
    description: "Small pothole beside school entrance.",
    latitude: 5.9233,
    longitude: 116.0761,
    date_created: new Date(Date.now() - 43200000).toISOString(),
  },
];

const readDemoReports = () => {
  try {
    const raw = localStorage.getItem(DEMO_REPORTS_KEY);
    if (!raw) {
      const seeded = createSeedReports();
      localStorage.setItem(DEMO_REPORTS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const applyFilters = (reports, filters = {}) =>
  reports.filter((report) => {
    if (filters.district && report.district !== filters.district) return false;
    if (filters.status && report.status !== filters.status) return false;
    if (filters.severity && report.severity !== filters.severity) return false;

    if (filters.start_date) {
      const start = new Date(filters.start_date);
      if (new Date(report.date_created) < start) return false;
    }

    if (filters.end_date) {
      const end = new Date(filters.end_date);
      if (new Date(report.date_created) > end) return false;
    }

    return true;
  });

export const getUserReports = async (filters = {}) => {
  if (DEMO_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const reports = readDemoReports();
    return applyFilters(reports, filters);
  }

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
