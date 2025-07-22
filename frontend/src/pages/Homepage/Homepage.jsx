import React from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import UserReport from "./UserReport/UserReport";
import "./Homepage.css";

const Homepage = () => {
  return (
    <div>
      <Header />
      <div className="background-image">
        <UserReport />
      </div>
      <Footer />
    </div>
  );
};

export default Homepage;
