const config = {
  demo: {
    enabled: import.meta.env.VITE_DEMO_MODE === "true",
  },

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
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  },

  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000
  },

  // App Configuration
  app: {
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_ENVIRONMENT || 'development'
  },

  // Default locations for Sabah
  defaultLocation: {
    lat: 5.9804,
    lng: 116.0735,
    name: "Kota Kinabalu, Sabah",
  },
};

let warnedMissingGoogleMapsKey = false;

// Validation function
export const validateConfig = () => {
  if (config.demo.enabled) {
    return true;
  }

  // Google Maps key is optional for backend integration mode.
  // MapPicker has a fallback flow when this key is missing.
  if (!config.googleMaps.apiKey && !warnedMissingGoogleMapsKey) {
    warnedMissingGoogleMapsKey = true;
    console.warn(
      "VITE_GOOGLE_MAPS_API_KEY is not set. Map features will run in fallback mode."
    );
  }

  return true;
};

export default config;
