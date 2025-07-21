import React, { useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Filters from "./Filter";
import StatsCards from "./StatsCards";
import Charts from "./Charts";
import "./Dashboard.css";
import Share from "./Share";

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
    <div className="dashboard-wrapper">
      <div className="dashboard-background"></div>
      <div className="dashboard-content">
        <Header />
        <main className="main">
          <div className="container">
            <Share /> {/* Add the Share button here */}
            <Filters
              filters={filters}
              handleFilterChange={handleFilterChange}
            />
            <StatsCards />
            <Charts pieData={pieData} trendData={trendData} />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
