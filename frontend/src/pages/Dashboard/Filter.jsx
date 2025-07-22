import React from "react";
const Filter = ({ filters, handleFilterChange, handleShare }) => {
  return (
    <div className="filter-container">
      <span className="filter-label">Filter by:</span>
      <div className="filter-inputs">
        <div className="filter-dropdown">
          <select
            className="filter-select"
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
          >
            <option value="">Location:</option>
            <option value="office1">Office 1</option>
            <option value="office2">Office 2</option>
            <option value="office3">Office 3</option>
          </select>
        </div>
        <div className="filter-dropdown">
          <input
            type="date"
            className="filter-date"
            value={filters.date}
            onChange={(e) => handleFilterChange("date", e.target.value)}
          />
        </div>
        <div className="filter-dropdown">
          <select
            className="filter-select"
            value={filters.severity}
            onChange={(e) => handleFilterChange("severity", e.target.value)}
          >
            <option value="">Severity:</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <button className="share-btn" onClick={handleShare}>
        Share
      </button>
    </div>
  );
};

export default Filter;
