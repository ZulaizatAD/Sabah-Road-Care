import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveStoredUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getProfile = async () => {
  if (DEMO_MODE) {
    const user = getStoredUser();
    return {
      full_name: user?.name || user?.full_name || "Demo User",
      email: user?.email || "demo@sabahroadcare.com",
      profile_picture: user?.profile_picture || user?.profileImage || null,
    };
  }

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

export const uploadProfilePicture = async (file) => {
  if (DEMO_MODE) {
    const existing = getStoredUser() || {};
    const previewUrl = URL.createObjectURL(file);
    saveStoredUser({
      ...existing,
      profile_picture: previewUrl,
      profileImage: previewUrl,
    });
    return { profile_picture: previewUrl };
  }

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
    console.error(
      "Error uploading profile picture:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deleteProfilePicture = async () => {
  if (DEMO_MODE) {
    const existing = getStoredUser() || {};
    saveStoredUser({
      ...existing,
      profile_picture: null,
      profileImage: null,
    });
    return { message: "Profile picture removed" };
  }

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
