import React from "react";
import { toast } from "react-toastify";

const sabahDistricts = [
  { value: "", label: "All Districts" },
  { value: "Kota Kinabalu", label: "Kota Kinabalu" },
  { value: "Sandakan", label: "Sandakan" },
  { value: "Tawau", label: "Tawau" },
  { value: "Penampang", label: "Penampang" },
  { value: "Putatan", label: "Putatan" },
  { value: "Papar", label: "Papar" },
  { value: "Tuaran", label: "Tuaran" },
  { value: "Kudat", label: "Kudat" },
  { value: "Beaufort", label: "Beaufort" },
  { value: "Ranau", label: "Ranau" },
  { value: "Kota Belud", label: "Kota Belud" },
  { value: "Keningau", label: "Keningau" },
  { value: "Semporna", label: "Semporna" },
  { value: "Kuala Penyu", label: "Kuala Penyu" },
  { value: "Lahad Datu", label: "Lahad Datu" },
  { value: "Others", label: "Others" },
];

const Filter = ({ filters, handleFilterChange, handleShare }) => {
  const handleClearFilters = () => {
    handleFilterChange("district", "");
    handleFilterChange("start_date", "");
    handleFilterChange("end_date", "");
    handleFilterChange("severity", "");
    toast.info("Filters cleared");
  };

  const hasActiveFilters =
    filters.district ||
    filters.start_date ||
    filters.end_date ||
    filters.severity;

  return (
    <div className="filter-container">
      <div className="filter-header">
        <span className="filter-label">
          <span className="filter-icon">🔍</span>
          Filter Dashboard:
        </span>
        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={handleClearFilters}>
            Clear All
          </button>
        )}
      </div>

      <div className="filter-inputs">
        <div className="filter-group">
          <label htmlFor="district-filter">District:</label>
          <select
            id="district-filter"
            className="filter-select"
            value={filters.district}
            onChange={(e) => handleFilterChange("district", e.target.value)}
          >
            {sabahDistricts.map((district) => (
              <option key={district.value} value={district.value}>
                {district.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="start-date-filter">Start Date:</label>
          <input
            id="start-date-filter"
            type="date"
            className="filter-date"
            value={filters.start_date}
            onChange={(e) => handleFilterChange("start_date", e.target.value)}
            max={new Date().toISOString().split("T")[0]} // Prevent future dates
          />
        </div>

        <div className="filter-group">
          <label htmlFor="end-date-filter">End Date:</label>
          <input
            id="end-date-filter"
            type="date"
            className="filter-date"
            value={filters.end_date}
            onChange={(e) => handleFilterChange("end_date", e.target.value)}
            max={new Date().toISOString().split("T")[0]} // Prevent future dates
          />
        </div>

        <div className="filter-group">
          <label htmlFor="severity-filter">Severity:</label>
          <select
            id="severity-filter"
            className="filter-select"
            value={filters.severity}
            onChange={(e) => handleFilterChange("severity", e.target.value)}
          >
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="filter-actions">
        <button className="share-btn" onClick={handleShare}>
          <span className="share-icon">📤</span>
          Share Dashboard
        </button>
      </div>
    </div>
  );
};

export default Filter;
