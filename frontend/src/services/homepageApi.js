import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
const DEMO_REPORTS_KEY = "src_demo_reports_v1";

const api = axios.create({
  baseURL: API_BASE_URL,
});

const readDemoReports = () => {
  try {
    const raw = localStorage.getItem(DEMO_REPORTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeDemoReports = (reports) => {
  localStorage.setItem(DEMO_REPORTS_KEY, JSON.stringify(reports));
};

const formDataToObject = (formData) => {
  const obj = {};
  formData.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};

const createDemoReportFromFormData = (formData) => {
  const payload = formDataToObject(formData);
  const now = new Date().toISOString();
  const numericLatitude = Number(payload.latitude);
  const numericLongitude = Number(payload.longitude);
  const caseId = payload.case_id || `SRC_${Date.now()}`;

  return {
    case_id: caseId,
    user_id: payload.user_id || "demo-user-001",
    email: payload.email || "demo@sabahroadcare.com",
    district: payload.district || "kota-kinabalu",
    status: payload.status || "Under Review",
    severity: payload.severity || "Low",
    priority: payload.priority || "Medium",
    description: payload.description || "",
    latitude: Number.isFinite(numericLatitude) ? numericLatitude : 5.9804,
    longitude: Number.isFinite(numericLongitude) ? numericLongitude : 116.0735,
    date_created: now,
    submissionTime: now,
    location: {
      latitude: Number.isFinite(numericLatitude) ? numericLatitude : 5.9804,
      longitude: Number.isFinite(numericLongitude) ? numericLongitude : 116.0735,
      address: payload.address || "Kota Kinabalu, Sabah",
    },
  };
};

export const submitReport = async (formData, token) => {
  if (DEMO_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    const reports = readDemoReports();
    const nextReport = createDemoReportFromFormData(formData);
    writeDemoReports([nextReport, ...reports].slice(0, 100));
    return {
      case_id: nextReport.case_id,
      status: nextReport.status,
      message: "Report submitted successfully (Demo Mode)",
    };
  }

  try {
    const response = await api.post(`/api/homepage/report`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting report:", error);
    throw error;
  }
};

export const getMyReports = async (token) => {
  if (DEMO_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return readDemoReports();
  }

  try {
    const response = await api.get(`/api/homepage/my-reports`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
};

export const getAIAnalysisStatus = async (caseId, token) => {
  if (DEMO_MODE) {
    return {
      case_id: caseId,
      ai_analysis_completed: true,
      severity: "Low",
      confidence: 0.92,
    };
  }

  try {
    const response = await api.get(`/api/homepage/report/${caseId}/ai-status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching AI status:", error);
    throw error;
  }
};

export const getPendingAIReports = async (token) => {
  if (DEMO_MODE) {
    return [];
  }

  try {
    const response = await api.get(`/api/homepage/reports/pending-ai`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching pending AI reports:", error);
    throw error;
  }
};

export const getRecentSubmissions = async (token) => {
  if (DEMO_MODE) {
    return readDemoReports().slice(0, 5);
  }

  try {
    const response = await api.get(`/api/homepage/recentsubmission`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching recent submissions:", error);
    throw error;
  }
};

export const pollAIAnalysis = async (
  caseId,
  token,
  maxAttempts = 20,
  interval = 3000
) => {
  if (DEMO_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      case_id: caseId,
      ai_analysis_completed: true,
      severity: "Low",
      confidence: 0.92,
    };
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const status = await getAIAnalysisStatus(caseId, token);

      if (status.ai_analysis_completed) {
        return status;
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    } catch (error) {
      console.error(`Polling attempt ${attempt + 1} failed:`, error);
      if (attempt === maxAttempts - 1) throw error;
    }
  }

  throw new Error("AI analysis timeout - taking longer than expected");
};

export const submitReportWithAI = async (formData, token, onProgress) => {
  try {
    onProgress?.("Uploading images...");
    const submitResult = await submitReport(formData, token);

    onProgress?.("AI analysis in progress...");
    const aiResult = await pollAIAnalysis(submitResult.case_id, token);

    onProgress?.("Analysis complete!");

    return {
      ...submitResult,
      ai_analysis: aiResult,
    };
  } catch (error) {
    console.error("Error in submit with AI:", error);
    throw error;
  }
};
