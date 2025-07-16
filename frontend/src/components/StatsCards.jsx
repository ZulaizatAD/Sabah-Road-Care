import React from "react";

const StatsCards = () => {
  const styles = {
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px",
      marginBottom: "40px",
    },
    statCard: {
      backgroundColor: "#d1d5db",
      borderRadius: "12px",
      padding: "30px",
      textAlign: "center",
    },
    statTitle: {
      fontWeight: "600",
      color: "#374151",
      marginBottom: "10px",
      fontSize: "16px",
    },
    statValue: {
      fontSize: "36px",
      fontWeight: "700",
      color: "#111827",
    },
  };

  return (
    <div style={styles.statsGrid}>
      <div style={styles.statCard}>
        <h3 style={styles.statTitle}>Total Case</h3>
        <p style={styles.statValue}>45</p>
      </div>
      <div style={styles.statCard}>
        <h3 style={styles.statTitle}>In Investigation</h3>
        <p style={styles.statValue}>20</p>
      </div>
      <div style={styles.statCard}>
        <h3 style={styles.statTitle}>Maintenance in Progress</h3>
        <p style={styles.statValue}>15</p>
      </div>
      <div style={styles.statCard}>
        <h3 style={styles.statTitle}>Case Close</h3>
        <p style={styles.statValue}>10</p>
      </div>
    </div>
  );
};

export default StatsCards;
