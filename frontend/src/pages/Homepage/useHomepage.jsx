// src/hooks/useHomepage.js
import { useState, useEffect } from "react";
import { getMyReports, submitReport } from "../../services/homepageApi";

export const useHomepage = (token) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user reports
  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getMyReports(token);
      setReports(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  // Submit a new report
  const addReport = async (reportData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(reportData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      const result = await submitReport(formData, token);
      await fetchReports(); // ✅ refresh reports after submit
      return result;
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit report");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchReports();
  }, [token]);

  return { reports, loading, error, fetchReports, addReport };
};
