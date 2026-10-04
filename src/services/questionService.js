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

export const questionService = {
  getQuestions: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);
    if (params.search) query.append("search", params.search);
    if (params.examId && params.examId !== "all") query.append("examId", params.examId);
    if (params.stageId && params.stageId !== "all") query.append("stageId", params.stageId);
    if (params.subjectId && params.subjectId !== "all") query.append("subjectId", params.subjectId);
    if (params.topicId && params.topicId !== "all") query.append("topicId", params.topicId);
    if (params.difficultyLevel && params.difficultyLevel !== "all") query.append("difficultyLevel", params.difficultyLevel);
    if (params.questionType && params.questionType !== "all") query.append("questionType", params.questionType);
    if (params.status && params.status !== "all") query.append("status", params.status);
    if (params.isPreviousYear !== undefined && params.isPreviousYear !== "all") query.append("isPreviousYear", params.isPreviousYear);
    if (params.pyqYear && params.pyqYear !== "all") query.append("pyqYear", params.pyqYear);
    return request(`/questions?${query.toString()}`);
  },

  getStats: (examId) => {
    const query = new URLSearchParams();
    if (examId && examId !== "all") query.append("examId", examId);
    return request(`/questions/stats?${query.toString()}`);
  },

  getRandomSample: (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/questions/random-sample?${query.toString()}`);
  },

  getQuestionById: (id) => request(`/questions/${id}`),

  createQuestion: (questionData) =>
    request("/questions", {
      method: "POST",
      body: JSON.stringify(questionData)
    }),

  bulkImport: (questions, defaultExamId, defaultSubjectId) =>
    request("/questions/bulk-import", {
      method: "POST",
      body: JSON.stringify({
        questions,
        defaultExamId,
        defaultSubjectId,
        examId: defaultExamId,
        subjectId: defaultSubjectId
      })
    }),

  updateQuestion: (id, questionData) =>
    request(`/questions/${id}`, {
      method: "PUT",
      body: JSON.stringify(questionData)
    }),

  deleteQuestion: (id) =>
    request(`/questions/${id}`, {
      method: "DELETE"
    }),

  bulkDeleteQuestions: (questionIds) =>
    request("/questions/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ questionIds })
    })
};

export default questionService;
