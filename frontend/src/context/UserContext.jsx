import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
const DEFAULT_DEMO_USER = {
  id: "demo-user-001",
  name: "Demo User",
  email: "demo@sabahroadcare.com",
  token: "demo-token",
  demoMode: true,
  photoURL: null,
  createdAt: new Date().toISOString(),
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Simple login function (for demo purposes)
  const login = (userData) => {
    const nextUser = userData || {
      ...(DEMO_MODE ? DEFAULT_DEMO_USER : {}),
      createdAt: new Date().toISOString(),
    };

    setUser(nextUser);
    setIsLoggedIn(Boolean(nextUser?.token));
    localStorage.setItem("user", JSON.stringify(nextUser));
    if (nextUser?.token) {
      localStorage.setItem("token", nextUser.token);
      localStorage.setItem("authToken", nextUser.token);
    }
  };

  // Update user profile
  const updateUser = (updatedData) => {
    const updatedUser = {
      ...user,
      ...updatedData,
      profileImage:
        updatedData.profileImage ||
        updatedData.profile_picture ||
        user.profileImage,
      profile_picture:
        updatedData.profile_picture ||
        updatedData.profileImage ||
        user.profile_picture,
    };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // Simple logout (optional for capstone)
  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
  };
  // Load user data on app start
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        const hasToken = Boolean(parsedUser?.token);
        const isStaleDemoToken = !DEMO_MODE && parsedUser?.token === "demo-token";
        if (hasToken && !isStaleDemoToken) {
          setUser(parsedUser);
          setIsLoggedIn(true);
          localStorage.setItem("token", parsedUser.token);
          localStorage.setItem("authToken", parsedUser.token);
        } else {
          setUser(null);
          setIsLoggedIn(false);
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Error loading saved user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        setUser(null);
        setIsLoggedIn(false);
      }
    } else if (DEMO_MODE) {
      const freshUser = {
        ...DEFAULT_DEMO_USER,
        createdAt: new Date().toISOString(),
      };
      setUser(freshUser);
      setIsLoggedIn(true);
      localStorage.setItem("user", JSON.stringify(freshUser));
      localStorage.setItem("token", freshUser.token);
      localStorage.setItem("authToken", freshUser.token);
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
  }, []);

  const value = {
    user,
    isLoggedIn,
    isAuthenticated: isLoggedIn,
    login,
    logout,
    updateUser,
    setUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export { UserContext };
