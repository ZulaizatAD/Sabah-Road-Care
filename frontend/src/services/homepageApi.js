// src/services/homepageApi.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // Your FastAPI backend URL
});

// ✅ Submit a new pothole report
export const submitReport = async (formData, token) => {
  try {
    const response = await api.post(`/api/homepage/report`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error submitting report:", error);
    throw error;
  }
};

// ✅ Fetch all reports for the current user
export const getMyReports = async (token) => {
  try {
    const response = await api.get(`/api/homepage/my-reports`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching reports:", error);
    throw error;
  }
};

// ✅ NEW: Check AI analysis status for specific report
export const getAIAnalysisStatus = async (caseId, token) => {
  try {
    const response = await api.get(`/api/homepage/report/${caseId}/ai-status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching AI status:", error);
    throw error;
  }
};

// ✅ NEW: Get reports still being analyzed by AI
export const getPendingAIReports = async (token) => {
  try {
    const response = await api.get(`/api/homepage/reports/pending-ai`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching pending AI reports:", error);
    throw error;
  }
};

// ✅ NEW: Get recent submissions for dashboard widget
export const getRecentSubmissions = async (token) => {
  try {
    const response = await api.get(`/api/homepage/recentsubmission`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching recent submissions:", error);
    throw error;
  }
};

// ✅ NEW: Poll AI status until analysis completes
export const pollAIAnalysis = async (
  caseId,
  token,
  maxAttempts = 20,
  interval = 3000
) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const status = await getAIAnalysisStatus(caseId, token);

      if (status.ai_analysis_completed) {
        return status; // AI analysis complete
      }

      // Wait before next check
      await new Promise((resolve) => setTimeout(resolve, interval));
    } catch (error) {
      console.error(`❌ Polling attempt ${attempt + 1} failed:`, error);
      if (attempt === maxAttempts - 1) throw error;
    }
  }

  throw new Error("AI analysis timeout - taking longer than expected");
};

// ✅ NEW: Submit report and wait for AI analysis
export const submitReportWithAI = async (formData, token, onProgress) => {
  try {
    // Step 1: Submit report
    onProgress?.("Uploading images...");
    const submitResult = await submitReport(formData, token);

    // Step 2: Poll for AI completion
    onProgress?.("AI analysis in progress...");
    const aiResult = await pollAIAnalysis(submitResult.case_id, token);

    onProgress?.("Analysis complete!");

    return {
      ...submitResult,
      ai_analysis: aiResult,
    };
  } catch (error) {
    console.error("❌ Error in submit with AI:", error);
    throw error;
  }
};
