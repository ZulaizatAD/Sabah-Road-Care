import React, { useState } from "react";
import Header from "./../../components/Header/Header";
import Footer from "./../../components/Footer/Footer";
import Filters from "./../../components/Filter";
import StatsCards from "./../../components/StatsCards";
import Charts from "./../../components/Charts";
import "./Dashboard.css";

const Dashboard = () => {
  const [filters, setFilters] = useState({
    location: "",
    date: "",
    severity: "",
  });

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
    <div className="dashboard-container">
      <Header />
      <main className="main-content">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <Filters filters={filters} handleFilterChange={handleFilterChange} />
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="card">
              <h3 className="card-title">Total Case</h3>
              <p className="card-value">45</p>
            </div>
            <div className="card">
              <h3 className="card-title">In Investigation</h3>
              <p className="card-value">20</p>
            </div>
            <div className="card">
              <h3 className="card-title">Maintenance in Progress</h3>
              <p className="card-value">15</p>
            </div>
            <div className="card">
              <h3 className="card-title">Case Close</h3>
              <p className="card-value">10</p>
            </div>
          </div>
          <Charts pieData={pieData} trendData={trendData} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
