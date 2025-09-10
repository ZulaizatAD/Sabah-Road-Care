import React, { useState } from "react";
import useDashboardData from "./useDashboardData";
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

  const { dashboardData, loading, error } = useDashboardData(filters);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
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
            <div className="loading-container">
              <LoadingSpinner size="large" message="Loading dashboard..." />
            </div>
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
    <div className="dashboard-content">
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Dashboard Header */}
          <div className="dashboard-header">
            <div className="dashboard-header-content">
              <div className="dashboard-header-main">
                <h1 className="dashboard-title"> Analytics Dashboard</h1>
                <p className="dashboard-subtitle">
                  Real-time insights into road care reports and maintenance
                  progress
                </p>
              </div>
              <div className="header-actions">
                <button
                  className="refresh-btn"
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </button>
                <button className="export-btn">Export Data</button>
              </div>
            </div>
            <div className="dashboard-stats-summary">
              <div className="summary-item">
                <span className="summary-label">Last Updated</span>
                <span className="summary-value">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Data Range</span>
                <span className="summary-value">
                  {filters.start_date || "All Time"}
                </span>
              </div>
            </div>
          </div>

          {/* Filter and Share Section */}
          <div className="filter-share-container">
            <div className="filter-section">
              <Filter
                filters={filters}
                handleFilterChange={handleFilterChange}
                handleShare={handleShare}
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-section">
            <StatsCards data={dashboardData?.stats} />
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <div className="charts-section-header">
              <h2 className="charts-section-title">Analytics Overview</h2>
              <div className="chart-controls">
                <select className="chart-period">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                </select>
              </div>
            </div>
            <div className="charts-grid">
              <Charts
                pieData={dashboardData?.charts?.pieData}
                trendData={dashboardData?.charts?.trendData}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
