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
    <div
      style={{
        margin: 0,
        padding: 0,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        backgroundColor: "#f3f4f6",
        minHeight: "100vh",
      }}
    >
      <Header />
      <main
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "30px 20px" }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            padding: "30px",
          }}
        >
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
