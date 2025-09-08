import { useState, useEffect } from "react";
import {
  submitReport,
  getRecentSubmissions as getMyReports,
  checkDuplicates,
  getNearbyReportsCount,
} from "../../services/homepageApi";

export const useHomepage = (token) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [nearbyCount, setNearbyCount] = useState(0);
  const [duplicationResult, setDuplicationResult] = useState(null);

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

  // Check for duplicates before submission
  const checkForDuplicates = async (reportData) => {
    try {
      const result = await checkDuplicates(reportData, token);
      setDuplicationResult(result);
      return result;
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to check duplicates");
      throw err;
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
      await fetchReports();
      return result;
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit report");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get nearby reports count
  const fetchNearbyReports = async (reportData) => {
    try {
      const count = await getNearbyReportsCount(reportData);
      setNearbyCount(count);
      return count;
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load nearby reports");
      throw err;
    }
  };

  useEffect(() => {
    if (token) fetchReports();
  }, [token]);

  return {
    reports,
    loading,
    error,
    nearbyCount,
    duplicationResult,
    fetchReports,
    fetchNearbyReports,
    addReport,
    checkForDuplicates,
  };
};
