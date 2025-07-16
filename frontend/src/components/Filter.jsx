import React from "react";

const Filters = ({ filters, handleFilterChange }) => {
  const styles = {
    filterSection: {
      marginBottom: "40px",
    },
    filterTitle: {
      fontSize: "24px",
      fontWeight: "600",
      textAlign: "center",
      marginBottom: "30px",
      color: "#111827",
    },
    filterContainer: {
      display: "flex",
      justifyContent: "center",
      gap: "20px",
      flexWrap: "wrap",
    },
    filterItem: {
      backgroundColor: "#d1d5db",
      borderRadius: "50px",
      padding: "12px 24px",
      minWidth: "200px",
    },
    filterSelect: {
      backgroundColor: "transparent",
      border: "none",
      outline: "none",
      width: "100%",
      textAlign: "center",
      fontWeight: "500",
      color: "#374151",
      fontSize: "16px",
    },
    filterInput: {
      backgroundColor: "transparent",
      border: "none",
      outline: "none",
      width: "100%",
      textAlign: "center",
      fontWeight: "500",
      color: "#374151",
      fontSize: "16px",
    },
  };

  return (
    <div style={styles.filterSection}>
      <h2 style={styles.filterTitle}>Filter by:</h2>
      <div style={styles.filterContainer}>
        <div style={styles.filterItem}>
          <select
            style={styles.filterSelect}
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
          >
            <option value="">Location:</option>
            <option value="new-york">New York</option>
            <option value="london">London</option>
            <option value="tokyo">Tokyo</option>
          </select>
        </div>
        <div style={styles.filterItem}>
          <input
            type="date"
            style={styles.filterInput}
            value={filters.date}
            onChange={(e) => handleFilterChange("date", e.target.value)}
            placeholder="Date:"
          />
        </div>
        <div style={styles.filterItem}>
          <select
            style={styles.filterSelect}
            value={filters.severity}
            onChange={(e) => handleFilterChange("severity", e.target.value)}
          >
            <option value="">Severity:</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Filters;
