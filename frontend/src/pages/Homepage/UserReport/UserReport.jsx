import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormSection from "../mini-component/FormSection";
import "./UserReport.css";
import PhotoUpload from "../mini-component/PhotoUpload";

// UserReport Component
// Main component for user reporting form
// Handles form data, validation, location services and submission
const UserReport = () => {
  // Hook for navigation
  const navigate = useNavigate();

  // Main form state - stores all form data
  const [formData, setFormData] = useState({
    photos: [null, null, null],
    location: {
      latitude: null,
      longitude: null,
      address: "",
    },
    district: "",
    description: "",
  });

  // Form validation errors & track if form is being submitted (prevents double submission)
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // List all districts in Sabah for the dropdown
  const sabahDistricts = [
    { value: "", label: "Select District" },
    { value: "kota-kinabalu", label: "Kota Kinabalu" },
    { value: "sandakan", label: "Sandakan" },
    { value: "tawau", label: "Tawau" },
    { value: "penampang", label: "Penampang" },
    { value: "putatan", label: "Putatan" },
    { value: "papar", label: "Papar" },
    { value: "tuaran", label: "Tuaran" },
    { value: "kudat", label: "Kudat" },
    { value: "beaufort", label: "Beaufort" },
    { value: "ranau", label: "Ranau" },
    { value: "kota-belud", label: "Kota Belud" },
    { value: "keningau", label: "Keningau" },
    { value: "semporna", label: "Semporna" },
    { value: "kuala-penyu", label: "Kuala Penyu" },
    { value: "lahad-datu", label: "Lahad Datu" },
    { value: "others", label: "OTHERS" },
  ];

  const [recentSubmissions] = useState([
    {
      id: 1,
      documentNumber: "RPT-2025-001",
      location: "Jalan Tuaran, Kota Kinabalu",
      date: "2025-01-15",
      status: "Pending",
      similarReports: 3,
    },
    {
      id: 2,
      documentNumber: "RPT-2025-002",
      location: "Jalan Costal, Kota Kinabalu",
      date: "2025-02-16",
      status: "Reviewing",
      similarReports: 7,
    },
    {
      id: 3,
      documentNumber: "RPT-2025-003",
      location: "Jalan Beaufort, Beaufort",
      date: "2025-03-20",
      status: "Approved",
      similarReports: 2,
    },
    {
      id: 4,
      documentNumber: "RPT-2025-004",
      location: "Jalan Apas, Tawau",
      date: "2025-01-22",
      status: "Completed",
      similarReports: 5,
    },
    {
      id: 5,
      documentNumber: "RPT-2025-005",
      location: "Kilimu, Ranau",
      date: "2025-02-07",
      status: "Reviewing",
      similarReports: 1,
    },
  ]);

  // Handle input changes - textfields and dropdowns
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear any existing error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Step Instruction Toggle
  const toggleStep = (e, stepIndex) => {
    e.preventDefault();
    const step = e.currentTarget;
    step.classList.toggle("expanded");
  };

  // Handles photo upload for 3 angles - create copy of photos array, update specific index with the new file, update form data
  const handlePhotoUpload = (index, file) => {
    const newPhotos = [...formData.photos];
    newPhotos[index] = file;
    setFormData((prev) => ({
      ...prev,
      photos: newPhotos,
    }));
  };

  // Get user's current GPS location using browser's Geolocation API
  // Check if geolocation is supported by the browser
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              latitude,
              longitude,
            },
          }));
          // convert coordinates to human-radable address
          reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Unable to get your location. Please enable location services."
          );
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Convert GPS coordinates to human-readable address
  const reverseGeocode = async (lat, lng) => {
    try {
      // TODO: Implement actual geocoding service (Google Maps, etc.)
      // For now, just display coordinates as placeholder
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
        },
      }));
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };
  // Validate all form fields before submission
  const validateForm = () => {
    const newErrors = {};

    // Validate photo uploads (must have all 3 photos)
    const uploadedPhotos = formData.photos.filter((photo) => photo !== null);
    if (uploadedPhotos.length < 3) {
      newErrors.photos = "Please upload at least 3 photo";
    }

    // Validate location (must have GPS coordinates)
    if (!formData.location.latitude || !formData.location.longitude) {
      newErrors.location = "Please tag your location";
    }

    // Validate district selection
    if (!formData.district) {
      newErrors.district = "Please select a district";
    }

    // Update errors state and return validation result
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();

      submitData.append("description", formData.description);
      submitData.append("district", formData.district);
      submitData.append("latitude", formData.location.latitude);
      submitData.append("longitude", formData.location.longitude);
      submitData.append("address", formData.location.address);

      formData.photos.forEach((photo, index) => {
        if (photo) {
          submitData.append(`photo${index + 1}`, photo);
        }
      });

      //API call to submit report
      const response = await fetch("/api/reports", {
        method: "POST",
        body: submitData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        alert("Report submitted successfully!");
        navigate("/homepage");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="user-report">
      {/* Left Side - Main Form */}
      <div className="main-content">
        <header className="report-header">
          <h1>MAKE A REPORT!</h1>
          <button className="save-draft-btn">Save Draft</button>
        </header>

        {/* Main Form */}
        <form className="report-form" onSubmit={handleSubmit}>
          {/* Step 1 Instruction */}
          <div className="step-instruction">
            <div className="step" onClick={(e) => toggleStep(e, 0)}>
              <div className="step-header">
                <span className="step-number">1</span>
                <h3 className="step-title">Take Photos</h3>
                <span className="step-toggle">▼</span>
              </div>
              <div className="step-content">
                <p>
                  Please upload 3 clear image from different angles (front view,
                  side view, and close-up)
                </p>
              </div>
            </div>
          </div>
          {/* Photos Section */}
          <FormSection
            title="📸 PHOTOS (Required: 3 angles)"
            error={errors.photos}
          >
            <div className="photo-grid">
              <PhotoUpload
                label="Angle 1: Front/Top View"
                guideline="Show pothole from the front / top"
                onUpload={(file) => handlePhotoUpload(0, file)}
                photo={formData.photos[0]}
              />
              <PhotoUpload
                label="Angle 2: Side View"
                guideline="Capture depth and width"
                onUpload={(file) => handlePhotoUpload(1, file)}
                photo={formData.photos[1]}
              />
              <PhotoUpload
                label="Angle 3: Close-up View"
                guideline="Detail shot for analysis"
                onUpload={(file) => handlePhotoUpload(2, file)}
                photo={formData.photos[2]}
              />
            </div>
          </FormSection>

          {/* Step 2 Instruction */}
          <div className="step-instruction">
            <div className="step" onClick={(e) => toggleStep(e, 1)}>
              <div className="step-header">
                <span className="step-number">2</span>
                <h3 className="step-title">Tag Location</h3>
                <span className="step-toggle">▼</span>
              </div>
              <div className="step-content">
                <p>Use GPS to mark the actual location of your report</p>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <FormSection title="🗺️ LOCATION" error={errors.location}>
            <div className="location-controls">
              <button
                type="button"
                className="location-btn primary"
                onClick={getCurrentLocation}
              >
                📍 Tag Current Location
              </button>
              <button
                type="button"
                className="location-btn secondary"
                onClick={() => alert("Map picker coming soon!")}
              >
                🗺️ Pick on Map
              </button>
            </div>

            {/* Display location info if available */}
            {formData.location.latitude && (
              <div className="location-info">
                <p>
                  <strong>Latitude:</strong>{" "}
                  {formData.location.latitude.toFixed(6)}
                </p>
                <p>
                  <strong>Longitude:</strong>{" "}
                  {formData.location.longitude.toFixed(6)}
                </p>
                <p>
                  <strong>Address:</strong> {formData.location.address}
                </p>
              </div>
            )}
          </FormSection>

          {/* Step 3 Instruction */}
          <div className="step-instruction">
            <div className="step" onClick={(e) => toggleStep(e, 2)}>
              <div className="step-header">
                <span className="step-number">3</span>
                <h3 className="step-title">Select District</h3>
                <span className="step-toggle">▼</span>
              </div>
              <div className="step-content">
                <p>
                  Choose your district location from the dropdown menu. Select
                  OTHERS if not on the list.
                </p>
              </div>
            </div>
          </div>
          {/* District Section */}
          <FormSection title="🏙 DISTRICT" error={errors.district}>
            <select
              value={formData.district}
              onChange={(e) => handleInputChange("district", e.target.value)}
              className={errors.district ? "error" : ""}
            >
              {sabahDistricts.map((district) => (
                <option key={district.value} value={district.value}>
                  {district.label}
                </option>
              ))}
            </select>
          </FormSection>

          {/* Step 4 Instruction */}
          <div className="step-instruction">
            <div className="step" onClick={(e) => toggleStep(e, 3)}>
              <div className="step-header">
                <span className="step-number">4</span>
                <h3 className="step-title">Add Description</h3>
                <span className="step-toggle">▼</span>
              </div>
              <div className="step-content">
                <p>
                  Optional - You can provide additional details (size, nearby
                  vicinity, landmark, etc.) <br /> Submit Your Report!
                </p>
              </div>
            </div>
          </div>
          {/* Description Section */}
          <FormSection
            title="📝 REMARKS / DESCRIPTION"
            error={errors.description}
          >
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of the pothole (e.g., 'Large pothole blocking left lane / nearby an orange bus stop')"
              maxLength={200}
              className={errors.description ? "error" : ""}
            />
            <div className="char-count">{formData.description.length}/200</div>
          </FormSection>
          <div className="instructions-note">
            <p>
              <strong>Note:</strong> Your report will help us improve the
              quality of our service
            </p>
          </div>
          {/* Form Submit Action */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/homepage")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>

      {/* Right Side - Recent Submissions History */}
      <div className="sidebar">
        <div className="recent-submissions">
          <h3 className="sidebar-title">Recent Submissions</h3>
          <div className="submissions-list">
            {recentSubmissions.map((submission, index) => (
              <div key={submission.id} className="submission-item">
                <div className="submission-header">
                  <span className="document-number">
                    #{submission.documentNumber}
                  </span>
                  <span
                    className={`status-badge ${submission.status.toLowerCase()}`}
                  >
                    {submission.status}
                  </span>
                </div>
                <h4 className="submission-title">{submission.location}</h4>
                <div className="submission-meta">
                  <span className="submission-date">
                    {new Date(submission.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="similar-reports">
                  <span className="similar-count">
                    {submission.similarReports} Similar Report
                    {submission.similarReports !== 1 ? "s" : ""} submitted
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button
            className="view-all-btn"
            onClick={() => navigate("/submissions")}
          >
            View All Submissions
          </button>
        </div>

        {/* Quick Actions Section */}
        <div className="quick-actions">
          <h3 className="sidebar-title">Quick Actions</h3>
          <div className="action-buttons">
            <button
              className="action-btn reports"
              onClick={() => navigate("/my-reports")}
            >
              <span className="action-icon">📊</span>
              <span className="action-text">My Reports</span>
              <span className="action-arrow">→</span>
            </button>
            <button
              className="action-btn dashboard"
              onClick={() => navigate("/dashboard")}
            >
              <span className="action-icon">🏠</span>
              <span className="action-text">Dashboard</span>
              <span className="action-arrow">→</span>
            </button>
            <button
              className="action-btn profile"
              onClick={() => navigate("/profile")}
            >
              <span className="action-icon">👤</span>
              <span className="action-text">Update Profile</span>
              <span className="action-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserReport;
