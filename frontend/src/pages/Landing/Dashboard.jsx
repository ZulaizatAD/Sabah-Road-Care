import React, { useState } from "react";
import Header from "./../../components/Header/Header";
import Footer from "./../../components/Footer/Footer";
import Filters from "./../../components/Filter";
import StatsCards from "./../../components/StatsCards";
import Charts from "./../../components/Charts";
import "./Dashboard.css";

<div className="dashboard-wrapper">
  <div className="dashboard-background"></div>
  <div className="dashboard-content">
    {/* Your existing dashboard content */}
  </div>
</div>;

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
    { month: "Mar", cases: 35 },
    { month: "Apr", cases: 55 },
    { month: "May", cases: 40 },
    { month: "Jun", cases: 60 },
  ];

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  return (
    <div className="dashboard-body">
      <Header />
      <main className="main">
        <div className="container">
          <Filters filters={filters} handleFilterChange={handleFilterChange} />
          <StatsCards />
          <Charts pieData={pieData} trendData={trendData} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
