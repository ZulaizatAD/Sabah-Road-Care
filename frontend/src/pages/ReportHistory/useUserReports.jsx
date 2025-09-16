// src/pages/ReportHistory/useUserReports.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getUserReports, generateAIAnalysis } from "../../services/history";

/**
 * Custom hook to fetch and manage user report history
 * @param {Object} filters - Optional filters { status, district, severity }
 */
const useUserReports = (filters = {}) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        // 🧹 Clean filters: remove "all" values and map to backend parameter names
        const cleanFilters = {};

        if (filters.status && filters.status !== "all") {
          cleanFilters.status_filter = filters.status;
        }

        if (filters.district && filters.district !== "all") {
          cleanFilters.district_filter = filters.district;
        }

        if (filters.severity && filters.severity !== "all") {
          cleanFilters.severity_filter = filters.severity;
        }

        const data = await getUserReports(cleanFilters);

        // Extract reports array from the response
        const reportsArray = data.reports || data || [];
        setReports(reportsArray);
        setError(null);
      } catch (err) {
        console.error("❌ Error fetching reports:", err);
        setError(err);
        toast.error("Failed to load reports");
        setReports([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [filters]);

  /**
   * Trigger AI analysis for a specific report
   * @param {string} caseId - The case ID to analyze
   * @returns {Promise<Object>} AI analysis results
   */
  const triggerAIAnalysis = async (caseId) => {
    try {
      const analysisResult = await generateAIAnalysis(caseId);

      // Update the specific report in the state with new analysis
      setReports((prevReports) => {
        const updatedReports = prevReports.map((report) => {
          if (report.case_id === caseId) {
            const updatedReport = {
              ...report,
              severity: analysisResult.base_severity,
              priority: analysisResult.final_priority,
              ai_analysis_details:
                analysisResult.analysis_details || analysisResult,
            };

            return updatedReport;
          }
          return report;
        });

        return updatedReports;
      });

      toast.success("AI analysis completed successfully!");

      return analysisResult;
    } catch (err) {
      console.error(`❌ AI analysis failed for ${caseId}:`, err);
      toast.error("AI analysis failed. Please try again.");
      throw err;
    }
  };

  /**
   * Refresh the reports list
   */
  const refreshReports = async () => {
    console.log("🔄 Refreshing reports...");

    try {
      setLoading(true);

      const cleanFilters = {};
      if (filters.status && filters.status !== "all") {
        cleanFilters.status_filter = filters.status;
      }
      if (filters.district && filters.district !== "all") {
        cleanFilters.district_filter = filters.district;
      }
      if (filters.severity && filters.severity !== "all") {
        cleanFilters.severity_filter = filters.severity;
      }

      const data = await getUserReports(cleanFilters);
      const reportsArray = data.reports || data || [];
      setReports(reportsArray);
      setError(null);

      toast.success("Reports refreshed!");
    } catch (err) {
      console.error("❌ Error refreshing reports:", err);
      setError(err);
      toast.error("Failed to refresh reports");
    } finally {
      setLoading(false);
    }
  };

  return {
    reports,
    loading,
    error,
    setReports,
    triggerAIAnalysis,
    refreshReports,
  };
};

export default useUserReports;
