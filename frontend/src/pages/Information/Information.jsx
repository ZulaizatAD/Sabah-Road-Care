// --- File: SabahRoadCare.jsx ---

import React, { useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

const SabahRoadCare = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  // const timelineData = [...]; // same as before
  // const faqData = [...]; // same as before
  // const funFactsData = [...]; // same as before

  const renderDashboard = () => (
    <div className="dashboard-grid">
      <div
        className="card history-card"
        onClick={() => setActiveSection("history")}
      >
        <h2 className="card-title">Sabah Road History / Timeline</h2>
      </div>
      <div className="card" onClick={() => setActiveSection("faq")}>
        <h2 className="card-title">FAQ</h2>
      </div>
      <div className="card" onClick={() => setActiveSection("map")}>
        <h2 className="card-title">Road Map</h2>
      </div>
      <div className="card" onClick={() => setActiveSection("facts")}>
        <h2 className="card-title">Fun Facts</h2>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="content-section">
      <button
        className="back-button"
        onClick={() => setActiveSection("dashboard")}
      >
        ← Back to Dashboard
      </button>
      <h2 className="section-title">Sabah Road History & Timeline</h2>
      {timelineData.map((item, index) => (
        <div key={index} className="timeline-item">
          <div className="timeline-year">{item.year}</div>
          <div className="timeline-event">{item.event}</div>
        </div>
      ))}
    </div>
  );

  const renderFAQ = () => (
    <div className="content-section">
      <button
        className="back-button"
        onClick={() => setActiveSection("dashboard")}
      >
        ← Back to Dashboard
      </button>
      <h2 className="section-title">Frequently Asked Questions</h2>
      {faqData.map((item, index) => (
        <div key={index} className="faq-item">
          <div className="faq-question">{item.question}</div>
          <div className="faq-answer">{item.answer}</div>
        </div>
      ))}
    </div>
  );

  const renderMap = () => (
    <div className="content-section">
      <button
        className="back-button"
        onClick={() => setActiveSection("dashboard")}
      >
        ← Back to Dashboard
      </button>
      <h2 className="section-title">Sabah Road Map</h2>
      <div className="map-container">Interactive Road Map Coming Soon</div>
    </div>
  );

  const renderFunFacts = () => (
    <div className="content-section">
      <button
        className="back-button"
        onClick={() => setActiveSection("dashboard")}
      >
        ← Back to Dashboard
      </button>
      <h2 className="section-title">Fun Facts About Sabah Roads</h2>
      {funFactsData.map((item, index) => (
        <div key={index} className="fun-fact">
          <div className="fun-fact-title">{item.title}</div>
          <div className="fun-fact-text">{item.fact}</div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "history":
        return renderHistory();
      case "faq":
        return renderFAQ();
      case "map":
        return renderMap();
      case "facts":
        return renderFunFacts();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">SR</div>
          Sabah Road Care
        </div>
        <nav className="nav">
          <div
            className={`nav-item ${
              activeSection === "dashboard" ? "active" : ""
            }`}
            onClick={() => setActiveSection("dashboard")}
          >
            Dashboard
          </div>
          <div
            className={`nav-item ${
              activeSection === "information" ? "active" : ""
            }`}
            onClick={() => setActiveSection("information")}
          >
            Information
          </div>
          <div
            className={`nav-item ${
              activeSection === "profile" ? "active" : ""
            }`}
            onClick={() => setActiveSection("profile")}
          >
            Profile
          </div>
        </nav>
      </header>
      <main className="main">{renderContent()}</main>
      <footer className="footer">
        <div className="footer-left">© Sabah Road Care</div>
        <div className="footer-right">
          <a href="#" className="footer-link">
            Contact Us
          </a>
          <a href="#" className="footer-link">
            Privacy Policy
          </a>
          <a href="#" className="footer-link">
            Terms and Conditions
          </a>
        </div>
      </footer>
    </div>
  );
};

export default SabahRoadCare;
