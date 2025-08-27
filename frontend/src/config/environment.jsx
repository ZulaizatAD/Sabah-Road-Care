const config = {
  // Google Maps Configuration
  googleMaps: {
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["geometry"],
    version: "weekly",
  },

  // Firebase Configuration (for later use)
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  },

  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  },

  // App Configuration
  app: {
    version: import.meta.env.VITE_APP_VERSION || "1.0.0",
    environment: import.meta.env.VITE_ENVIRONMENT || "development",
  },

  // Default locations for Sabah
  defaultLocation: {
    lat: 5.9804,
    lng: 116.0735,
    name: "Kota Kinabalu, Sabah",
  },
};

// Validation function
export const validateConfig = () => {
  const requiredKeys = ["VITE_GOOGLE_MAPS_API_KEY"];

  const missingKeys = requiredKeys.filter((key) => !import.meta.env[key]);

  if (missingKeys.length > 0) {
    console.error("Missing required environment variables:", missingKeys);
    return false;
  }

  return true;
};

export default config;
