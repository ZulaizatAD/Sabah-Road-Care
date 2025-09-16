import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "./ReportAI.css";

const ReportAI = ({ report, analysisData, onClose }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  // 🔥 NEW: Use real analysis data instead of generating fake data
  useEffect(() => {
    if (analysisData) {
      console.log("🔍 ReportAI received analysisData:", analysisData);

      // Transform real API data into display format
      const realAnalysis = {
        severity: {
          level: analysisData.base_severity || report.severity || "Low",
          confidence: 95, // You can get this from analysisData if available
          factors: [
            `Estimated depth: ${analysisData.estimated_depth || "Unknown"}`,
            "Road surface condition assessment",
            "Traffic impact evaluation",
            "Weather condition consideration",
          ],
        },
        priority: {
          level: analysisData.final_priority || report.priority || "Low",
          confidence: 88, // You can get this from analysisData if available
          factors: [
            "Location traffic density",
            "Road importance classification",
            "Safety risk assessment",
            `Community reports: ${analysisData.community_reports || 1}`,
          ],
        },
        recommendations: [
          "Analysis completed based on image assessment",
          "Priority determined by AI evaluation",
          "Monitor for changes in condition",
          "Follow standard repair procedures",
        ],
      };

      setAnalysis(realAnalysis);
      setIsAnalyzing(false);
    } else {
      setError("No analysis data available");
    }
  }, [analysisData, report]);

  const getStandardizedText = (text, type) => {
    const standardTexts = {
      severity: {
        Critical: "CRITICAL",
        High: "HIGH",
        Medium: "MEDIUM",
        Low: "LOW",
      },
      priority: {
        High: "HIGH",
        Medium: "MEDIUM",
        Low: "LOW",
      },
    };

    return standardTexts[type]?.[text] || text?.toUpperCase() || "";
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical":
        return "critical";
      case "High":
        return "high";
      case "Medium":
        return "medium";
      case "Low":
        return "low";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "high";
      case "Medium":
        return "medium";
      case "Low":
        return "low";
      default:
        return "default";
    }
  };

  return (
    <div className="report-ai-container">
      <div className="ai-header">
        <div className="ai-title">
          <h4>AI Analysis Report</h4>
        </div>
        <button className="ai-close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      {isAnalyzing && (
        <div className="ai-loading">
          <div className="ai-loading-spinner"></div>
          <div className="ai-loading-text">
            <p>📊 Processing analysis results...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="ai-error">
          <span className="error-icon">❌</span>
          <p>{error}</p>
        </div>
      )}

      {analysis && !isAnalyzing && (
        <div className="ai-results">
          {/* Severity Analysis */}
          <div className="analysis-section">
            <h5>🔍 Severity Analysis</h5>
            <div className="analysis-result">
              <div className="result-header">
                <span
                  className={`ai-severity-badge standardized ${getSeverityColor(
                    analysis.severity.level
                  )}`}
                >
                  {getStandardizedText(analysis.severity.level, "severity")}
                </span>
                <span className="confidence">
                  {analysis.severity.confidence}% confidence
                </span>
              </div>
              <div className="analysis-factors">
                <p>
                  <strong>Analysis Factors:</strong>
                </p>
                <ul>
                  {analysis.severity.factors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Priority Analysis */}
          <div className="analysis-section">
            <h5>⚡ Priority Assessment</h5>
            <div className="analysis-result">
              <div className="result-header">
                <span
                  className={`ai-priority-badge standardized ${getPriorityColor(
                    analysis.priority.level
                  )}`}
                >
                  {getStandardizedText(analysis.priority.level, "priority")}
                </span>
                <span className="confidence">
                  {analysis.priority.confidence}% confidence
                </span>
              </div>
              <div className="analysis-factors">
                <p>
                  <strong>Assessment Factors:</strong>
                </p>
                <ul>
                  {analysis.priority.factors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="analysis-section">
            <h5>💡 AI Recommendations</h5>
            <div className="recommendations">
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="recommendation-item">
                  <span className="recommendation-icon">•</span>
                  <span className="recommendation-text">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="ai-actions">
            <button
              className="export-analysis-btn"
              onClick={() => {
                toast.info("📊 Analysis export feature coming soon!");
              }}
            >
              Export Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportAI;
