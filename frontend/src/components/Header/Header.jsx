import React from "react";
import "./Header.css";
import assets from "../../assets/assets";

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <img src={assets.SRC_Black} alt="Logo" />
          </div>
          <button
            className="sabah-road-care-button" // Changed from homepage-button to sabah-road-care-button
            onClick={() => (window.location.href = "/")}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#c4c9d0")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#d1d5db")}
          >
            Sabah Road Care
          </button>
        </div>
        <nav className="nav">
          <a href="#" className="nav-link active">
            Dashboard
          </a>
          <a href="#" className="nav-link">
            Information
          </a>
          <a href="#" className="nav-link">
            Profile
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
