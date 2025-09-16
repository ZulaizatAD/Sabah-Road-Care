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
  if (location.pathname === "/" || location.pathname === "/login") {
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
          {/* Report History Nav */}
          <button
            className={`nav-item ${isActive("/history") ? "active" : ""}`}
            onClick={() => handleNavigation("/history")}
          >
            <span className="nav-text">Report History</span>
          </button>

          {/* Dashboard Nav */}
          <button
            className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}
            onClick={() => handleNavigation("/dashboard")}
          >
            <span className="nav-text">Dashboard</span>
          </button>

          {/* Fun Facts Nav */}
          <button
            className={`nav-item ${isActive("/information") ? "active" : ""}`}
            onClick={() => handleNavigation("/information")}
          >
            <span className="nav-text">Fun Facts</span>
          </button>

          {/* Profile Icon Dropdown */}
          <div className="nav-dropdown profile-dropdown" ref={profileRef}>
            <button
              className={`nav-item profile-trigger ${
                isActive("/profileupdate") ? "active" : ""
              } ${activeDropdown === "profile" ? "open" : ""}`}
              onClick={() => toggleDropdown("profile")}
            >
              <div className="profile-avatar">
                {user?.profileImage ||
                user?.profile_picture ||
                user?.photoURL ? (
                  <img
                    src={
                      user.profileImage || user.profile_picture || user.photoURL
                    }
                    alt="Profile"
                    className="profile-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                {/* Default avatar */}
                <div
                  className="default-avatar"
                  style={{
                    display:
                      user?.profileImage ||
                      user?.profile_picture ||
                      user?.photoURL
                        ? "none"
                        : "flex",
                  }}
                >
                  <img
                    src={assets.defaultUser}
                    alt="Default user"
                    className="default-user-icon"
                  />
                </div>
              </div>
              <span
                className={`dropdown-arrow ${
                  activeDropdown === "profile" ? "open" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {activeDropdown === "profile" && (
              <div className="dropdown-menu profile-menu">
                {/* User Info Display */}
                <div className="user-info-dropdown">
                  <div className="user-profile-section">
                    <div className="user-avatar-large">
                      {user?.profileImage ||
                      user?.profile_picture ||
                      user?.photoURL ? (
                        <img
                          src={
                            user.profileImage ||
                            user.profile_picture ||
                            user.photoURL
                          }
                          alt="Profile"
                          className="profile-image-large"
                        />
                      ) : (
                        <div className="default-avatar-large">
                          <img
                            src={assets.defaultUser}
                            alt="Default user"
                            className="default-user-icon-large"
                          />
                        </div>
                      )}
                    </div>
                    <div className="user-details">
                      <div className="user-name">
                        {user?.name ||
                          user?.full_name ||
                          user?.displayName ||
                          user?.email ||
                          "Demo User"}
                      </div>
                      {(user?.name || user?.full_name || user?.displayName) &&
                        user?.email && (
                          <div className="user-email-small">{user?.email}</div>
                        )}
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                </div>

                <button
                  className="dropdown-item"
                  onClick={() => handleNavigation("/profileupdate")}
                >
                  <span className="dropdown-icon">⚙️</span>
                  <span className="dropdown-text">Update Account</span>
                </button>

                {/* Logout for capstone demo */}
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <span className="dropdown-icon">🚪</span>
                  <span className="dropdown-text">Logout</span>
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
          {/* User Info in Mobile */}
          <div className="mobile-user-info">
            <div className="mobile-user-avatar">
              {user?.profileImage || user?.profile_picture || user?.photoURL ? (
                <img
                  src={
                    user.profileImage || user.profile_picture || user.photoURL
                  }
                  alt="Profile"
                  className="mobile-profile-image"
                />
              ) : (
                <div className="mobile-default-avatar">
                  <img
                    src={assets.defaultUser}
                    alt="Default user"
                    className="mobile-default-user-icon"
                  />
                </div>
              )}
            </div>
            <div className="mobile-user-details">
              <div className="mobile-user-name">
                {user?.name ||
                  user?.full_name ||
                  user?.displayName ||
                  user?.email ||
                  "Demo User"}
              </div>
              {user?.email && (
                <div className="mobile-user-email">{user?.email}</div>
              )}
            </div>
            <div className="mobile-user-divider"></div>
          </div>

          {/* Mobile Report History */}
          <button
            className={`mobile-nav-item ${
              isActive("/history") ? "active" : ""
            }`}
            onClick={() => handleNavigation("/history")}
          >
            <span className="mobile-nav-text">Report History</span>
          </button>

          {/* Mobile Dashboard */}
          <button
            className={`mobile-nav-item ${
              isActive("/dashboard") ? "active" : ""
            }`}
            onClick={() => handleNavigation("/dashboard")}
          >
            <span className="mobile-nav-text">Dashboard</span>
          </button>

          {/* Mobile Fun Facts */}
          <button
            className={`mobile-nav-item ${
              isActive("/information") ? "active" : ""
            }`}
            onClick={() => handleNavigation("/information")}
          >
            <span className="mobile-nav-text">Fun Facts</span>
          </button>

          {/* Mobile Profile Section */}
          <div className="mobile-nav-section">
            <div className="mobile-section-title">
              <span className="mobile-section-text">Account</span>
            </div>
            <div className="mobile-section-items">
              <button
                className={`mobile-nav-subitem ${
                  isActive("/profileupdate") ? "active" : ""
                }`}
                onClick={() => handleNavigation("/profileupdate")}
              >
                <span className="mobile-nav-text">Update Account</span>
              </button>
              <button
                className="mobile-nav-subitem logout"
                onClick={handleLogout}
              >
                <span className="mobile-nav-text">Logout</span>
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
