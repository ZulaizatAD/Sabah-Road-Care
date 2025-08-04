import React from "react";

const StatusCards = () => {
  return (
    <div className="status-grid">
      <div className="status-card">
        <h3 className="status-title">Total Case</h3>
        <p className="status-value">45</p>
      </div>
      <div className="status-card">
        <h3 className="status-title">Under Review</h3>
        <p className="status-value">20</p>
      </div>
      <div className="status-card">
        <h3 className="status-title">Approved</h3>
        <p className="status-value">20</p>
      </div>
      <div className="status-card">
        <h3 className="status-title">In Progress</h3>
        <p className="status-value">15</p>
      </div>
      <div className="status-card">
        <h3 className="status-title">Complete</h3>
        <p className="status-value">10</p>
      </div>
      <div className="status-card">
        <h3 className="status-title">Rejected</h3>
        <p className="status-value">10</p>
      </div>
    </div>
  );
};

export default StatusCards;
