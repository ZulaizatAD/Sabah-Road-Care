import React, { useState } from "react";
import useDashboardData from "./useDashboardData";
import Filter from "./Section/Filter";
import StatsCards from "./Section/StatusCards";
import Charts from "./Section/Charts";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import AnimatedBackground001 from "../../components/VideoBG/AnimatedBackground001";
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
        <AnimatedBackground001 />
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
        <AnimatedBackground001 />
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
      <AnimatedBackground001 />
      <main className="main">
        <div className="container">
          {/* Modern Dashboard Header */}
          <div className="dashboard-header">
            <h1 className="dashboard-title"> Analytics Dashboard</h1>
            <p className="dashboard-subtitle">
              Real-time insights into road care reports and maintenance progress
            </p>
          </div>

          {/* Filter and Share Section */}
          <div className="filter-share-container">
            <Filter
              filters={filters}
              handleFilterChange={handleFilterChange}
              handleShare={handleShare}
            />
          </div>

          {/* Stats Cards */}
          <StatsCards data={dashboardData?.stats} />

          {/* Charts Section */}
          <Charts
            pieData={dashboardData?.charts?.pieData}
            trendData={dashboardData?.charts?.trendData}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
