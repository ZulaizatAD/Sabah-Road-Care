import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://localhost:8000", // Replace with your FastAPI server URL
});

// Add a request interceptor to attach tokens dynamically if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // Adjust based on where you store the token
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
    console.error("Error fetching profile:", error);
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
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
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
    console.error("Error deleting profile picture:", error);
    throw error;
  }
};
