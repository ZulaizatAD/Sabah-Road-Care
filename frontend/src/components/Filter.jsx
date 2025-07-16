import React from "react";

const Filters = ({ filters, handleFilterChange }) => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold text-center mb-6">Filter by:</h2>
    <div className="flex justify-center space-x-4">
      <div className="bg-gray-200 rounded-full px-6 py-3 min-w-48">
        <select
          className="bg-transparent text-center font-medium text-gray-800 w-full outline-none"
          value={filters.location}
          onChange={(e) => handleFilterChange("location", e.target.value)}
        >
          <option value="">Location:</option>
          <option value="new-york">New York</option>
          <option value="london">London</option>
          <option value="tokyo">Tokyo</option>
        </select>
      </div>
      <div className="bg-gray-200 rounded-full px-6 py-3 min-w-48">
        <input
          type="date"
          className="bg-transparent text-center font-medium text-gray-800 w-full outline-none"
          value={filters.date}
          onChange={(e) => handleFilterChange("date", e.target.value)}
          placeholder="Date:"
        />
      </div>
      <div className="bg-gray-200 rounded-full px-6 py-3 min-w-48">
        <select
          className="bg-transparent text-center font-medium text-gray-800 w-full outline-none"
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

export default Filters;
