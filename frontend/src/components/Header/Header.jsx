import React from "react";
import "./Header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">LOGO</div>
          <button
            className="homepage-button"
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
