import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Charts = ({ pieData, trendData }) => {
  const styles = {
    chartsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
      gap: "30px",
    },
    chartContainer: {
      backgroundColor: "#d1d5db",
      borderRadius: "12px",
      padding: "30px",
      position: "relative",
    },
    chartTitle: {
      fontWeight: "600",
      color: "#374151",
      marginBottom: "20px",
      textAlign: "center",
      fontSize: "18px",
    },
    chartSubtitle: {
      fontSize: "14px",
      color: "#6b7280",
      marginBottom: "20px",
      textAlign: "center",
    },
    chartWrapper: {
      height: "300px",
      width: "100%",
    },
    timeLabel: {
      position: "absolute",
      left: "10px",
      top: "50%",
      transform: "rotate(-90deg) translateY(-50%)",
      fontSize: "14px",
      color: "#6b7280",
      transformOrigin: "center",
    },
    severityLabel: {
      textAlign: "center",
      marginTop: "20px",
      fontSize: "14px",
      color: "#6b7280",
    },
  };

  return (
    <div style={styles.chartsGrid}>
      {/* Trend Line Chart */}
      <div style={styles.chartContainer}>
        <h3 style={styles.chartTitle}>Trendline</h3>
        <div style={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="cases"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.timeLabel}>Time:</div>
        <div style={styles.severityLabel}>Severity:</div>
      </div>

      {/* Pie Chart */}
      <div style={styles.chartContainer}>
        <h3 style={styles.chartTitle}>Pie Chart</h3>
        <p style={styles.chartSubtitle}>% of case</p>
        <div style={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;
