import React from "react";
import "./CommunityStats.css";

const CommunityStats = () => {
  // Mock data - replace with real data from your backend later
  const stats = {
    totalReports: 1247,
    resolvedReports: 892,
    pendingReports: 355,
    activeToday: 23,
  };

  // Calculate percentage for resolved reports
  const resolvedPercentage = Math.round(
    (stats.resolvedReports / stats.totalReports) * 100
  );

  return (
    <div className="community-stats">
      <div className="stats-header">
        <h3 className="stats-title">Community Impact</h3>
        <p className="stats-subtitle">
          Together we're making Sabah roads safer
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-content">
            <span className="stat-number">
              {stats.totalReports.toLocaleString()}
            </span>
            <span className="stat-label">Total Reports</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-content">
            <span className="stat-number">
              {stats.resolvedReports.toLocaleString()}
            </span>
            <span className="stat-label">Resolved ({resolvedPercentage}%)</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-content">
            <span className="stat-number">
              {stats.pendingReports.toLocaleString()}
            </span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-content">
            <span className="stat-number">{stats.activeToday}</span>
            <span className="stat-label">Reports Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityStats;
