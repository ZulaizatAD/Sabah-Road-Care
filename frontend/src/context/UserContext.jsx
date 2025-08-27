import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: "demo-user-001",
    name: "Demo User",
    email: "demo@sabahroadcare.com",
    photoURL: null,
    createdAt: new Date().toISOString(),
  });
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Simple login function (for demo purposes)
  const login = (userData) => {
    setUser(
      userData || {
        id: "demo-user-001",
        name: "Demo User",
        email: "demo@sabahroadcare.com",
        photoURL: null,
        createdAt: new Date().toISOString(),
      }
    );
    setIsLoggedIn(true);
    localStorage.setItem("user", JSON.stringify(user));
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
  };
  // Load user data on app start
  React.useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Error loading saved user:", error);
        // Fallback to default user
        login();
      }
    } else {
      // Auto-login with default user for capstone
      login();
    }
  }, []);

  const value = {
    user,
    isLoggedIn,
    login,
    logout,
    updateUser,
    setUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export { UserContext };
