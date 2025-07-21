import React, { useState } from "react";
import "./Share.css";

const Share = () => {
  const [dropdownActive, setDropdownActive] = useState(false);

  const toggleShareDropdown = () => {
    setDropdownActive(!dropdownActive);
  };

  const handleShare = (type) => {
    console.log(`Sharing via ${type}`);
    setDropdownActive(false);
    switch (type) {
      case "email":
        alert("Email sharing functionality would go here");
        break;
      case "link":
        navigator.clipboard.writeText(window.location.href).then(() => {
          alert("Link copied to clipboard!");
        });
        break;
      case "pdf":
        alert("PDF export functionality would go here");
        break;
      default:
        break;
    }
  };

  return (
    <div className="share-container">
      <button className="share-button" onClick={toggleShareDropdown}>
        <svg className="share-icon" viewBox="0 0 24 24" fill="none">
          <path
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Share
      </button>
      <div className={`share-dropdown ${dropdownActive ? "active" : ""}`}>
        <div className="share-option" onClick={() => handleShare("email")}>
          Email
        </div>
        <div className="share-option" onClick={() => handleShare("link")}>
          Copy Link
        </div>
        <div className="share-option" onClick={() => handleShare("pdf")}>
          Export PDF
        </div>
      </div>
    </div>
  );
};

export default Share;
