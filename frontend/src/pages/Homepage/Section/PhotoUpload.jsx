import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import assets from "../../../assets/assets";

const PhotoUpload = ({ label, guideline, onUpload, photo, index }) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (photo && photo instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(photo);
    } else if (!photo) {
      setPreviewUrl(null);
    }
  }, [photo]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setIsLoading(true);
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, etc.)");
      setIsLoading(false);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      setIsLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
      setIsLoading(false);
    };
    reader.onerror = () => {
      toast.error("Error reading file");
      setIsLoading(false);
    };
    reader.readAsDataURL(file);

    if (typeof onUpload === "function") {
      onUpload(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const removePhoto = () => {
    setPreviewUrl(null);
    onUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div className="photo-upload-container">
      {/* Label Section */}
      <div className="photo-upload-header">
        <h3 className="photo-upload-title">{label}</h3>
        <p className="photo-upload-guideline">{guideline}</p>
      </div>

      {/* Main Upload Area */}
      <div
        className={`photo-upload-zone ${isDragOver ? "drag-over" : ""} ${
          previewUrl ? "has-image" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!previewUrl ? handleUploadClick : undefined}
      >
        {isLoading ? (
          <div className="photo-loading-state">
            <div className="loading-spinner primary large"></div>
            <p className="loading-text">Processing image...</p>
          </div>
        ) : previewUrl ? (
          <div className="photo-preview-container">
            <img
              src={previewUrl}
              alt="Preview"
              className="photo-preview-image"
            />
            <div className="photo-overlay">
              <button
                type="button"
                className="remove-photo-btn"
                onClick={removePhoto}
                title="Remove photo"
              >
                <span className="remove-icon">✕</span>
              </button>
              <button
                type="button"
                className="replace-photo-btn"
                onClick={handleUploadClick}
                title="Replace photo"
              >
                <img
                  src={assets.replacePhoto}
                  alt="Replace"
                  className="replace-icon"
                />
                Replace
              </button>
            </div>
          </div>
        ) : (
          <div className="photo-upload-placeholder">
            <div className="upload-icon-container">
              <img
                src={assets.uploadPhoto}
                alt="Upload"
                className="upload-icon"
              />
            </div>
            <div className="upload-content">
              <h4 className="upload-title">Upload Road Photo</h4>
              <p className="upload-description">
                Click to select or drag & drop an image
              </p>
              <div className="upload-specs">
                <span className="spec-item">📱 Camera</span>
                <span className="spec-divider">•</span>
                <span className="spec-item">🖼️ Gallery</span>
                <span className="spec-divider">•</span>
                <span className="spec-item">Max 5MB</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {/* Quick Action Button */}
      {!previewUrl && (
        <button
          type="button"
          className="quick-capture-btn"
          onClick={handleUploadClick}
          title="Quick capture"
        >
          <span>Quick Capture</span>
        </button>
      )}
    </div>
  );
};

export default PhotoUpload;
