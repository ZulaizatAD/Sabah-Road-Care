import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show footer on login page
  if (location.pathname === '/') {
    return null;
  }

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left Side - Copyright (switched from right) */}
        <div className="footer-copyright">
          <span className="copyright-text">© Sabah Road Care</span>
        </div>

        {/* Right Side - Links (switched from left) */}
        <div className="footer-links">
          <button 
            className="footer-link"
            onClick={() => handleNavigation('/contact')}
          >
            Contact Us
          </button>
          <span className="footer-divider">|</span>
          <button 
            className="footer-link"
            onClick={() => handleNavigation('/faqs')}
          >
            About Us
          </button>
          <span className="footer-divider">|</span>
          <button 
            className="footer-link"
            onClick={() => handleNavigation('/faqs')}
          >
            Privacy Policy
          </button>
          <span className="footer-divider">|</span>
          <button 
            className="footer-link"
            onClick={() => handleNavigation('/faqs')}
          >
            Terms and Conditions
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
