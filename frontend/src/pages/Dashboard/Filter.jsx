import React from "react";

const sabahDistricts = [
  { value: "", label: "Sabah" },
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
            {sabahDistricts.map((district) => (
              <option key={district.value} value={district.value}>
                {district.label}
              </option>
            ))}
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
