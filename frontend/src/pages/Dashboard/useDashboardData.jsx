import { useState, useEffect } from "react";
import { dashboardAPI } from "../../services/dashboardApi";

const useDashboardData = (filters) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, chartsResponse] = await Promise.all([
          dashboardAPI.getDashboardStats(filters),
          dashboardAPI.getChartsData(filters),
        ]);
        setDashboardData({
          stats: statsResponse.data,
          charts: chartsResponse.data,
        });
      } catch (error) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [filters]);

  return { dashboardData, loading, error };
};

export default useDashboardData;
