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

const Charts = ({ pieData, trendData }) => (
  <div className="grid grid-cols-2 gap-6">
    {/* Trend Line Chart */}
    <div className="bg-gray-200 rounded-lg p-6">
      <h3 className="font-semibold text-gray-800 mb-4 text-center">
        Trendline
      </h3>
      <div className="h-64">
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
      <div className="mt-4">
        <p className="text-sm text-gray-600 transform -rotate-90 absolute left-4 top-1/2">
          Time:
        </p>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">Severity:</p>
      </div>
    </div>

    {/* Pie Chart */}
    <div className="bg-gray-200 rounded-lg p-6">
      <h3 className="font-semibold text-gray-800 mb-2 text-center">
        Pie Chart
      </h3>
      <p className="text-sm text-gray-600 mb-4 text-center">% of case</p>
      <div className="h-64">
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

export default Charts;
