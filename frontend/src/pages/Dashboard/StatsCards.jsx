import React from "react";
import "./StatsCards.css";

const StatsCards = () => {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3 className="stat-title">Total Case</h3>
        <p className="stat-value">45</p>
      </div>
      <div className="stat-card">
        <h3 className="stat-title">In Investigation</h3>
        <p className="stat-value">20</p>
      </div>
      <div className="stat-card">
        <h3 className="stat-title">Maintenance in Progress</h3>
        <p className="stat-value">15</p>
      </div>
      <div className="stat-card">
        <h3 className="stat-title">Case Close</h3>
        <p className="stat-value">10</p>
      </div>
    </div>
  );
};

export default StatsCards;
