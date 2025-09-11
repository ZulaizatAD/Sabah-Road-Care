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
 * @param {Object} filters Optional filters: { status_filter, district_filter, severity_filter }
 * @returns {Promise<Object>} Response with reports array and metadata
 */
export const getUserReports = async (filters = {}) => {
  try {
    console.log("📡 API Call: getUserReports with filters:", filters);

    const response = await api.get("/api/user/reports", {
      params: filters,
    });

    console.log("✅ API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error fetching report history:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Generate AI analysis for a specific report
 * @param {string} caseId - The case ID of the report to analyze
 * @returns {Promise<Object>} AI analysis results
 */
export const generateAIAnalysis = async (caseId) => {
  try {
    console.log(`🤖 API Call: generateAIAnalysis for case ${caseId}`);

    const response = await api.post(`/api/${caseId}/analyze`);

    console.log("✅ AI Analysis Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      `❌ Error generating AI analysis for ${caseId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Get detailed information for a specific report
 * @param {string} caseId - The case ID of the report
 * @returns {Promise<Object>} Detailed report information
 */
export const getReportDetails = async (caseId) => {
  try {
    console.log(`📋 API Call: getReportDetails for case ${caseId}`);

    const response = await api.get(`/api/${caseId}`);

    console.log("✅ Report Details Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      `❌ Error fetching report details for ${caseId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Get AI analysis status for all user reports (optional)
 * @returns {Promise<Object>} Analysis status summary
 */
export const getAnalysisStatus = async () => {
  try {
    console.log("📊 API Call: getAnalysisStatus");

    const response = await api.get("/api/analysis-status");

    console.log("✅ Analysis Status Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error fetching analysis status:",
      error.response?.data || error.message
    );
    throw error;
  }
};
