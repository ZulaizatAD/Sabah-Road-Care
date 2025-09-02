import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "./ReportAI.css";

const ReportAI = ({ report, onClose }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  // Simulate AI analysis (replace with actual API call)
  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Mock AI analysis based on report data
      const mockAnalysis = {
        severity: {
          level: calculateSeverity(report),
          confidence: Math.floor(Math.random() * 20) + 80, // 80-99%
          factors: [
            "Pothole depth analysis from image",
            "Road surface condition assessment",
            "Traffic impact evaluation",
            "Weather condition consideration",
          ],
        },
        priority: {
          level: calculatePriority(report),
          confidence: Math.floor(Math.random() * 15) + 85, // 85-99%
          factors: [
            "Location traffic density",
            "Road importance classification",
            "Safety risk assessment",
            "Repair urgency evaluation",
          ],
        },
        recommendations: [
          "Immediate temporary marking recommended",
          "Schedule repair within 48-72 hours",
          "Monitor for expansion during rainy season",
          "Consider traffic rerouting if conditions worsen",
        ],
        riskLevel: calculateRiskLevel(report),
      };

      setAnalysis(mockAnalysis);
      toast.success("🤖 AI Analysis completed successfully!");
    } catch (err) {
      setError("Failed to generate AI analysis. Please try again.");
      toast.error("❌ AI Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper functions for mock calculations
  const calculateSeverity = (report) => {
    const severityLevels = ["Low", "Medium", "High", "Critical"];
    // Mock calculation based on description keywords
    const description = report.description?.toLowerCase() || "";
    if (description.includes("large") || description.includes("deep"))
      return "High";
    if (description.includes("medium") || description.includes("moderate"))
      return "Medium";
    if (description.includes("small") || description.includes("minor"))
      return "Low";
    return severityLevels[Math.floor(Math.random() * 3)]; // Random for demo
  };

  const calculatePriority = (report) => {
    const priorities = ["Low", "Medium", "High"];
    // Mock calculation based on district (main roads get higher priority)
    const mainDistricts = ["Kota Kinabalu", "Sandakan", "Tawau"];
    if (mainDistricts.includes(report.district)) {
      return Math.random() > 0.3 ? "High" : "Medium";
    }
    return priorities[Math.floor(Math.random() * 3)];
  };

  const calculateRiskLevel = (report) => {
    const risks = ["Low Risk", "Moderate Risk", "High Risk", "Critical Risk"];
    return risks[Math.floor(Math.random() * 4)];
  };

  // Auto-generate analysis on component mount
  useEffect(() => {
    generateAIAnalysis();
  }, []);

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

  const getRiskColor = (risk) => {
    if (risk.includes("Critical")) return "critical";
    if (risk.includes("High")) return "high";
    if (risk.includes("Moderate")) return "medium";
    return "low";
  };

  return (
    <div className="report-ai-container">
      <div className="ai-header">
        <div className="ai-title">
          <span className="ai-icon">🤖</span>
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
            <p>🔍 Analyzing pothole images...</p>
            <p>📊 Calculating severity metrics...</p>
            <p>⚡ Determining priority level...</p>
            <p>🎯 Generating recommendations...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="ai-error">
          <span className="error-icon">❌</span>
          <p>{error}</p>
          <button className="retry-btn" onClick={generateAIAnalysis}>
            🔄 Retry Analysis
          </button>
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
                  className={`severity-badge ${getSeverityColor(
                    analysis.severity.level
                  )}`}
                >
                  {analysis.severity.level}
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
                  className={`priority-badge ${getPriorityColor(
                    analysis.priority.level
                  )}`}
                >
                  {analysis.priority.level} Priority
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

          {/* Risk Assessment */}
          <div className="analysis-section">
            <h5>⚠️ Risk Assessment</h5>
            <div className="analysis-result">
              <span
                className={`risk-badge ${getRiskColor(analysis.riskLevel)}`}
              >
                {analysis.riskLevel}
              </span>
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
            <button className="regenerate-btn" onClick={generateAIAnalysis}>
              🔄 Regenerate Analysis
            </button>
            <button
              className="export-analysis-btn"
              onClick={() => {
                toast.info("📋 Analysis export feature coming soon!");
              }}
            >
              📊 Export Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportAI;
