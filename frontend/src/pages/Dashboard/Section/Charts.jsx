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
  // Default data fallbacks
  const defaultPieData = [
    { name: "Low", value: 0, color: "#82ca9d" },
    { name: "Medium", value: 0, color: "#ffc658" },
    { name: "High", value: 0, color: "#ff7c7c" },
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

  return (
    <div className="charts-grid">
      {/* Trend Line Chart */}
      <div className="chart-container">
        <h3 className="chart-title">Monthly Trend</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#666" }}
                axisLine={{ stroke: "#ccc" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#666" }}
                axisLine={{ stroke: "#ccc" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="cases"
                stroke="#667eea"
                strokeWidth={3}
                dot={{ fill: "#667eea", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#667eea", strokeWidth: 2 }}
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
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-subtitle">Percentage by severity level</div>
      </div>
    </div>
  );
};

export default Charts;
