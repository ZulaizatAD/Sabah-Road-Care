import React, { useState } from "react";
import { formatNumber } from "../../../utils/formatters";
import "./StatusCards.css";

const StatusCards = ({ data }) => {
  const [viewMode, setViewMode] = useState('cards'); // cards, list, compact
  const [sortBy, setSortBy] = useState('value'); // value, title

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
      icon: "📊",
      trend: "+12%",
      trendDirection: "up",
      description: "All reported cases",
      priority: 1
    },
    {
      title: "Under Review",
      value: stats.underReview,
      color: "var(--under-review)",
      icon: "👀",
      trend: "+5%",
      trendDirection: "up",
      description: "Pending evaluation",
      priority: 2
    },
    {
      title: "Approved",
      value: stats.approved,
      color: "var(--approved)",
      icon: "✅",
      trend: "+8%",
      trendDirection: "up",
      description: "Ready for action",
      priority: 3
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      color: "var(--in-progress)",
      icon: "🚧",
      trend: "-2%",
      trendDirection: "down",
      description: "Currently being fixed",
      priority: 4
    },
    {
      title: "Completed",
      value: stats.completed,
      color: "var(--complete)",
      icon: "🎉",
      trend: "+15%",
      trendDirection: "up",
      description: "Successfully resolved",
      priority: 5
    },
    {
      title: "Rejected",
      value: stats.rejected,
      color: "var(--rejected)",
      icon: "❌",
      trend: "-3%",
      trendDirection: "down",
      description: "Not actionable",
      priority: 6
    }
  ];

  const sortedCards = [...cards].sort((a, b) => {
    if (sortBy === 'value') {
      return b.value - a.value;
    }
    return a.title.localeCompare(b.title);
  });

  const getTotalCases = () => {
    return cards.reduce((total, card) => total + card.value, 0);
  };

  const getCompletionRate = () => {
    const total = getTotalCases();
    return total > 0 ? ((stats.completed / total) * 100).toFixed(1) : 0;
  };

  if (viewMode === 'list') {
    return (
      <div className="status-section">
        <div className="status-header">
          <div className="status-title-section">
            <h2 className="status-section-title">📈 Case Statistics</h2>
            <div className="status-summary">
              <span className="summary-item">
                Total: <strong>{formatNumber(getTotalCases())}</strong>
              </span>
              <span className="summary-item">
                Completion Rate: <strong>{getCompletionRate()}%</strong>
              </span>
            </div>
          </div>
          <div className="view-controls">
            <select 
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="value">Sort by Value</option>
              <option value="title">Sort by Title</option>
            </select>
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
              >
                📊
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                📋
              </button>
            </div>
          </div>
        </div>
        
        <div className="status-list">
          {sortedCards.map((card, index) => (
            <div key={index} className="status-list-item">
              <div className="list-item-icon">{card.icon}</div>
              <div className="list-item-content">
                <div className="list-item-header">
                  <span className="list-item-title">{card.title}</span>
                  <span className="list-item-value">{formatNumber(card.value)}</span>
                </div>
                <div className="list-item-meta">
                  <span className="list-item-description">{card.description}</span>
                  <span className={`list-item-trend ${card.trendDirection}`}>
                    {card.trendDirection === 'up' ? '📈' : '📉'} {card.trend}
                  </span>
                </div>
              </div>
              <div className="list-item-progress">
                <div 
                  className="progress-bar"
                  style={{ 
                    width: `${(card.value / Math.max(...cards.map(c => c.value))) * 100}%`,
                    backgroundColor: card.color 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="status-section">
      <div className="status-header">
        <div className="status-title-section">
          <h2 className="status-section-title">📈 Case Statistics</h2>
          <div className="status-summary">
            <div className="summary-card">
              <span className="summary-label">Total Cases</span>
              <span className="summary-value">{formatNumber(getTotalCases())}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Completion Rate</span>
              <span className="summary-value">{getCompletionRate()}%</span>
            </div>
          </div>
        </div>
        <div className="view-controls">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Card View"
            >
              📊
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              📋
            </button>
          </div>
        </div>
      </div>

      <div className="status-grid enhanced">
        {cards.map((card, index) => (
          <div 
            key={index} 
            className="status-card enhanced" 
            data-status={card.title.toLowerCase().replace(' ', '-')}
          >
            <div className="status-card-header">
              <div className="status-icon-container">
                <span className="status-icon">{card.icon}</span>
              </div>
              <div className="status-trend-indicator">
                <span className={`trend-value ${card.trendDirection}`}>
                  {card.trendDirection === 'up' ? '📈' : '📉'} {card.trend}
                </span>
              </div>
            </div>
            
            <div className="status-content">
              <h3 className="status-title">{card.title}</h3>
              <p className="status-value">{formatNumber(card.value)}</p>
              <p className="status-description">{card.description}</p>
            </div>

            <div className="status-footer">
              <div className="status-progress">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${(card.value / Math.max(...cards.map(c => c.value))) * 100}%`,
                    backgroundColor: card.color 
                  }}
                ></div>
              </div>
              <span className="status-percentage">
                {getTotalCases() > 0 ? ((card.value / getTotalCases()) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusCards;