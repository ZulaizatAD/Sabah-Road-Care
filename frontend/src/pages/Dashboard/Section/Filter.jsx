import React, { useState } from "react";
import { toast } from "react-toastify";
import { 
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  TrashIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  DocumentArrowDownIcon
} from "@heroicons/react/24/outline";
import "./Filter.css";

const sabahDistricts = [
  { value: "", label: "All Districts"},
  { value: "Kota Kinabalu", label: "Kota Kinabalu"},
  { value: "Sandakan", label: "Sandakan"},
  { value: "Tawau", label: "Tawau"},
  { value: "Penampang", label: "Penampang"},
  { value: "Putatan", label: "Putatan"},
  { value: "Papar", label: "Papar"},
  { value: "Tuaran", label: "Tuaran"},
  { value: "Kudat", label: "Kudat"},
  { value: "Beaufort", label: "Beaufort"},
  { value: "Ranau", label: "Ranau"},
  { value: "Kota Belud", label: "Kota Belud"},
  { value: "Keningau", label: "Keningau"},
  { value: "Semporna", label: "Semporna"},
  { value: "Kuala Penyu", label: "Kuala Penyu"},
  { value: "Lahad Datu", label: "Lahad Datu"},
  { value: "Others", label: "Others"},
];

const Filter = ({ filters, handleFilterChange, handleShare }) => {
  const [activeTab, setActiveTab] = useState("location");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClearFilters = () => {
    handleFilterChange("district", "");
    handleFilterChange("start_date", "");
    handleFilterChange("end_date", "");
    handleFilterChange("severity", "");
    toast.success("Filters cleared successfully!");
  };

  const handleQuickDateFilter = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    handleFilterChange("end_date", endDate.toISOString().split("T")[0]);
    handleFilterChange("start_date", startDate.toISOString().split("T")[0]);
    toast.info(`Showing last ${days} days`);
  };

  const hasActiveFilters =
    filters.district ||
    filters.start_date ||
    filters.end_date ||
    filters.severity;

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.district) count++;
    if (filters.start_date) count++;
    if (filters.end_date) count++;
    if (filters.severity) count++;
    return count;
  };

  return (
    <div className="filter-container">
      <div className="filter-header">
        <div className="filter-title-section">
          <span className="filter-label">
            <MagnifyingGlassIcon className="filter-icon" />
            Dashboard Filters
          </span>
          {hasActiveFilters && (
            <span className="active-filters-badge">
              {getActiveFiltersCount()} active
            </span>
          )}
        </div>
        <div className="filter-header-actions">
          <button
            className="expand-toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUpIcon className="toggle-icon" />
            ) : (
              <ChevronDownIcon className="toggle-icon" />
            )}
          </button>
          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={handleClearFilters}>
              <TrashIcon className="clear-icon" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button
              className={`filter-tab ${
                activeTab === "location" ? "active" : ""
              }`}
              onClick={() => setActiveTab("location")}
            >
              <MapPinIcon className="tab-icon" />
              Location
            </button>
            <button
              className={`filter-tab ${activeTab === "time" ? "active" : ""}`}
              onClick={() => setActiveTab("time")}
            >
              <CalendarDaysIcon className="tab-icon" />
              Time Period
            </button>
            <button
              className={`filter-tab ${
                activeTab === "severity" ? "active" : ""
              }`}
              onClick={() => setActiveTab("severity")}
            >
              <ExclamationTriangleIcon className="tab-icon" />
              Severity
            </button>
          </div>

          {/* Filter Content */}
          <div className="filter-content">
            {activeTab === "location" && (
              <div className="filter-section">
                <div className="filter-group">
                  <label htmlFor="district-filter">Select District:</label>
                  <select
                    id="district-filter"
                    className="filter-select enhanced no-arrow"
                    value={filters.district}
                    onChange={(e) =>
                      handleFilterChange("district", e.target.value)
                    }
                  >
                    {sabahDistricts.map((district) => (
                      <option key={district.value} value={district.value}>
                        {district.label}
                      </option>
                    ))}
                  </select>
                </div>
                {filters.district && (
                  <div className="selected-filter-display">
                    <span className="selected-label">Selected:</span>
                    <span className="selected-value">
                      {filters.district || "All Districts"}
                    </span>
                  </div>
                )}
              </div>
            )}

            {activeTab === "time" && (
              <div className="filter-section">
                <div className="quick-date-filters">
                  <span className="quick-filter-label">Quick Select:</span>
                  <div className="quick-date-buttons">
                    <button
                      className="quick-date-btn"
                      onClick={() => handleQuickDateFilter(7)}
                    >
                      Last 7 Days
                    </button>
                    <button
                      className="quick-date-btn"
                      onClick={() => handleQuickDateFilter(30)}
                    >
                      Last 30 Days
                    </button>
                    <button
                      className="quick-date-btn"
                      onClick={() => handleQuickDateFilter(90)}
                    >
                      Last 3 Months
                    </button>
                  </div>
                </div>

                <div className="date-range-section">
                  <span className="date-range-label">Custom Range:</span>
                  <div className="date-inputs">
                    <div className="filter-group">
                      <label htmlFor="start-date-filter">From:</label>
                      <input
                        id="start-date-filter"
                        type="date"
                        className="filter-date enhanced"
                        value={filters.start_date}
                        onChange={(e) =>
                          handleFilterChange("start_date", e.target.value)
                        }
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div className="date-separator">to</div>
                    <div className="filter-group">
                      <label htmlFor="end-date-filter">To:</label>
                      <input
                        id="end-date-filter"
                        type="date"
                        className="filter-date enhanced"
                        value={filters.end_date}
                        onChange={(e) =>
                          handleFilterChange("end_date", e.target.value)
                        }
                        max={new Date().toISOString().split("T")[0]}
                        min={filters.start_date}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "severity" && (
              <div className="filter-section">
                <div className="severity-options">
                  {["", "Low", "Medium", "High"].map((severity) => (
                    <button
                      key={severity}
                      className={`severity-btn severity-${severity.toLowerCase()} ${
                        filters.severity === severity ? "active" : ""
                      }`}
                      onClick={() => handleFilterChange("severity", severity)}
                    >
                      {severity === "" && "All Levels"}
                      {severity === "Low" && "Low"}
                      {severity === "Medium" && "Medium"}
                      {severity === "High" && "High"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="filter-actions">
        <button className="share-btn enhanced" onClick={handleShare}>
          <LinkIcon className="action-icon" />
          Share Dashboard
        </button>
        <button className="export-btn">
          <DocumentArrowDownIcon className="action-icon" />
          Export Data
        </button>
      </div>
    </div>
  );
};

export default Filter;