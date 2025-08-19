import React from "react";
import { formatNumber } from "../../../utils/formatters";

const StatusCards = ({ data }) => {
  // Default data for fallback
  const defaultData = {
    totalCases: 0,
    underReview: 0,
    approved: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0
  };

  const stats = data || defaultData;

  const cards = [
    {
      title: "Total Cases",
      value: stats.totalCases,
      color: "var(--total-case)",
      icon: "📊"
    },
    {
      title: "Under Review",
      value: stats.underReview,
      color: "var(--under-review)",
      icon: "👀"
    },
    {
      title: "Approved",
      value: stats.approved,
      color: "var(--approved)",
      icon: "✅"
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      color: "var(--in-progress)",
      icon: "🔄"
    },
    {
      title: "Completed",
      value: stats.completed,
      color: "var(--complete)",
      icon: "🎉"
    },
    {
      title: "Rejected",
      value: stats.rejected,
      color: "var(--rejected)",
      icon: "❌"
    }
  ];

  return (
    <div className="status-grid">
      {cards.map((card, index) => (
        <div key={index} className="status-card" data-status={card.title.toLowerCase().replace(' ', '-')}>
          <div className="status-header">
            <span className="status-icon">{card.icon}</span>
            <h3 className="status-title">{card.title}</h3>
          </div>
          <p className="status-value">{formatNumber(card.value)}</p>
          <div className="status-trend">
            {/* Add trend indicators here if needed */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusCards;
