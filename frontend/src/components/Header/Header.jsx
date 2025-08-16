import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "../../context/UserContext";
import assets from "../../assets/assets";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Refs for dropdown positioning
  const informationRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        informationRef.current &&
        !informationRef.current.contains(event.target) &&
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Don't show header on login page
  if (location.pathname === "/") {
    return null;
  }

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  // Simple logout handler
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  // Toggle dropdown
  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  // Check for current path active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo Homepage */}
        <div
          className="header-brand"
          onClick={() => handleNavigation("/homepage")}
        >
          <span className="brand-logo">
            <img src={assets.TransparentLogo} alt="Logo" />
          </span>
          <span className="brand-name">Sabah Road Care</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="header-nav">
          {/* Dashboard Nav */}
          <button
            className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard")}
          >
            <span className="nav-text">Dashboard</span>
          </button>

          {/* Information Dropdown */}
          <div className="nav-dropdown" ref={informationRef}>
            <button
              className={`nav-item dropdown-trigger ${
                isActive("/information") ? "active" : ""
              } ${activeDropdown === "information" ? "open" : ""}`}
              onClick={() => toggleDropdown("information")}
            >
              <span className="nav-icon">ℹ️</span>
              <span className="nav-text">Information</span>
              <span
                className={`dropdown-arrow ${
                  activeDropdown === "information" ? "open" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {activeDropdown === "information" && (
              <div className="dropdown-menu">
                <button
                  className="dropdown-item"
                  onClick={() => handleNavigation("/information")}
                >
                  <span className="dropdown-icon">🎯</span>
                  <span className="dropdown-text">Fun Facts</span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handleNavigation("/information")}
                >
                  <span className="dropdown-icon">📅</span>
                  <span className="dropdown-text">Timeline</span>
                </button>
              </div>
            )}
          </div>

          {/* Profile Dropdown*/}
          <div className="nav-dropdown" ref={profileRef}>
            <button
              className={`nav-item dropdown-trigger ${
                isActive("/history") || isActive("/profileupdate")
                  ? "active"
                  : ""
              } ${activeDropdown === "profile" ? "open" : ""}`}
              onClick={() => toggleDropdown("profile")}
            >
              <span className="nav-icon">👤</span>
              <span className="nav-text">Profile</span>
              <span
                className={`dropdown-arrow ${
                  activeDropdown === "profile" ? "open" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {activeDropdown === "profile" && (
              <div className="dropdown-menu">
                {/* User Info Display - Always show since user always exists */}
                <div className="user-info-dropdown">
                  <div className="user-email">{user?.email || "Demo User"}</div>
                  <div className="dropdown-divider"></div>
                </div>

                <button
                  className="dropdown-item"
                  onClick={() => handleNavigation("/history")}
                >
                  <span className="dropdown-icon">📋</span>
                  <span className="dropdown-text">User History</span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handleNavigation("/profileupdate")}
                >
                  <span className="dropdown-icon">⚙️</span>
                  <span className="dropdown-text">Update Account</span>
                </button>

                {/* Optional logout for capstone demo */}
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <span className="dropdown-icon">🚪</span>
                  <span className="dropdown-text">Reset Demo</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? "open" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-content">
          {/* User Info in Mobile - Always show */}
          <div className="mobile-user-info">
            <div className="mobile-user-email">
              {user?.email || "Demo User"}
            </div>
            <div className="mobile-user-divider"></div>
          </div>

          {/* Mobile Dashboard */}
          <button
            className={`mobile-nav-item ${
              isActive("/dashboard") ? "active" : ""
            }`}
            onClick={() => handleNavigation("/dashboard")}
          >
            <span className="mobile-nav-text">Dashboard</span>
          </button>

          {/* Mobile Information Section */}
          <div className="mobile-nav-section">
            <div className="mobile-section-title">
              <span className="mobile-section-icon">ℹ️</span>
              <span className="mobile-section-text">Information</span>
            </div>
            <div className="mobile-section-items">
              <button
                className="mobile-nav-subitem"
                onClick={() => handleNavigation("/information")}
              >
                <span className="mobile-nav-icon">🎯</span>
                <span className="mobile-nav-text">Fun Facts</span>
              </button>
              <button
                className="mobile-nav-subitem"
                onClick={() => handleNavigation("/information")}
              >
                <span className="mobile-nav-icon">📅</span>
                <span className="mobile-nav-text">Timeline</span>
              </button>
            </div>
          </div>

          {/* Mobile Profile Section - Always visible */}
          <div className="mobile-nav-section">
            <div className="mobile-section-title">
              <span className="mobile-section-icon">👤</span>
              <span className="mobile-section-text">Profile</span>
            </div>
            <div className="mobile-section-items">
              <button
                className={`mobile-nav-subitem ${
                  isActive("/history") ? "active" : ""
                }`}
                onClick={() => handleNavigation("/history")}
              >
                <span className="mobile-nav-icon">📋</span>
                <span className="mobile-nav-text">User History</span>
              </button>
              <button
                className={`mobile-nav-subitem ${
                  isActive("/profileupdate") ? "active" : ""
                }`}
                onClick={() => handleNavigation("/profileupdate")}
              >
                <span className="mobile-nav-icon">⚙️</span>
                <span className="mobile-nav-text">Update Account</span>
              </button>
              <button
                className="mobile-nav-subitem logout"
                onClick={handleLogout}
              >
                <span className="mobile-nav-icon">🔄</span>
                <span className="mobile-nav-text">Reset Demo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
