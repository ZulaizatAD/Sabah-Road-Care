import React, { useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Filter from "./Filter";
import StatsCards from "./StatsCards";
import Charts from "./Charts";
import "./Dashboard.css";

const Dashboard = () => {
  const [filters, setFilters] = useState({
    location: "",
    date: "",
    severity: "",
  });

  // Sample data for charts
  const pieData = [
    { name: "Low", value: 20, color: "#82ca9d" },
    { name: "Medium", value: 15, color: "#ffc658" },
    { name: "High", value: 10, color: "#ff7c7c" },
  ];

  const trendData = [
    { month: "Jan", cases: 30 },
    { month: "Feb", cases: 45 },
    { month: "Mar", cases: 45 },
    { month: "Apr", cases: 55 },
    { month: "May", cases: 60 },
    { month: "Jun", cases: 60 },
  ];

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleShare = () => {
    // Implement share functionality here
    alert("Share functionality is not yet implemented.");
  };

  return (
    <div>
      <div className="dashboard-content">
        <main className="main">
          <div className="container">
            <Filter
              filters={filters}
              handleFilterChange={handleFilterChange}
              handleShare={handleShare} // Pass the handleShare function
            />
            <StatsCards />
            <Charts pieData={pieData} trendData={trendData} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
