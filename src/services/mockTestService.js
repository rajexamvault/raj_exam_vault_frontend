import API_BASE_URL from "@/lib/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("raj_auth_token") || localStorage.getItem("rev_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || "Request failed");
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (!error.status) {
      error.message = error.message || "Network error. Backend server might be offline.";
    }
    throw error;
  }
}

export const mockTestService = {
  getAllTests: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);
    if (params.search) query.append("search", params.search);
    if (params.examId && params.examId !== "all") query.append("examId", params.examId);
    if (params.stageId && params.stageId !== "all") query.append("stageId", params.stageId);
    if (params.subjectId && params.subjectId !== "all") query.append("subjectId", params.subjectId);
    if (params.topicId && params.topicId !== "all") query.append("topicId", params.topicId);
    if (params.testType && params.testType !== "all") query.append("testType", params.testType);
    if (params.status && params.status !== "all") query.append("status", params.status);
    if (params.isFree !== undefined && params.isFree !== "all") query.append("isFree", params.isFree);
    return request(`/tests?${query.toString()}`);
  },

  getTestById: (id) => request(`/tests/${id}`),

  createTest: (testData) =>
    request("/tests", {
      method: "POST",
      body: JSON.stringify(testData)
    }),

  updateTest: (id, testData) =>
    request(`/tests/${id}`, {
      method: "PUT",
      body: JSON.stringify(testData)
    }),

  deleteTest: (id) =>
    request(`/tests/${id}`, {
      method: "DELETE"
    }),

  addQuestions: (mockTestId, questionIds, sectionName = "General Section") =>
    request(`/tests/${mockTestId}/add-questions`, {
      method: "POST",
      body: JSON.stringify({ questionIds, sectionName })
    }),

  autoPopulateQuestions: (mockTestId, options) =>
    request(`/tests/${mockTestId}/auto-populate`, {
      method: "POST",
      body: JSON.stringify(options)
    }),

  removeQuestion: (mockTestId, questionId) =>
    request(`/tests/${mockTestId}/questions/${questionId}`, {
      method: "DELETE"
    }),

  startTest: (mockTestId) =>
    request(`/tests/${mockTestId}/start`, {
      method: "POST"
    }),

  submitTest: (attemptId, userAnswers, timeSpentSeconds) =>
    request(`/tests/attempts/${attemptId}/submit`, {
      method: "POST",
      body: JSON.stringify({ userAnswers, timeSpentSeconds })
    }),

  getLeaderboard: (mockTestId) => request(`/tests/${mockTestId}/leaderboard`)
};

export default mockTestService;
