// src/pages/Homepage/useHomepage.jsx
import { useState, useEffect, useCallback } from "react";
import {
  submitReport,
  getRecentSubmissions,
  checkDuplicates,
  getNearbyReportsCount,
} from "../../services/homepageApi";

export const useHomepage = (token) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nearbyCount, setNearbyCount] = useState(0);
  const [duplicationResult, setDuplicationResult] = useState(null);

  // ✅ Load user reports
  const fetchReports = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getRecentSubmissions(token);
      // ✅ Backend returns { success: true, reports: [...] }
      setReports(data.reports || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load reports");
      console.error("Fetch reports error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ✅ Check for duplicates before submission
  const checkForDuplicates = useCallback(
    async (latitude, longitude) => {
      if (!token || !latitude || !longitude) return null;

      try {
        const result = await checkDuplicates(latitude, longitude, token);
        setDuplicationResult(result);
        return result;
      } catch (err) {
        console.error("Duplicate check error:", err);
        setError(err.response?.data?.detail || "Failed to check duplicates");
        return null;
      }
    },
    [token]
  );

  // ✅ Submit a new report (FormData should be prepared in component)
  const addReport = useCallback(
    async (formData) => {
      if (!token) {
        throw new Error("Authentication required");
      }

      setLoading(true);
      setError(null);

      try {
        const result = await submitReport(formData, token);

        // ✅ Refresh reports after successful submission
        await fetchReports();

        return result;
      } catch (err) {
        console.error("Submit report error:", err);
        setError(err.response?.data?.detail || "Failed to submit report");
        throw err; // ✅ Re-throw so component can handle specific errors
      } finally {
        setLoading(false);
      }
    },
    [token, fetchReports]
  );

  // ✅ Get nearby reports count
  const fetchNearbyReports = useCallback(
    async (latitude, longitude, radiusKm = 5) => {
      try {
        const count = await getNearbyReportsCount(
          latitude,
          longitude,
          radiusKm
        );
        setNearbyCount(count);
        return count;
      } catch (err) {
        console.error("Nearby reports error:", err);
        setError(err.response?.data?.detail || "Failed to load nearby reports");
        return 0;
      }
    },
    []
  );

  // ✅ Load reports when token is available
  useEffect(() => {
    if (token) {
      fetchReports();
    }
  }, [token, fetchReports]);

  // ✅ Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    // State
    reports,
    loading,
    error,
    nearbyCount,
    duplicationResult,

    // Actions
    fetchReports,
    fetchNearbyReports,
    addReport,
    checkForDuplicates,

    // Utilities
    clearError: () => setError(null),
  };
};
