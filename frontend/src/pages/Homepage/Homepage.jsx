import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "../../context/UserContext";
import FormSection from "./Section/FormSection";
import PhotoUpload from "./Section/PhotoUpload";
import QuickAction from "../../components/QuickAction/QuickAction";
import MapPicker from "../../components/MapPicker/MapPicker";
import {
  safeDuplicateCheck as checkDuplicateSubmission,
  getDuplicateDetectionSummary,
  formatTimeRemaining,
  calculatePriorityFromDuplicates,
  generateLocationHash,
} from "../../utils/duplicateDetection";
import { reportAPI } from "../../services/api";
import "./Homepage.css";
import config from "../../config/environment";

const Homepage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  // Add duplicate detection state
  const [duplicateDetection, setDuplicateDetection] = useState(null);
  const [showDuplicateInfo, setShowDuplicateInfo] = useState(false);

  // Map interaction states
  const [tempLocation, setTempLocation] = useState(null); // Temporary location from map interaction
  const [hasLocationChanged, setHasLocationChanged] = useState(false); // Track if user has interacted with map

  // Main form state
  const [formData, setFormData] = useState({
    photos: [null, null, null],
    location: {
      latitude: null,
      longitude: null,
      address: "",
      roadName: "",
    },
    district: "",
    description: "",
  });

  // Check for duplicates when location changes
  useEffect(() => {
    if (formData.location.latitude && formData.location.longitude && user?.id) {
      const checkDuplicates = async () => {
        try {
          // Fetch user's reports and all reports for comparison
          const [userReportsResponse, allReportsResponse] = await Promise.all([
            reportAPI.getUserReports({ userId: user.id }),
            reportAPI.getNearbyReports({
              latitude: formData.location.latitude,
              longitude: formData.location.longitude,
              radius: 100, // 100 meter radius
            }),
          ]);

          const newReport = {
            location: formData.location,
            submissionTime: new Date().toISOString(),
            userId: user.id,
          };

          const duplicateResult = checkDuplicateSubmission(
            newReport,
            userReportsResponse.data.reports || [],
            allReportsResponse.data.reports || []
          );

          setDuplicateDetection(duplicateResult);

          if (
            !duplicateResult.canSubmit ||
            duplicateResult.similarReportsCount > 0
          ) {
            setShowDuplicateInfo(true);
          }
        } catch (error) {
          console.error("Duplicate detection error:", error);
          // Fallback to local check with recent submissions
          const newReport = {
            location: formData.location,
            submissionTime: new Date().toISOString(),
            userId: user.id,
          };

          const duplicateResult = checkDuplicateSubmission(
            newReport,
            recentSubmissions.filter((r) => r.userId === user.id),
            recentSubmissions
          );

          setDuplicateDetection(duplicateResult);
        }
      };

      // Debounce the duplicate check
      const timeoutId = setTimeout(checkDuplicates, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.location.latitude, formData.location.longitude, user?.id]);

  // Form validation errors & submission state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sabah districts list
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

  // Handle input changes
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

  // Handle photo upload
  const handlePhotoUpload = (index, file) => {
    if (!formData.photos || !Array.isArray(formData.photos)) {
      console.error("Photos array not properly initialized");
      setFormData((prev) => ({
        ...prev,
        photos: [null, null, null],
      }));
      return;
    }

    if (index < 0 || index >= 3) {
      console.error("Invalid photo index:", index);
      return;
    }

    const newPhotos = [...formData.photos];
    newPhotos[index] = file;

    setFormData((prev) => ({
      ...prev,
      photos: newPhotos,
    }));

    if (file) {
      toast.success(`📸 Photo ${index + 1} uploaded successfully!`, {
        position: "top-right",
        autoClose: 1500,
      });
    }
  };

  // Handle map interaction (drag/click) - stores temporary location
  const handleMapInteraction = (locationData) => {
    setTempLocation({
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      address: locationData.address,
      roadName: locationData.roadName,
    });
    setHasLocationChanged(true);
  };

  // Handle confirming the location selection
  const handleConfirmLocation = () => {
    if (tempLocation) {
      setFormData((prev) => ({
        ...prev,
        location: tempLocation,
      }));

      // Clear any existing error
      if (errors.location) {
        setErrors((prev) => ({
          ...prev,
          location: "",
        }));
      }

      setHasLocationChanged(false);
      toast.success("📍 Location confirmed successfully!", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  // Handle clearing location
  const handleClearLocation = () => {
    setFormData((prev) => ({
      ...prev,
      location: {
        latitude: null,
        longitude: null,
        address: "",
        roadName: "",
      },
    }));
    setTempLocation(null);
    setHasLocationChanged(false);
    toast.info("Location cleared. Please select a new location on the map.");
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};

    // Validate photos
    if (!formData.photos || !Array.isArray(formData.photos)) {
      newErrors.photos = "Photos array not initialized";
      return false;
    }

    const uploadedPhotos = formData.photos.filter(
      (photo) => photo !== null && photo !== undefined
    );
    if (uploadedPhotos.length < 3) {
      newErrors.photos = "Please upload all 3 photos";
    }

    // Validate location
    if (!formData.location.latitude || !formData.location.longitude) {
      newErrors.location = "Please select and confirm your location on the map";
    }

    // Validate district
    if (!formData.district) {
      newErrors.district = "Please select a district";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save draft function
  const handleSaveDraft = () => {
    try {
      const draftData = {
        description: formData.description,
        district: formData.district,
        location: formData.location,
        savedAt: new Date().toISOString(),
        id: Date.now(),
      };

      localStorage.setItem("potholeReportDraft", JSON.stringify(draftData));

      toast.success(
        "Draft saved successfully! 📝 (Photos will need to be re-uploaded)",
        {
          toastId: "draft-saved",
          position: "top-right",
          autoClose: 3000,
        }
      );
    } catch (error) {
      toast.error("Failed to save draft. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    // Check if user has pending location changes
    if (hasLocationChanged) {
      toast.warning(
        "Please confirm your location selection before submitting."
      );
      return;
    }

    // Generate location hash for duplicate detection
    const locationHash = generateLocationHash(
      formData.location.latitude,
      formData.location.longitude
    );

    // BLOCKING CHECK: User duplicate within 72 hours
    if (duplicateDetection && !duplicateDetection.canSubmit) {
      const summary = getDuplicateDetectionSummary(duplicateDetection);
      toast.error(summary.message);
      return;
    }

    setIsSubmitting(true);

    // Show loading toast
    const loadingToast = toast.loading("Submitting your report...");

    try {
      const submitData = new FormData();

      submitData.append("description", formData.description);
      submitData.append("district", formData.district);
      submitData.append("latitude", formData.location.latitude);
      submitData.append("longitude", formData.location.longitude);
      submitData.append("address", formData.location.address);
      submitData.append("locationHash", locationHash);
      submitData.append("submissionTime", new Date().toISOString());
      submitData.append("userId", user.id);

      if (duplicateDetection) {
        const priority = calculatePriorityFromDuplicates(
          duplicateDetection.similarReportsCount,
          duplicateDetection.uniqueUsers,
          "Low"
        );

        submitData.append(
          "duplicateMetadata",
          JSON.stringify({
            locationHash: duplicateDetection.locationHash,
            similarReportsCount: duplicateDetection.similarReportsCount,
            uniqueUsers: duplicateDetection.uniqueUsers,
            severityMultiplier: duplicateDetection.severityMultiplier,
            calculatedPriority: priority,
          })
        );
      }

      if (formData.photos && Array.isArray(formData.photos)) {
        formData.photos.forEach((photo, index) => {
          if (photo && photo instanceof File) {
            submitData.append(`photo_${index + 1}`, photo);
          }
        });
      }

      // Replace simulation with real API call
      const response = await reportAPI.submitReport(submitData);

      toast.dismiss(loadingToast);

      // Show success message with priority info
      let successMessage = `Report submitted successfully! Report ID: ${response.data.reportId}`;
      if (duplicateDetection?.similarReportsCount > 0) {
        successMessage += `\n\nPriority boosted due to ${duplicateDetection.similarReportsCount} similar reports!`;
      }
      toast.success(successMessage, { autoClose: 5000 });

      // Clear draft and reset form
      localStorage.removeItem("potholeReportDraft");
      setFormData({
        photos: [null, null, null],
        location: {
          latitude: null,
          longitude: null,
          address: "",
          roadName: "",
        },
        district: "",
        description: "",
      });
      setTempLocation(null);
      setHasLocationChanged(false);

      // Navigate to history page
      setTimeout(() => navigate("/history"), 2000);
    } catch (error) {
      toast.dismiss(loadingToast);

      // Handle errors
      if (error.response?.status === 413) {
        toast.error("Files too large. Please compress images and try again.");
      } else if (error.response?.status === 422) {
        toast.error("Invalid data. Please check your inputs.");
      } else if (error.response?.status === 401) {
        toast.error("Authentication required. Please log in again.");
        navigate("/");
      } else {
        toast.error("Failed to submit report. Please try again.");
      }

      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("potholeReportDraft");
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);

        const cleanDraftData = {
          description: draftData.description || "",
          district: draftData.district || "",
          location: draftData.location || {
            latitude: null,
            longitude: null,
            address: "",
            roadName: "",
          },
          photos: [null, null, null],
          savedAt: draftData.savedAt,
        };

        // Only show toast for recent drafts
        const savedAt = new Date(draftData.savedAt);
        const hoursDiff = (new Date() - savedAt) / (1000 * 60 * 60);

        if (hoursDiff < 24) {
          toast.info("📋 Draft loaded! Continue where you left off.", {
            toastId: "draft-loaded",
            position: "top-right",
            autoClose: 4000,
          });
        }
        setFormData(cleanDraftData);
      } catch (error) {
        console.error("Error loading draft:", error);
        localStorage.removeItem("potholeReportDraft");
      }
    }
  }, []);

  // Render duplicate information
  const renderDuplicateInfo = () => {
    if (!showDuplicateInfo || !duplicateDetection) return null;

    const summary = getDuplicateDetectionSummary(duplicateDetection);

    return (
      <div className={`duplicate-info ${summary.status}`}>
        <div className="info-header">
          <span className="info-icon">
            {summary.status === "blocked"
              ? "🚫"
              : summary.status === "similar_found"
              ? "📊"
              : "ℹ️"}
          </span>
          <h4>{summary.title}</h4>
          <button
            className="close-info"
            onClick={() => setShowDuplicateInfo(false)}
          >
            ✕
          </button>
        </div>

        <p>{summary.message}</p>

        {/* BLOCKING: User duplicate */}
        {summary.status === "blocked" &&
          duplicateDetection.userDuplicates.length > 0 && (
            <div className="user-duplicate-details">
              <h5>Your Previous Report:</h5>
              {duplicateDetection.userDuplicates.map((duplicate, index) => (
                <div key={index} className="duplicate-item blocked">
                  <div className="duplicate-info">
                    <span className="duplicate-location">
                      📍 {duplicate.report.location || "Same location"}
                    </span>
                    <div className="duplicate-meta">
                      <span className="distance">
                        {duplicate.distance}m away
                      </span>
                      <span className="time">
                        {duplicate.timeDiffHours}h ago
                      </span>
                      <span className="remaining">
                        Wait: {formatTimeRemaining(duplicate.remainingHours)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* NON-BLOCKING: Similar reports (good for priority) */}
        {summary.status === "similar_found" &&
          duplicateDetection.similarReports.length > 0 && (
            <div className="similar-reports-details">
              <h5>Similar Reports (Priority Boost):</h5>
              <div className="priority-boost-info">
                <span className="boost-badge">
                  🚀 Priority:{" "}
                  {calculatePriorityFromDuplicates(
                    duplicateDetection.similarReportsCount,
                    duplicateDetection.uniqueUsers,
                    "Low"
                  )}
                </span>
                <span className="severity-info">
                  📈 Severity x{duplicateDetection.severityMultiplier}
                </span>
              </div>

              {duplicateDetection.similarReports
                .slice(0, 3)
                .map((similar, index) => (
                  <div key={index} className="duplicate-item similar">
                    <div className="duplicate-info">
                      <span className="duplicate-location">
                        📍 {similar.report.location || "Similar location"}
                      </span>
                      <div className="duplicate-meta">
                        <span className="distance">
                          {similar.distance}m away
                        </span>
                        <span className="time">
                          {similar.timeDiffHours}h ago
                        </span>
                        <span className="user">
                          {similar.isFromSameUser
                            ? "Your report"
                            : "Other user"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

              {duplicateDetection.similarReports.length > 3 && (
                <p className="more-reports">
                  +{duplicateDetection.similarReports.length - 3} more similar
                  reports
                </p>
              )}
            </div>
          )}

        <div className="info-actions">
          {summary.status === "blocked" ? (
            <>
              <button
                className="btn-secondary"
                onClick={() => navigate("/history")}
              >
                View Your Reports
              </button>
              <button
                className="btn-info"
                onClick={() => setShowDuplicateInfo(false)}
              >
                Understood
              </button>
            </>
          ) : (
            <>
              <button
                className="btn-secondary"
                onClick={() => navigate("/history")}
              >
                View Similar Reports
              </button>
              <button
                className="btn-primary"
                onClick={() => setShowDuplicateInfo(false)}
              >
                Continue Submission
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="user-report">
      {/* Left Side - Main Form */}
      <div className="main-content">
        <header className="report-header">
          <h1>WELCOME TO SABAH ROAD CARE</h1>
          <p className="subtitle">
            Report road damage to help improve our community
          </p>
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
                  Please upload 3 clear images from different angles (front
                  view, side view, and close-up)
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
                <p>
                  Click on the map or drag the marker to select the exact
                  location, then click "Confirm Location"
                </p>
              </div>
            </div>
          </div>

          {/* Location Section - ALWAYS SHOW MAP */}
          <FormSection title="🗺️ LOCATION" error={errors.location}>
            {/* Always display the embedded map */}
            <div className="embedded-map-container">
              <MapPicker
                onLocationSelect={handleMapInteraction}
                initialLocation={
                  formData.location.latitude && formData.location.longitude
                    ? {
                        lat: formData.location.latitude,
                        lng: formData.location.longitude,
                      }
                    : null
                }
                isVisible={true}
                embedded={true}
                interactiveMode={true} // New prop for interactive mode
              />
            </div>

            {/* Show pending location info when user has interacted with map */}
            {tempLocation && hasLocationChanged && (
              <div className="pending-location-info">
                <div className="pending-header">
                  <span className="pending-icon">📍</span>
                  <h4>Location Selected - Please Confirm</h4>
                </div>
                <div className="pending-details">
                  <div className="pending-address">
                    🛣️ {tempLocation.roadName || "Road name not available"}
                  </div>
                  <div className="pending-full-address">
                    {tempLocation.address}
                  </div>
                  <div className="pending-coordinates">
                    📍 {tempLocation.latitude.toFixed(6)},{" "}
                    {tempLocation.longitude.toFixed(6)}
                  </div>
                </div>
                <div className="pending-actions">
                  <button
                    type="button"
                    className="confirm-location-btn"
                    onClick={handleConfirmLocation}
                  >
                    ✅ Confirm Location
                  </button>
                  <button
                    type="button"
                    className="cancel-selection-btn"
                    onClick={() => {
                      setTempLocation(null);
                      setHasLocationChanged(false);
                      toast.info("Location selection cancelled.");
                    }}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Show confirmed location info */}
            {formData.location.latitude && !hasLocationChanged && (
              <div className="location-info confirmed">
                <div className="location-details">
                  <div className="location-primary">
                    <span className="location-icon">🛣️</span>
                    <span className="road-name">
                      {formData.location.roadName || "Road name not available"}
                    </span>
                    <span className="confirmed-badge">✅ Confirmed</span>
                  </div>
                  <div className="location-secondary">
                    <span className="full-address">
                      {formData.location.address}
                    </span>
                  </div>
                  <div className="location-coordinates">
                    <span className="coordinates-label">Coordinates:</span>
                    <span className="coordinates-value">
                      {formData.location.latitude.toFixed(6)},{" "}
                      {formData.location.longitude.toFixed(6)}
                    </span>
                  </div>
                </div>
                <div className="location-actions">
                  <button
                    type="button"
                    className="clear-location-btn"
                    onClick={handleClearLocation}
                  >
                    🗑️ Clear & Reselect
                  </button>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="map-instructions">
              <p>
                💡 <strong>Instructions:</strong> Click anywhere on the map or
                drag the marker to select a location, then click "Confirm
                Location" to proceed.
              </p>
            </div>
          </FormSection>

          {renderDuplicateInfo()}

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

          {/* Form Submit Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="save-draft-btn"
              onClick={handleSaveDraft}
            >
              Save Draft
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={
                isSubmitting ||
                hasLocationChanged ||
                (duplicateDetection && !duplicateDetection.canSubmit)
              }
            >
              {isSubmitting
                ? "Submitting..."
                : hasLocationChanged
                ? "Please Confirm Location First"
                : duplicateDetection && !duplicateDetection.canSubmit
                ? "Cannot Submit (Duplicate)"
                : "Submit Report"}
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
          <button className="view-all-btn" onClick={() => navigate("/history")}>
            View All Submissions
          </button>
        </div>

        <QuickAction />
      </div>
    </div>
  );
};

export default Homepage;
