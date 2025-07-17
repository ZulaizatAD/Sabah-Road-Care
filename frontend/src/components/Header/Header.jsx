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
          <a className="sabah-road-care-button" href="/">
            Sabah Road Care
          </a>
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
