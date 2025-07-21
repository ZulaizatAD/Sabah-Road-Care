import React, { useState } from "react";
import "./Header.css";
import assets from "../../assets/assets";

const Header = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleUpdateAccount = () => {
    // Add your update account logic here
    console.log("Update Account clicked");
    setIsProfileDropdownOpen(false);
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logout clicked");
    setIsProfileDropdownOpen(false);
  };
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <img src={assets.SRC_Black} alt="Logo" />
          </div>
          <a className="sabah-road-care-button" href="/homepage">
            Sabah Road Care
          </a>
        </div>
        <nav className="nav">
          <a href="/dashboard" className="nav-link active">
            Dashboard
          </a>
          <a href="#" className="nav-link">
            Information
          </a>
          <div className="profile-dropdown">
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                toggleProfileDropdown();
              }}
            >
              Profile
              <span
                className={`dropdown-arrow ${
                  isProfileDropdownOpen ? "open" : ""
                }`}
              >
                ▼
              </span>
            </a>
            {isProfileDropdownOpen && (
              <>
                <div
                  className="dropdown-backdrop"
                  onClick={() => setIsProfileDropdownOpen(false)}
                />
                <div
                  className={`dropdown-menu ${
                    isProfileDropdownOpen ? "show" : ""
                  }`}
                >
                  <button
                    className="dropdown-item"
                    onClick={handleUpdateAccount}
                  >
                    Update Account
                  </button>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
