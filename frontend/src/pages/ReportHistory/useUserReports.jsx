// src/hooks/useUserReports.js
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getUserReports } from "../../services/history";

/**
 * Custom hook to fetch and manage user report history
 * @param {Object} filters - Optional filters { district, start_date, end_date, severity, status }
 */
const useUserReports = (filters = {}) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        // 🧹 Clean filters: remove "all" values before calling API
        const cleanFilters = {};
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== "all") {
            cleanFilters[key] = value;
          }
        });

        console.log(
          "🔎 useUserReports: fetching reports with filters:",
          cleanFilters
        );

        const data = await getUserReports(cleanFilters);

        console.log("✅ useUserReports: raw data received:", data);

        setReports(data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError(err);
        toast.error("Failed to load reports");
      } finally {
        setLoading(false);
        console.log("⏳ useUserReports: loading set to false");
      }
    };

    fetchReports();
  }, [filters]);

  return { reports, loading, error, setReports };
};

export default useUserReports;
