import axios from "axios";

/**
 * Upload 3 pothole photos for a report
 * @param {number} reportId - ID of the report
 * @param {File} topViewFile - File object for top view image
 * @param {File} farFile - File object for far image
 * @param {File} closeUpFile - File object for close-up image
 * @param {string} token - JWT token if your backend requires authentication
 * @returns {Promise<Array>} - List of uploaded photo objects
 */
export const uploadPotholePhotos = async (
  reportId,
  topViewFile,
  farFile,
  closeUpFile,
  token
) => {
  try {
    const formData = new FormData();

    // Append the required files (must match backend parameter names!)
    formData.append("top_view", topViewFile);
    formData.append("far", farFile);
    formData.append("close_up", closeUpFile);

    const response = await axios.post(
      `/api/photos/upload/${reportId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    return response.data; // This will be the list of uploaded photo objects
  } catch (error) {
    console.error("Error uploading pothole photos:", error);
    throw error;
  }
};
