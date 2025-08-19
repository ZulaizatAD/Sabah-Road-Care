import React, { useState, useEffect } from "react";
import { dashboardAPI } from "../../services/api2"; // Import the API service
import Filter from "./Section/Filter";
import StatsCards from "./Section/StatusCards";
import Charts from "./Section/Charts";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { toast } from "react-toastify";
import "./Dashboard.css";

const Dashboard = () => {
  const [filters, setFilters] = useState({
    district: "",
    start_date: "",
    end_date: "",
    severity: "",
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(filters).toString();
        console.log("Fetching data with params:", params); // Debugging statement
        const [statsResponse, chartsResponse] = await Promise.all([
          dashboardAPI.getDashboardStats(filters),
          dashboardAPI.getChartsData(filters),
        ]);

        console.log("Received stats data:", statsResponse.data); // Debugging statement
        console.log("Received charts data:", chartsResponse.data); // Debugging statement

        setDashboardData({
          stats: statsResponse.data,
          charts: chartsResponse.data,
        });
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    console.log("Updated filters:", filters); // Debugging statement
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Sabah Road Care Dashboard",
          text: `Dashboard showing ${
            dashboardData?.stats?.totalCases || 0
          } total cases`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Dashboard link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share failed:", error);
      toast.error("Failed to share dashboard");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-content">
        <main className="main">
          <div className="container">
            <LoadingSpinner size="large" message="Loading dashboard..." />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-content">
        <main className="main">
          <div className="container">
            <div className="error-state">
              <h2>⚠️ Dashboard Error</h2>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-content">
        <main className="main">
          <div className="container">
            <Filter
              filters={filters}
              handleFilterChange={handleFilterChange}
              handleShare={handleShare}
            />
            <StatsCards data={dashboardData?.stats} />
            <Charts
              pieData={dashboardData?.charts?.pieData}
              trendData={dashboardData?.charts?.trendData}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
