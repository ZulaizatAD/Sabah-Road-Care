import React from "react";
import "./UserSubmit.css";
import Header from "../../components/Header/Header";
import ReportHistory from "./ReportHistory/ReportHistory";
import Footer from "../../components/Footer/Footer";

const UserSubmit = () => {
  return (
    <div>
      <Header />
      <div className="background-image">
        <ReportHistory />
      </div>
      <Footer />
    </div>
  );
};

export default UserSubmit;
