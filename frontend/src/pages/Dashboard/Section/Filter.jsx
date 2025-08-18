import React from "react";
import { toast } from "react-toastify";

const sabahDistricts = [
  { value: "", label: "All Districts" },
  { value: "kota-kinabalu", label: "Kota Kinabalu" },
  { value: "sandakan", label: "Sandakan" },
  { value: "tawau", label: "Tawau" },
  { value: "penampang", label: "Penampang" },
  { value: "putatan", label: "Putatan" },
  { value: "papar", label: "Papar" },
  { value: "tuaran", label: "Tuaran" },
  { value: "kudat", label: "Kudat" },
  { value: "beaufort", label: "Beaufort" },
  { value: "ranau", label: "Ranau" },
  { value: "kota-belud", label: "Kota Belud" },
  { value: "keningau", label: "Keningau" },
  { value: "semporna", label: "Semporna" },
  { value: "kuala-penyu", label: "Kuala Penyu" },
  { value: "lahad-datu", label: "Lahad Datu" },
  { value: "others", label: "Others" },
];

const Filter = ({ filters, handleFilterChange, handleShare }) => {
  const handleClearFilters = () => {
    handleFilterChange("location", "");
    handleFilterChange("date", "");
    handleFilterChange("severity", "");
    toast.info("Filters cleared");
  };

  const hasActiveFilters = filters.location || filters.date || filters.severity;

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
          <label htmlFor="location-filter">Location:</label>
          <select
            id="location-filter"
            className="filter-select"
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
          >
            {sabahDistricts.map((district) => (
              <option key={district.value} value={district.value}>
                {district.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="date-filter">Date:</label>
          <input
            id="date-filter"
            type="date"
            className="filter-date"
            value={filters.date}
            onChange={(e) => handleFilterChange("date", e.target.value)}
            max={new Date().toISOString().split('T')[0]} // Prevent future dates
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