import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { reportAPI } from "../../services/api";
import Filter from "./Section/Filter";
import StatsCards from "./Section/StatusCards";
import Charts from "./Section/Charts";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { toast } from "react-toastify";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useUser();
  const [filters, setFilters] = useState({
    location: "",
    date: "",
    severity: "",
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ ADD: Real data fetching
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, chartsResponse] = await Promise.all([
          reportAPI.getDashboardStats(filters),
          reportAPI.getChartsData(filters),
        ]);

        setDashboardData({
          stats: statsResponse.data,
          charts: chartsResponse.data,
        });
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        setError("Failed to load dashboard data");

        // Fallback to sample data
        setDashboardData({
          stats: {
            totalCases: 45,
            underReview: 20,
            approved: 20,
            inProgress: 15,
            completed: 10,
            rejected: 10,
          },
          charts: {
            pieData: [
              { name: "Low", value: 20, color: "#82ca9d" },
              { name: "Medium", value: 15, color: "#ffc658" },
              { name: "High", value: 10, color: "#ff7c7c" },
            ],
            trendData: [
              { month: "Jan", cases: 20 },
              { month: "Feb", cases: 45 },
              { month: "Mar", cases: 45 },
              { month: "Apr", cases: 50 },
              { month: "May", cases: 60 },
              { month: "Jun", cases: 70 },
            ],
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [filters]);

  // Filter Handler
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Share functionality
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
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Dashboard link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share failed:", error);
      toast.error("Failed to share dashboard");
    }
  };

  // Loading and error states
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
