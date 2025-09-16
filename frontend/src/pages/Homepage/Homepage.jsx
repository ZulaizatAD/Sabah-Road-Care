import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "../../context/UserContext";
import FormSection from "./Section/FormSection";
import PhotoUpload from "./Section/PhotoUpload";
import QuickAction from "../../components/QuickAction/QuickAction";
import MapPicker from "../../components/MapPicker/MapPicker";
import { useHomepage } from "./useHomepage";
import assets from "../../assets/assets";
import "./Homepage.css";
const Homepage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const token = user?.token;

  // ✅ Use all needed functions from hook
  const { addReport, checkForDuplicates, reports, loading, error } =
    useHomepage(token);

  // Map interaction states
  const [tempLocation, setTempLocation] = useState(null);
  const [hasLocationChanged, setHasLocationChanged] = useState(false);

  // ✅ Add duplicate preview state
  const [duplicatePreview, setDuplicatePreview] = useState(null);

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

  // Form validation errors & submission state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sabah districts list
  const sabahDistricts = [
    { value: "", label: "Select District" },
    { value: "Kota Kinabalu", label: "Kota Kinabalu" },
    { value: "Sandakan", label: "Sandakan" },
    { value: "Tawau", label: "Tawau" },
    { value: "Penampang", label: "Penampang" },
    { value: "Putatan", label: "Putatan" },
    { value: "Papar", label: "Papar" },
    { value: "Tuaran", label: "Tuaran" },
    { value: "Kudat", label: "Kudat" },
    { value: "Beaufort", label: "Beaufort" },
    { value: "Ranau", label: "Ranau" },
    { value: "Kota Belud", label: "Kota Belud" },
    { value: "Keningau", label: "Keningau" },
    { value: "Semporna", label: "Semporna" },
    { value: "Kuala Penyu", label: "Kuala Penyu" },
    { value: "Lahad Datu", label: "Lahad Datu" },
    { value: "Others", label: "OTHERS" },
  ];

  // ✅ Add duplicate check useEffect
  useEffect(() => {
    if (!formData.location.latitude || !formData.location.longitude) {
      setDuplicatePreview(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      const preview = await checkForDuplicates(
        formData.location.latitude,
        formData.location.longitude
      );
      setDuplicatePreview(preview);

      // Show user-friendly info
      if (preview?.similar_reports_count > 0) {
        toast.info(
          `📍 Found ${preview.similar_reports_count} similar reports nearby. ` +
            `Your report will be prioritized as ${preview.calculated_priority}!`,
          { autoClose: 4000 }
        );
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [
    formData.location.latitude,
    formData.location.longitude,
    checkForDuplicates,
  ]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

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

  // Handle map interaction
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

    if (!formData.photos || !Array.isArray(formData.photos)) {
      newErrors.photos = "Photos array not initialized";
      return false;
    }

    // const uploadedPhotos = formData.photos.filter(
    //   (photo) => photo !== null && photo !== undefined
    // );
    // if (uploadedPhotos.length < 3) {
    //   newErrors.photos = "Please upload all 3 photos";
    // }

    if (!formData.location.latitude || !formData.location.longitude) {
      newErrors.location = "Please select and confirm your location on the map";
    }

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

  // ✅ Fixed Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.id) {
      toast.error("You must be logged in to submit a report.");
      navigate("/");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    if (hasLocationChanged) {
      toast.warning(
        "Please confirm your location selection before submitting."
      );
      return;
    }

    console.log("🔍 Submitting with data:", {
      district: formData.district,
      latitude: formData.location.latitude,
      longitude: formData.location.longitude,
      address: formData.location.address,
    });

    // ✅ Check if blocked by duplicates
    if (duplicatePreview?.is_blocked) {
      toast.error(duplicatePreview.summary_message);
      return;
    }
    console.log("🔍 Current duplicatePreview:", duplicatePreview);

    setIsSubmitting(true);
    const loadingToast = toast.loading("Submitting your report...");

    try {
      // ✅ Create FormData exactly as backend expects
      const submitData = new FormData();
      submitData.append("district", formData.district);
      submitData.append("latitude", formData.location.latitude);
      submitData.append("longitude", formData.location.longitude);
      submitData.append("address", formData.location.address);
      submitData.append("remarks", formData.description || "");
      submitData.append("photo_top", formData.photos[0]);
      submitData.append("photo_far", formData.photos[1]);
      submitData.append("photo_close", formData.photos[2]);

      // ✅ ADD THIS DEBUG:
      console.log("🔍 FormData contents:");
      for (let [key, value] of submitData.entries()) {
        console.log(`  ${key}:`, value);
      }

      console.log("🔍 Photos array:", formData.photos);
      console.log(
        "🔍 Photo types:",
        formData.photos.map((p) => (p ? typeof p : "null"))
      );

      const response = await addReport(submitData);

      toast.dismiss(loadingToast);

      // ✅ Show success with backend's response
      let successMessage = `✅ Report submitted successfully!\nReport ID: ${response.case_id}`;
      if (response.similar_reports_found > 0) {
        successMessage += `\n\n🚀 Priority: ${response.priority}`;
        successMessage += `\n📊 ${response.similar_reports_found} similar reports found`;
      }

      toast.success(successMessage, { autoClose: 6000 });

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

      setTimeout(() => navigate("/history"), 2000);
    } catch (error) {
      toast.dismiss(loadingToast);

      if (error.response?.status === 409) {
        // ✅ Handle duplicate blocking
        const errorDetail = error.response.data.detail;
        toast.error(
          `🚫 ${errorDetail.message}\n\n` +
            `Previous report: ${errorDetail.previous_report}\n` +
            `Please wait ${errorDetail.wait_hours} more hours.`,
          { autoClose: 8000 }
        );
      } else if (error.response?.status === 413) {
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
                <h3 className="step-title">Take Photos - Quick Guide</h3>
                <span className="step-toggle">▼</span>
              </div>
              <div className="step-content">
                <div className="photo-guide-content">
                  <p className="guide-intro">
                    Follow these 3 shots assist with our results:
                  </p>

                  <div className="guide-shots">
                    <div className="shot-guide">
                      <div className="shot-number">1</div>
                      <div className="shot-info">
                        <h4>Far Shot (Context)</h4>
                        <p>
                          Step back 3-4 meters to show the pothole in road
                          context
                        </p>
                        <div className="shot-tips">
                          <span>✓ Include road lanes & surroundings</span>
                          <span>✓ Show traffic environment</span>
                        </div>
                      </div>
                    </div>

                    <div className="shot-guide">
                      <div className="shot-number">2</div>
                      <div className="shot-info">
                        <h4>Top View (Size Reference)</h4>
                        <p>
                          Stand above pothole and include your foot for scale
                        </p>
                        <div className="shot-tips">
                          <span>✓ Direct overhead angle</span>
                          <span>✓ Add size reference object</span>
                        </div>
                      </div>
                    </div>

                    <div className="shot-guide">
                      <div className="shot-number">3</div>
                      <div className="shot-info">
                        <h4>Close-up (Detail)</h4>
                        <p>
                          Focus on edges and depth for detailed damage analysis
                        </p>
                        <div className="shot-tips">
                          <span>✓ Show damage detail clearly</span>
                          <span>✓ Use flash if lighting is poor</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="safety-note">
                    <span>
                      Safety First: Don't block traffic while taking photos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Photos Section */}
          <FormSection
            title="PHOTOS (Required: 3 angles)"
            error={errors.photos}
          >
            <div className="photo-grid">
              <PhotoUpload
                label="Angle 1: Far Shot (Context)"
                guideline="Step back 3-4 meters to show the pothole in road
                          context"
                onUpload={(file) => handlePhotoUpload(0, file)}
                photo={formData.photos[0]}
              />
              <PhotoUpload
                label="Angle 2: Top View (Size Reference)"
                guideline="Stand above pothole and include your foot for scale"
                onUpload={(file) => handlePhotoUpload(1, file)}
                photo={formData.photos[1]}
              />
              <PhotoUpload
                label="Angle 3: Close-up (Detail)"
                guideline="Focus on edges and depth for detailed damage analysis"
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
          <FormSection title="LOCATION" error={errors.location}>
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
                  <h4>Location Selected - Please Confirm</h4>
                </div>
                <div className="pending-details">
                  <div className="pending-address">
                    {tempLocation.roadName || "Road name not available"}
                  </div>
                  <div className="pending-full-address">
                    {tempLocation.address}
                  </div>
                  <div className="pending-coordinates">
                    {tempLocation.latitude.toFixed(6)},{" "}
                    {tempLocation.longitude.toFixed(6)}
                  </div>
                </div>
                <div className="pending-actions">
                  <button
                    type="button"
                    className="confirm-location-btn"
                    onClick={handleConfirmLocation}
                  >
                    Confirm Location
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
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Show confirmed location info */}
            {formData.location.latitude && !hasLocationChanged && (
              <div className="location-info confirmed">
                <div className="location-details">
                  <div className="location-primary">
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
                    Clear & Reselect
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
          <FormSection title="DISTRICT" error={errors.district}>
            <select
              value={formData.district}
              onChange={(e) => handleInputChange("district", e.target.value)}
              className={errors.district ? "error" : "district-select"}
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
          <FormSection title="REMARKS / DESCRIPTION" error={errors.description}>
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
                duplicatePreview?.is_blocked
              }
            >
              {isSubmitting
                ? "Submitting..."
                : hasLocationChanged
                ? "Please Confirm Location First"
                : duplicatePreview?.is_blocked
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
            {reports.map((submission, index) => (
              <div key={submission.case_id} className="submission-item">
                <div className="submission-header">
                  <span className="document-number">#{submission.case_id}</span>
                  <span
                    className={`status-badge ${submission.status.toLowerCase()}`}
                  >
                    {submission.status}
                  </span>
                </div>
                <h4 className="submission-title">
                  {submission.location?.address || "Location not specified"}
                </h4>
                <div className="submission-meta">
                  <span className="submission-date">
                    {submission.date_created}
                  </span>
                </div>
                <div className="similar-reports">
                  <span className="similar-count">
                    {submission.similar_reports_count} Similar Report
                    {submission.similar_reports_count !== 1 ? "s" : ""}{" "}
                    submitted
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
