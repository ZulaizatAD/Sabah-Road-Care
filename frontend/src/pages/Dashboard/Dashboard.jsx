import React, { useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Filters from "./Filter";
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
    { name: "Total Case", value: 45, color: "#8884d8" },
    { name: "In Investigation", value: 20, color: "#82ca9d" },
    { name: "Maintenance in Progress", value: 15, color: "#ffc658" },
    { name: "Case Close", value: 10, color: "#ff7c7c" },
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
