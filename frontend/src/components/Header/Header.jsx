import React from "react";
import "./Header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-text">Sabah Road Care</span>
        </div>
        <nav className="nav">
          <a href="#" className="nav-link nav-link-active">
            Dashboard
          </a>
          <a href="#" className="nav-link">
            Information
          </a>
          <div className="nav-dropdown">
            <a href="#" className="nav-link">
              Profile
              <svg
                className="dropdown-icon"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <div className="dropdown-menu">
              <a href="#" className="dropdown-item">
                <svg
                  className="dropdown-item-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M8 8C10.2091 8 12 6.20914 12 4C12 1.79086 10.2091 0 8 0C5.79086 0 4 1.79086 4 4C4 6.20914 5.79086 8 8 8Z"
                    fill="currentColor"
                  />
                  <path
                    d="M8 10C3.58172 10 0 13.5817 0 18H16C16 13.5817 12.4183 10 8 10Z"
                    fill="currentColor"
                  />
                </svg>
                Update Profile
              </a>
              <a href="/" className="dropdown-item">
                <svg
                  className="dropdown-item-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M6 14H2C1.44772 14 1 13.5523 1 13V3C1 2.44772 1.44772 2 2 2H6M11 11L14 8M14 8L11 5M14 8H6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Sign Out
              </a>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
