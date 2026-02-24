import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("authToken");

const DEMO_USER = {
  id: "demo-user-001",
  full_name: "Demo User",
  email: "demo@sabahroadcare.com",
  profile_picture: null,
};

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveDemoToken = (token = "demo-token") => {
  localStorage.setItem("token", token);
  localStorage.setItem("authToken", token);
};

const saveUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

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

  if (DEMO_MODE) {
    return {
      message: "Demo account created successfully",
      user: {
        ...DEMO_USER,
        id: `demo-user-${Date.now()}`,
        email,
        full_name: fullName || DEMO_USER.full_name,
        profile_picture: profilePicture,
      },
    };
  }

  const response = await api.post("/api/users/register", {
    email,
    full_name: fullName,
    password,
    profile_picture: profilePicture,
  });

  return response.data;
};

export const signIn = async (email, password) => {
  if (DEMO_MODE) {
    const user = {
      ...DEMO_USER,
      email: email || DEMO_USER.email,
      full_name: email?.split("@")?.[0] || DEMO_USER.full_name,
    };
    const access_token = "demo-token";
    saveDemoToken(access_token);
    saveUser({
      id: user.id,
      name: user.full_name,
      full_name: user.full_name,
      email: user.email,
      profile_picture: user.profile_picture,
      token: access_token,
      demoMode: true,
    });
    return { access_token, user };
  }

  const params = new URLSearchParams();
  params.append("username", email);
  params.append("password", password);

  const response = await api.post("/api/users/login", params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const accessToken = response.data.access_token;
  localStorage.setItem("token", accessToken);
  localStorage.setItem("authToken", accessToken);

  let profile = null;
  try {
    const profileResponse = await api.get("/profile/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    profile = profileResponse.data;
  } catch (error) {
    console.warn("Could not fetch profile after login:", error?.message);
  }

  return {
    ...response.data,
    user: profile
      ? {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          profile_picture: profile.profile_picture,
        }
      : {
          id: null,
          full_name: email?.split("@")?.[0] || "User",
          email,
          profile_picture: null,
        },
  };
};

export const getCurrentUser = async () => {
  if (DEMO_MODE) {
    const user = getStoredUser();
    if (!user) {
      throw new Error("No user found. Please sign in.");
    }
    return {
      id: user.id || DEMO_USER.id,
      full_name: user.name || user.full_name || DEMO_USER.full_name,
      email: user.email || DEMO_USER.email,
      profile_picture: user.profile_picture || null,
    };
  }

  const token = getToken();
  if (!token) throw new Error("No token found. Please sign in.");

  const response = await api.get("/profile/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
};

export const getMyProfile = async () => {
  if (DEMO_MODE) {
    return getCurrentUser();
  }

  const token = getToken();
  if (!token) throw new Error("No token found. Please sign in.");

  const response = await api.get("/profile/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

export const uploadProfilePicture = async (file) => {
  if (DEMO_MODE) {
    const previewUrl = URL.createObjectURL(file);
    const existing = getStoredUser() || {};
    saveUser({
      ...existing,
      profile_picture: previewUrl,
      profileImage: previewUrl,
    });
    return { profile_picture: previewUrl };
  }

  const token = getToken();
  if (!token) throw new Error("No token found. Please sign in.");

  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/profile/picture", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deleteProfilePicture = async () => {
  if (DEMO_MODE) {
    const existing = getStoredUser() || {};
    saveUser({
      ...existing,
      profile_picture: null,
      profileImage: null,
    });
    return { message: "Profile picture deleted successfully" };
  }

  const token = getToken();
  if (!token) throw new Error("No token found. Please sign in.");

  const response = await api.delete("/profile/picture", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

export const updateProfile = async (data) => {
  if (DEMO_MODE) {
    const existing = getStoredUser() || {};
    const updatedUser = {
      ...existing,
      id: existing.id || DEMO_USER.id,
      name: data.full_name ?? existing.name ?? DEMO_USER.full_name,
      full_name: data.full_name ?? existing.full_name ?? DEMO_USER.full_name,
      email: data.email ?? existing.email ?? DEMO_USER.email,
      profile_picture: existing.profile_picture ?? null,
    };
    saveUser(updatedUser);
    return updatedUser;
  }

  const token = getToken();
  if (!token) throw new Error("No token found. Please sign in.");

  const response = await api.put("/api/users/me", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};
