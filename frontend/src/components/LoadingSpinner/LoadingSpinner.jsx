import React from "react";
import "./LoadingSpinner.css";

const LoadingSpinner = ({
  size = "medium",
  message = "Loading...",
  color = "primary",
}) => {
  return (
    <div className="loading-container">
      <div className={`loading-spinner ${size} ${color}`}></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
