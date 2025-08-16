import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for file uploads
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const reportAPI = {
  // Submit pothole report
  submitReport: async (formData) => {
    return await api.post('/api/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        // You can emit progress events here
        return progress;
      }
    });
  },

  // Get nearby reports for duplicate detection
  getNearbyReports: async (params) => {
    const { latitude, longitude, radius = 100 } = params;
    return await api.get(`/api/reports/nearby`, {
      params: {
        lat: latitude,
        lng: longitude,
        radius: radius
      }
    });
  },

  // Get user reports for ReportHistory
  getUserReports: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/api/reports/user?${params}`);
  },

  // Get report details
  getReportDetails: async (reportId) => {
    return await api.get(`/api/reports/${reportId}`);
  },
};

export const userAPI = {
  // Update user profile
  updateProfile: async (formData) => {
    return await api.put('/api/user/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Delete user account
  deleteAccount: async () => {
    return await api.delete('/api/user/account');
  },

  // Change password
  changePassword: async (passwordData) => {
    return await api.put('/api/user/password', passwordData);
  },

  // Upload profile image
  uploadProfileImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    return await api.post('/api/user/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default api;