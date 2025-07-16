import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div>© Sabah Road Care</div>
        <div className="footer-links">
          <a href="#" className="footer-link">
            Contact Us
          </a>
          <span className="separator">|</span>
          <a href="#" className="footer-link">
            Privacy Policy
          </a>
          <span className="separator">|</span>
          <a href="#" className="footer-link">
            Terms and Conditions
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
