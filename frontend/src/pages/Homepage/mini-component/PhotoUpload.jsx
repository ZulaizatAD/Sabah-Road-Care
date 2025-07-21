import React, { useRef, useState } from "react";

// Handles photo capture/upload function
// Support camera capture and gallery selection
// Include file validation and preview function
const PhotoUpload = ({ label, guideline, onUpload, photo }) => {
  //Reference to hidden file input element
  // State for storing image preview
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  // handle file selection from input
  // Validates file type and size, creates preview, and calls onUpload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type - MUST be an image
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      // Validate file size - maximum 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      // Create preview using FileReader API
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      onUpload(file);
    }
  };

  // Handle camera capture button click
  //Trigger the hidden file input which opens camera on mobile devices
  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.click();
    }
  };

  // Remove the selected photo and clears preview
  //Resets the component to initial state
  const removePhoto = () => {
    setPreview(null);
    onUpload(null); //Notify parent component that photo was removed
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle gallery selection button click
  // Open file picker without camera capture attribute
  const handleGallerySelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute("capture");
      fileInputRef.current.click();
    }
  };

  return (
    <div className="photo-upload">
      <div className="photo-label">
        <strong>{label}</strong>
        <small>{guideline}</small>
      </div>
      <div className="photo-container">
        {preview || photo ? (
          <div className="photo-preview">
            <img
              src={preview || (photo ? URL.createObjectURL(photo) : "")}
              alt="preview"
            />
            <button
              type="button"
              className="remove-photo"
              onClick={removePhoto}
              title="Remove photo"
            >
              ✕
            </button>
          </div>
        ) : (
          // Show placeholder when no image is selected
          <div className="photo-placeholder" onClick={handleCameraCapture}>
            <div className="camera-icon">📷</div>

            {/* Desktop Text */}
            <div className="upload-text upload-text-desktop">
              <div>Upload Photo</div>
            </div>

            {/* Mobile Text */}
            <div className="upload-text upload-text-mobile">
              <div>Tap to capture</div>
              <small>or upload photo</small>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input for photo selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Action buttons for camera and gallery */}
      <div className="photo-actions">
        <button
          type="button"
          className="photo-btn camera"
          onClick={handleCameraCapture}
          title="Take photo with camera"
        >
          📷 Camera
        </button>
        <button
          type="button"
          className="photo-btn gallery"
          onClick={handleGallerySelect}
          title="Select from gallery"
        >
          🖼️ Gallery
        </button>
      </div>
    </div>
  );
};

export default PhotoUpload;
