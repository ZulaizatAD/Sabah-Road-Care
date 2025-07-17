import React from "react";
import "./Filter.css";

const Filters = ({ filters, handleFilterChange }) => {
  return (
    <div className="filter-section">
      <h2 className="filter-title">Filter by:</h2>
      <div className="filter-container">
        <div className="filter-item">
          <select
            className="filter-select"
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
          >
            <option value="">Location:</option>
            <option value="new-york">New York</option>
            <option value="london">London</option>
            <option value="tokyo">Tokyo</option>
          </select>
        </div>
        <div className="filter-item">
          <input
            type="date"
            className="filter-input"
            value={filters.date}
            onChange={(e) => handleFilterChange("date", e.target.value)}
            placeholder="Date:"
          />
        </div>
        <div className="filter-item">
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
    </div>
  );
};

export default Filters;
