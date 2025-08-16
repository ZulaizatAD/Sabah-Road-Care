import React, { useEffect, useState } from "react";
import { validateConfig } from "../../config/environment";

const EnvironmentCheck = ({ children }) => {
  const [isConfigValid, setIsConfigValid] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkConfig = () => {
      const isValid = validateConfig();
      setIsConfigValid(isValid);
      setIsChecking(false);
    };

    checkConfig();
  }, []);

  if (isChecking) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div>Loading configuration...</div>
      </div>
    );
  }

  if (!isConfigValid) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "16px",
          padding: "20px",
          textAlign: "center",
          backgroundColor: "#f8f9fa",
        }}
      >
        <div style={{ fontSize: "48px" }}>⚠️</div>
        <h2 style={{ color: "#dc2626", margin: 0 }}>Configuration Error</h2>
        <p style={{ color: "#6b7280", maxWidth: "500px" }}>
          Missing required environment variables. Please check your .env file
          and ensure all required API keys are configured.
        </p>
        <div
          style={{
            backgroundColor: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "16px",
            maxWidth: "600px",
          }}
        >
          <h4 style={{ margin: "0 0 8px 0", color: "#991b1b" }}>
            Required Environment Variables:
          </h4>
          <ul style={{ textAlign: "left", color: "#7f1d1d", margin: 0 }}>
            <li>VITE_GOOGLE_MAPS_API_KEY</li>
          </ul>
        </div>
        <p style={{ fontSize: "14px", color: "#9ca3af" }}>
          Copy .env.example to .env and fill in your API keys
        </p>
      </div>
    );
  }

  return children;
};

export default EnvironmentCheck;
