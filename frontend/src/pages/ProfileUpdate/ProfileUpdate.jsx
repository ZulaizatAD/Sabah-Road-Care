import React, { useState, useRef, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./ProfileUpdate.css";
import {
  getProfile,
  uploadProfilePicture,
  deleteProfilePicture,
} from "../../services/apiPP"; // Adjust the import path as needed

const ProfileUpdate = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { user, updateUser, logout } = useUser();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [emailChanged, setEmailChanged] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fileInputRef = useRef(null);

  // Load user data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getProfile();
        setFormData((prev) => ({
          ...prev,
          name: profileData.full_name || "",
          email: profileData.email || "",
        }));
        if (profileData.profile_picture) {
          setProfileImage(profileData.profile_picture);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to load profile data.");
      }
    };

    fetchProfile();
  }, [user]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Check if email changed
    if (field === "email" && value !== formData.email) {
      setEmailChanged(true);
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Name validation - required
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    }

    // Email validation - required
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation (only if password is provided)
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)
      ) {
        newErrors.password =
          "Password must contain uppercase, lowercase, number, and special character";
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Remove profile image
  const handleRemoveImage = async () => {
    try {
      await deleteProfilePicture();
      setProfileImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.info("Profile picture removed");
    } catch (error) {
      console.error("Failed to delete profile picture:", error);
      toast.error("Failed to remove profile picture.");
    }
  };

  // Handle Submission Form
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    setIsLoading(true);

    try {
      const updateData = new FormData();
      updateData.append("name", formData.name);
      updateData.append("email", formData.email);

      if (formData.password) {
        updateData.append("password", formData.password);
      }

      // Add profile image if changed
      if (profileImageFile) {
        await uploadProfilePicture(profileImageFile);
      }

      // Assuming you have a function to update the user profile
      // const response = await userAPI.updateProfile(updateData);

      // Update user context
      // updateUser(response.data.user);

      setShowSuccess(true);

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Update error:", error);

      if (error.response?.status === 400) {
        toast.error("Invalid data. Please check your inputs.");
      } else if (error.response?.status === 409) {
        toast.error("Email already exists. Please use a different email.");
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);

      // Call API to delete account
      // await userAPI.deleteAccount();

      // Clear user data
      logout();

      // Clear local storage
      localStorage.clear();

      toast.success("Account deleted successfully");

      // Redirect to login
      navigate("/");
    } catch (error) {
      console.error("Delete error:", error);

      if (error.response?.status === 403) {
        toast.error("Cannot delete account. You have pending reports.");
      } else {
        toast.error("Failed to delete account. Please try again.");
      }
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  // Add image compression utility
  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, "image/jpeg", quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Enhanced image handler
  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      try {
        // Compress image
        const compressedFile = await compressImage(file);

        // Create preview
        const imageUrl = URL.createObjectURL(compressedFile);
        setProfileImage(imageUrl);

        // Store compressed file for upload
        setProfileImageFile(compressedFile);

        toast.success("Profile picture updated!");
      } catch (error) {
        toast.error("Failed to process image");
      }
    }
  };

  return (
    <div className="profile-updater-container">
      <div className="profile-updater-glass">
        <form onSubmit={handleUpdate} className="profile-form">
          <div className="uploader-section">
            <div
              className="image-uploader"
              onClick={handleUploadClick}
              role="button"
              aria-label="Upload profile picture"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleUploadClick();
                }
              }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile Preview"
                  className="profile-preview-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.parentElement.innerHTML = "<span>Upload</span>";
                  }}
                />
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">📷</span>
                  <span className="upload-text">Upload Photo</span>
                </div>
              )}
            </div>
            {profileImage && (
              <button
                type="button"
                className="remove-image-btn"
                onClick={handleRemoveImage}
                aria-label="Remove profile picture"
              >
                Remove Photo
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: "none" }}
              accept="image/*"
              aria-label="Profile picture upload"
            />
          </div>

          {/* Form Fields */}
          <div className="form-fields">
            {/* Name Field */}
            <div className={`input-group ${errors.name ? "error" : ""}`}>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                aria-required="true"
                disabled={isLoading}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>
            {/* Email Field */}
            <div className={`input-group ${errors.email ? "error" : ""}`}>
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                aria-required="true"
                disabled={isLoading}
                placeholder="Enter your email address"
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
              {emailChanged && (
                <div className="email-warning">
                  ⚠️ Changing your email may require re-verification
                </div>
              )}
            </div>

            {/* Password Section */}
            <div className="password-section">
              <div
                className="section-header"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                role="button"
                tabIndex={0}
                aria-expanded={showPasswordSection}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setShowPasswordSection(!showPasswordSection);
                  }
                }}
              >
                <h3 className="section-title">Change Password</h3>
                <span
                  className={`section-toggle ${
                    showPasswordSection ? "expanded" : ""
                  }`}
                >
                  ▼
                </span>
              </div>

              {/* New Password Field */}
              <div
                className={`password-fields ${
                  showPasswordSection ? "expanded" : "collapsed"
                }`}
              >
                <div
                  className={`input-group password-group ${
                    errors.password ? "error" : ""
                  }`}
                >
                  <label htmlFor="password">New Password</label>
                  <div className="password-input-container">
                    <input
                      id="password"
                      type={passwordVisible ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Enter new password (optional)"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={togglePasswordVisibility}
                      aria-label={
                        passwordVisible ? "Hide password" : "Show password"
                      }
                      disabled={isLoading}
                    >
                      {passwordVisible ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="error-message">{errors.password}</span>
                  )}
                </div>

                {/* Confirm Password Field */}
                {formData.password && (
                  <div
                    className={`input-group password-group ${
                      errors.confirmPassword ? "error" : ""
                    }`}
                  >
                    <label htmlFor="confirmPassword">
                      Confirm New Password
                    </label>
                    <div className="password-input-container">
                      <input
                        id="confirmPassword"
                        type={confirmPasswordVisible ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        placeholder="Confirm your new password"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={toggleConfirmPasswordVisibility}
                        aria-label={
                          confirmPasswordVisible
                            ? "Hide password"
                            : "Show password"
                        }
                        disabled={isLoading}
                      >
                        {confirmPasswordVisible ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <span className="error-message">
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              type="submit"
              className={`update-button ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Updating...
                </>
              ) : (
                "UPDATE PROFILE"
              )}
            </button>

            <button
              type="button"
              className="delete-account-btn"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLoading}
            >
              Delete Account
            </button>
          </div>
        </form>
      </div>

      {/* Success Message */}
      {showSuccess && <SuccessMessage onClose={() => setShowSuccess(false)} />}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteConfirm(false)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

// Success Message Component
const SuccessMessage = ({ onClose }) => (
  <div className="success-message">
    <div className="success-content">
      <span className="success-icon">✓</span>
      <p>Profile updated successfully!</p>
    </div>
    <button
      onClick={onClose}
      className="close-button"
      aria-label="Close notification"
    >
      &times;
    </button>
  </div>
);

// Delete Confirmation Modal Component
const DeleteConfirmModal = ({ onConfirm, onCancel, isLoading }) => (
  <div className="modal-overlay">
    <div className="delete-confirm-modal">
      <div className="modal-header">
        <h3>Delete Account</h3>
        <button
          className="modal-close-btn"
          onClick={onCancel}
          disabled={isLoading}
        >
          ×
        </button>
      </div>

      <div className="modal-content">
        <div className="warning-icon">⚠️</div>
        <p className="warning-text">
          Are you sure you want to delete your account?
        </p>
        <p className="warning-subtext">
          This action cannot be undone. All your reports and data will be
          permanently deleted.
        </p>

        <div className="consequences-list">
          <h4>This will permanently:</h4>
          <ul>
            <li>Delete all your submitted reports</li>
            <li>Remove your profile information</li>
            <li>Cancel any pending reports</li>
            <li>Revoke access to your account</li>
          </ul>
        </div>
      </div>

      <div className="modal-actions">
        <button className="cancel-btn" onClick={onCancel} disabled={isLoading}>
          Cancel
        </button>
        <button
          className={`confirm-delete-btn ${isLoading ? "loading" : ""}`}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner"></span>
              Deleting...
            </>
          ) : (
            "Delete Account"
          )}
        </button>
      </div>
    </div>
  </div>
);

export default ProfileUpdate;
