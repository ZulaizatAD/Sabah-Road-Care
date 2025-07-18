import React from "react";
import "./UserReport.css";

const UserReport = () => {
  return (
    <div className="user-report">
      <header className="report-header">
        <button className="back-button">← Back to Home</button>
        <h1>📋 Report Pothole</h1>
        <button className="save-draft-btn">Save Draft</button>
      </header>

      <form action="" className="report-form">
        {/* Description Section */}
        <div className="char-count">
          <p>Description</p>
        </div>

        {/* District Section */}
        <div className="char-count">
          <p>District</p>
        </div>

        {/* Location Section */}
        <div className="char-count">
          <p>📍 Tag Current Location</p>
        </div>

        {/* Photos Section */}
        <div className="photo-grid">
          <p>📸 Upload Photos</p>
        </div>

        {/* Remarks Section */}
        <div className="char-count">
          <p>Remarks</p>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="button" className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserReport;
