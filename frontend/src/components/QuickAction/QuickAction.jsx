import React from "react";
import "./QuickAction.css";
import { useNavigate } from "react-router-dom";

const QuickAction = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: "reports",
      icon: "📊",
      text: "My Reports",
      path: "/history",
      description: "View your submission history",
    },
    {
      id: "dashboard",
      icon: "🏠",
      text: "Dashboard",
      path: "/dashboard",
      description: "Overview and analytics",
    },
    {
      id: "profile",
      icon: "👤",
      text: "Update Profile",
      path: "/profileupdate",
      description: "Manage your account",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="quick-actions">
      <h3 className="sidebar-title">Quick Actions</h3>
      <div className="action-buttons">
        {quickActions.map((action) => (
          <button
            key={action.id}
            className={`action-btn ${action.id}`}
            onClick={() => handleNavigation(action.path)}
          >
            <span className="action-icon">{action.icon}</span>
            <div className="action-content">
              <span className="action-text">{action.text}</span>
              <span className="action-description">{action.description}</span>
            </div>
            <span className="action-arrow">→</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickAction;
