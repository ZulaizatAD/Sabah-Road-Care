import axios from "axios";

const API_URL = "http://localhost:8000"; // change if backend runs elsewhere

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Sign Up ---
export const signUp = async (
  email,
  fullName,
  password,
  confirmPassword,
  profilePicture = null
) => {
  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const response = await api.post("api/users/register", {
    email,
    full_name: fullName,
    password,
    profile_picture: profilePicture,
  });

  return response.data;
};

// --- Sign In ---
export const signIn = async (email, password) => {
  // FastAPI OAuth2 expects "username" not "email"
  const params = new URLSearchParams();
  params.append("username", email);
  params.append("password", password);

  const response = await api.post("api/users/login", params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  // Save token locally
  localStorage.setItem("token", response.data.access_token);

  return response.data;
};

// --- Get Current User ---
export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found. Please sign in.");

  const response = await api.get("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// --- Logout ---
export const logout = () => {
  localStorage.removeItem("token");
};

// --- Get My Profile ---
export const getMyProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found. Please sign in.");

  const response = await api.get("/profile/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// --- Upload Profile Picture ---
export const uploadProfilePicture = async (file) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found. Please sign in.");

  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/profile/picture", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data; // { profile_picture: "url" }
};

// --- Delete Profile Picture ---
export const deleteProfilePicture = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found. Please sign in.");

  const response = await api.delete("/profile/picture", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data; // { message: "...deleted successfully" }
};

// --- Update Profile ---
export const updateProfile = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found. Please sign in.");

  const response = await api.put("api/users/me", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data; // updated user object
};
