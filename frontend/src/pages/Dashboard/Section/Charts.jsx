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
  // Default data fallbacks with glassmorphism-friendly colors
  const defaultPieData = [
    { name: "Low", value: 0, color: "#00d4ff" },
    { name: "Medium", value: 0, color: "#ffbb33" },
    { name: "High", value: 0, color: "#ff4444" },
  ];

  const defaultTrendData = [
    { month: "Jan", cases: 0 },
    { month: "Feb", cases: 0 },
    { month: "Mar", cases: 0 },
    { month: "Apr", cases: 0 },
    { month: "May", cases: 0 },
    { month: "Jun", cases: 0 },
  ];

  const chartPieData = pieData && pieData.length > 0 ? pieData : defaultPieData;
  const chartTrendData =
    trendData && trendData.length > 0 ? trendData : defaultTrendData;

  // Custom tooltip styles for glassmorphism
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "12px",
            padding: "12px 16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            color: "#fff",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          <p style={{ margin: "0 0 8px 0", color: "rgba(255, 255, 255, 0.9)" }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p
              key={index}
              style={{
                margin: "4px 0",
                color: "#fff",
                fontWeight: "700",
              }}
            >
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="charts-grid">
      {/* Trend Line Chart */}
      <div className="chart-container">
        <h3 className="chart-title"> Monthly Trend</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartTrendData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255, 255, 255, 0.1)" 
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#fff", fontWeight: "600" }}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.3)" }}
                tickLine={{ stroke: "rgba(255, 255, 255, 0.3)" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#fff", fontWeight: "600" }}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.3)" }}
                tickLine={{ stroke: "rgba(255, 255, 255, 0.3)" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="cases"
                stroke="#00d4ff"
                strokeWidth={4}
                dot={{ 
                  fill: "#00d4ff", 
                  strokeWidth: 3, 
                  r: 6,
                  stroke: "#fff"
                }}
                activeDot={{ 
                  r: 8, 
                  stroke: "#00d4ff", 
                  strokeWidth: 3,
                  fill: "#fff"
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-subtitle">Cases reported per month</div>
      </div>

      {/* Pie Chart */}
      <div className="chart-container">
        <h3 className="chart-title">Severity Distribution</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth={2}
              >
                {chartPieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-subtitle">Percentage by severity level</div>
      </div>
    </div>
  );
};

export default Charts;
