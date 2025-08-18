import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for file uploads
});

const simulateNetworkDelay = (min = 500, max = 2000) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

const validateEnvironment = () => {
  const requiredEnvVars = ['VITE_API_BASE_URL'];
  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars);
  }

  if (DEMO_MODE) {
    console.info('🔧 API running in DEMO MODE - using simulated data');
  }
};

validateEnvironment();

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
    if (DEMO_MODE) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        data: {
          reportId: `RPT-${Date.now()}`,
          status: 'submitted',
          message: 'Report submitted successfully (Demo Mode)',
          severity: 'Medium',
          priority: 'High',
          estimatedRepairTime: '7-14 days'
        }
      };
    }

    return await api.post('/api/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        return progress;
      }
    });
  },

  // Get nearby reports for duplicate detection
  getNearbyReports: async (params) => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate some demo nearby reports
      const demoReports = Array.from({ length: Math.floor(Math.random() * 5) }, (_, i) => ({
        id: `demo-${i}`,
        location: {
          latitude: params.latitude + (Math.random() - 0.5) * 0.001,
          longitude: params.longitude + (Math.random() - 0.5) * 0.001
        },
        submissionTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        userId: `user-${Math.floor(Math.random() * 3) + 1}`,
        status: ['pending', 'reviewing', 'approved'][Math.floor(Math.random() * 3)]
      }));

      return { data: { reports: demoReports } };
    }

    const { latitude, longitude, radius = 100 } = params;
    return await api.get(`/api/reports/nearby`, {
      params: { lat: latitude, lng: longitude, radius }
    });
  },

  // Get user reports for ReportHistory
  getUserReports: async (filters = {}) => {
    if (DEMO_MODE) {
      await simulateNetworkDelay(800, 1500);
      await new Promise(resolve => setTimeout(resolve, 800));

      const demoUserReports = [
        {
          id: 1,
          documentNumber: "RPT-2024-001",
          title: "Large Pothole on Main Road",
          location: "Jalan Tuaran, Kota Kinabalu",
          district: "Kota Kinabalu",
          submissionDate: "2024-01-15",
          lastUpdated: "2024-01-20",
          status: "Completed",
          priority: "High",
          severity: "Severe",
          description: "Large pothole causing traffic disruption on main road",
          similarReports: 5,
          completionDate: "2024-01-20",
        },
        {
          id: 2,
          documentNumber: "RPT-2024-002",
          title: "Medium Pothole Near School",
          location: "Jalan Coastal Highway, Sandakan",
          district: "Sandakan",
          submissionDate: "2024-01-14",
          lastUpdated: "2024-01-18",
          status: "In Progress",
          priority: "Medium",
          severity: "Moderate",
          description: "Pothole near school area affecting student safety",
          similarReports: 3,
          completionDate: null,
        },
        {
          id: 3,
          documentNumber: "RPT-2024-003",
          title: "Small Pothole on Residential Street",
          location: "Jalan Penampang, Penampang",
          district: "Penampang",
          submissionDate: "2024-01-13",
          lastUpdated: "2024-01-16",
          status: "Approved",
          priority: "Low",
          severity: "Minor",
          description: "Small pothole on quiet residential street",
          similarReports: 1,
          completionDate: null,
        },
        {
          id: 4,
          documentNumber: "RPT-2024-004",
          title: "Critical Road Damage",
          location: "Jalan Beaufort, Beaufort",
          district: "Beaufort",
          submissionDate: "2024-01-12",
          lastUpdated: "2024-01-15",
          status: "Under Review",
          priority: "Critical",
          severity: "Severe",
          description: "Major road damage requiring immediate attention",
          similarReports: 8,
          completionDate: null,
        },
        {
          id: 5,
          documentNumber: "RPT-2024-005",
          title: "Multiple Small Potholes",
          location: "Jalan Ranau, Ranau",
          district: "Ranau",
          submissionDate: "2024-01-11",
          lastUpdated: "2024-01-14",
          status: "Rejected",
          priority: "Low",
          severity: "Minor",
          description: "Multiple small potholes reported in the area",
          similarReports: 2,
          completionDate: null,
        },
        {
          id: 6,
          documentNumber: "RPT-2024-006",
          title: "Highway Pothole Emergency",
          location: "Jalan Kota Kinabalu-Sandakan Highway",
          district: "Kota Kinabalu",
          submissionDate: "2024-01-10",
          lastUpdated: "2024-01-12",
          status: "Completed",
          priority: "Critical",
          severity: "Severe",
          description: "Emergency pothole repair on major highway",
          similarReports: 12,
          completionDate: "2024-01-12",
        },
        {
          id: 7,
          documentNumber: "RPT-2024-007",
          title: "Deep Pothole at Traffic Light",
          location: "Jalan Lintas, Kota Kinabalu",
          district: "Kota Kinabalu",
          submissionDate: "2024-01-09",
          lastUpdated: "2024-01-11",
          status: "In Progress",
          priority: "High",
          severity: "Severe",
          description:
            "Deep pothole at busy traffic intersection causing vehicle damage",
          similarReports: 7,
          completionDate: null,
        },
        {
          id: 8,
          documentNumber: "RPT-2024-008",
          title: "Road Surface Deterioration",
          location: "Jalan Semporna, Semporna",
          district: "Semporna",
          submissionDate: "2024-01-08",
          lastUpdated: "2024-01-10",
          status: "Approved",
          priority: "Medium",
          severity: "Moderate",
          description:
            "Multiple cracks and small potholes forming on main road",
          similarReports: 4,
          completionDate: null,
        },
        {
          id: 9,
          documentNumber: "RPT-2024-009",
          title: "Pothole Near Hospital",
          location: "Jalan Hospital, Tawau",
          district: "Tawau",
          submissionDate: "2024-01-07",
          lastUpdated: "2024-01-09",
          status: "Under Review",
          priority: "High",
          severity: "Moderate",
          description:
            "Pothole affecting ambulance access to hospital emergency entrance",
          similarReports: 6,
          completionDate: null,
        },
        {
          id: 10,
          documentNumber: "RPT-2024-010",
          title: "Minor Road Crack",
          location: "Jalan Kudat, Kudat",
          district: "Kudat",
          submissionDate: "2024-01-06",
          lastUpdated: "2024-01-08",
          status: "Completed",
          priority: "Low",
          severity: "Minor",
          description:
            "Small crack in road surface, preventive maintenance completed",
          similarReports: 1,
          completionDate: "2024-01-08",
        },
        {
          id: 11,
          documentNumber: "RPT-2024-011",
          title: "Large Pothole at Bus Stop",
          location: "Jalan Lahad Datu, Lahad Datu",
          district: "Lahad Datu",
          submissionDate: "2024-01-05",
          lastUpdated: "2024-01-07",
          status: "In Progress",
          priority: "Medium",
          severity: "Moderate",
          description:
            "Pothole at bus stop area affecting public transportation",
          similarReports: 3,
          completionDate: null,
        },
        {
          id: 12,
          documentNumber: "RPT-2024-012",
          title: "Critical Bridge Approach Damage",
          location: "Jalan Keningau Bridge, Keningau",
          district: "Keningau",
          submissionDate: "2024-01-04",
          lastUpdated: "2024-01-06",
          status: "Under Review",
          priority: "Critical",
          severity: "Severe",
          description:
            "Severe road damage at bridge approach requiring urgent attention",
          similarReports: 9,
          completionDate: null,
        },
      ];

      return { data: { reports: demoUserReports } };
    }

    const params = new URLSearchParams(filters);
    return await api.get(`/api/reports/user?${params}`);
  },

  // Get report details
  getReportDetails: async (reportId) => {
    return await api.get(`/api/reports/${reportId}`);
  },
  // Dashboard specific endpoints
  getDashboardStats: async (filters = {}) => {

    if (DEMO_MODE) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate dynamic demo data based on filters
      const baseStats = {
        totalCases: 45 + Math.floor(Math.random() * 20),
        underReview: 12 + Math.floor(Math.random() * 8),
        approved: 15 + Math.floor(Math.random() * 10),
        inProgress: 8 + Math.floor(Math.random() * 7),
        completed: 6 + Math.floor(Math.random() * 4),
        rejected: 4 + Math.floor(Math.random() * 3),
      };

      return { data: baseStats };
    }


    const params = new URLSearchParams(filters);
    return await api.get(`/api/dashboard/stats?${params}`);
  },

  getChartsData: async (filters = {}) => {

    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 800));

      const demoChartsData = {
        pieData: [
          { name: "Low", value: 25, color: "#82ca9d" },
          { name: "Medium", value: 35, color: "#ffc658" },
          { name: "High", value: 25, color: "#ff7c7c" },
          { name: "Critical", value: 15, color: "#ff4444" },
        ],
        trendData: [
          { month: "Jan", cases: 20 },
          { month: "Feb", cases: 35 },
          { month: "Mar", cases: 45 },
          { month: "Apr", cases: 50 },
          { month: "May", cases: 60 },
          { month: "Jun", cases: 65 },
        ],
      };

      return { data: demoChartsData };
    }

    const params = new URLSearchParams(filters);
    return await api.get(`/api/dashboard/charts?${params}`);
  },

  exportDashboard: async (format = 'pdf') => {
    const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

    if (DEMO_MODE) {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create a simple CSV for demo
      const csvContent = `Report Type,Count
Total Cases,45
Under Review,12
Approved,15
In Progress,8
Completed,6
Rejected,4`;

      const blob = new Blob([csvContent], { type: 'text/csv' });
      return { data: blob };
    }

    return await api.get(`/api/dashboard/export?format=${format}`, {
      responseType: 'blob'
    });
  }
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