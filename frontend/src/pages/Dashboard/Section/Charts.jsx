import React, { useState } from "react";
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
  BarChart,
  Bar,
  Area,
  AreaChart,
} from "recharts";
import "./Charts.css";

const Charts = ({ pieData, trendData }) => {
  const [chartType, setChartType] = useState('line'); // line, area, bar
  const [pieView, setPieView] = useState('donut'); // donut, pie

  // Updated colors to match your theme
  const defaultPieData = [
    { name: "Low", value: 0, color: "var(--safety-green)" },
    { name: "Medium", value: 0, color: "var(--caution-yellow)" },
    { name: "High", value: 0, color: "var(--hazard-red)" },
  ];

  const defaultTrendData = [
    { month: "Jan", cases: 0, resolved: 0 },
    { month: "Feb", cases: 0, resolved: 0 },
    { month: "Mar", cases: 0, resolved: 0 },
    { month: "Apr", cases: 0, resolved: 0 },
    { month: "May", cases: 0, resolved: 0 },
    { month: "Jun", cases: 0, resolved: 0 },
  ];

  const chartPieData = pieData && pieData.length > 0 ? pieData : defaultPieData;
  const chartTrendData = trendData && trendData.length > 0 ? trendData : defaultTrendData;

  // Enhanced Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <div className="tooltip-header">
            <span className="tooltip-label">{label}</span>
          </div>
          <div className="tooltip-content">
            {payload.map((entry, index) => (
              <div key={index} className="tooltip-item">
                <div 
                  className="tooltip-color" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="tooltip-name">{entry.name}:</span>
                <span className="tooltip-value">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderTrendChart = () => {
    switch(chartType) {
      case 'area':
        return (
          <AreaChart data={chartTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "var(--road-white)", fontWeight: "600" }}
              axisLine={{ stroke: "var(--glass-border)" }}
              tickLine={{ stroke: "var(--glass-border)" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--road-white)", fontWeight: "600" }}
              axisLine={{ stroke: "var(--glass-border)" }}
              tickLine={{ stroke: "var(--glass-border)" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="cases"
              stroke="var(--safety-green)"
              fill="var(--safety-green)"
              fillOpacity={0.3}
              strokeWidth={3}
            />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart data={chartTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "var(--road-white)", fontWeight: "600" }}
              axisLine={{ stroke: "var(--glass-border)" }}
              tickLine={{ stroke: "var(--glass-border)" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--road-white)", fontWeight: "600" }}
              axisLine={{ stroke: "var(--glass-border)" }}
              tickLine={{ stroke: "var(--glass-border)" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="cases" fill="var(--safety-green)" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      default:
        return (
          <LineChart data={chartTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "var(--road-white)", fontWeight: "600" }}
              axisLine={{ stroke: "var(--glass-border)" }}
              tickLine={{ stroke: "var(--glass-border)" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--road-white)", fontWeight: "600" }}
              axisLine={{ stroke: "var(--glass-border)" }}
              tickLine={{ stroke: "var(--glass-border)" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="cases"
              stroke="var(--safety-green)"
              strokeWidth={4}
              dot={{ 
                fill: "var(--safety-green)", 
                strokeWidth: 3, 
                r: 6,
                stroke: "var(--road-white)"
              }}
              activeDot={{ 
                r: 8, 
                stroke: "var(--safety-green)", 
                strokeWidth: 3,
                fill: "var(--road-white)"
              }}
            />
            <Line
              type="monotone"
              dataKey="resolved"
              stroke="var(--pedestrian-green)"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ 
                fill: "var(--pedestrian-green)", 
                strokeWidth: 2, 
                r: 4
              }}
            />
          </LineChart>
        );
    }
  };

  return (
    <div className="charts-grid">
      {/* Enhanced Trend Chart */}
      <div className="chart-container trend-chart">
        <div className="chart-header">
          <div className="chart-title-section">
            <h3 className="chart-title">📈 Monthly Trend</h3>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: "var(--safety-green)" }}></div>
                <span>Reported</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: "var(--pedestrian-green)" }}></div>
                <span>Resolved</span>
              </div>
            </div>
          </div>
          <div className="chart-controls">
            <div className="chart-type-selector">
              <button 
                className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
                onClick={() => setChartType('line')}
                title="Line Chart"
              >
                📈
              </button>
              <button 
                className={`chart-type-btn ${chartType === 'area' ? 'active' : ''}`}
                onClick={() => setChartType('area')}
                title="Area Chart"
              >
                📊
              </button>
              <button 
                className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
                onClick={() => setChartType('bar')}
                title="Bar Chart"
              >
                📊
              </button>
            </div>
          </div>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            {renderTrendChart()}
          </ResponsiveContainer>
        </div>
        <div className="chart-subtitle">Cases reported and resolved per month</div>
      </div>

      {/* Enhanced Pie Chart */}
      <div className="chart-container pie-chart">
        <div className="chart-header">
          <div className="chart-title-section">
            <h3 className="chart-title">⚠️ Severity Distribution</h3>
          </div>
          <div className="chart-controls">
            <div className="pie-type-selector">
              <button 
                className={`chart-type-btn ${pieView === 'pie' ? 'active' : ''}`}
                onClick={() => setPieView('pie')}
                title="Pie Chart"
              >
                🥧
              </button>
              <button 
                className={`chart-type-btn ${pieView === 'donut' ? 'active' : ''}`}
                onClick={() => setPieView('donut')}
                title="Donut Chart"
              >
                🍩
              </button>
            </div>
          </div>
        </div>
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
                innerRadius={pieView === 'donut' ? 40 : 0}
                fill="#8884d8"
                dataKey="value"
                stroke="var(--glass-border)"
                strokeWidth={2}
              >
                {chartPieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="var(--glass-border)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-stats">
          <div className="severity-stats">
            {chartPieData.map((item, index) => (
              <div key={index} className="severity-stat">
                <div 
                  className="severity-color" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="severity-name">{item.name}</span>
                <span className="severity-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="chart-subtitle">Distribution by severity level</div>
      </div>
    </div>
  );
};

export default Charts;