import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://localhost:8000", // Replace with your FastAPI server URL
});

// Add a request interceptor to attach tokens dynamically if needed
api.interceptors.request.use(
  (config) => {
    // Adjust this key based on where you store your token: "authToken", "userToken", etc.
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Get the current user's profile
 * @returns {Promise<Object>} The user's profile data
 */
export const getProfile = async () => {
  try {
    const response = await api.get("/profile/me");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching profile:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Upload a new profile picture
 * @param {File} file - The file to upload
 * @returns {Promise<Object>} The response data containing the new profile picture URL
 */
export const uploadProfilePicture = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/profile/picture", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        // Authorization header is already auto-attached by interceptor
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error uploading profile picture:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Delete the current user's profile picture
 * @returns {Promise<Object>} The response data confirming deletion
 */
export const deleteProfilePicture = async () => {
  try {
    const response = await api.delete("/profile/picture");
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting profile picture:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export default api;
