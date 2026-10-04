import API_BASE_URL from "@/lib/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    ...(options.headers || {})
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

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

export const examService = {
  // Exams
  getExams: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);
    if (params.search) query.append("search", params.search);
    if (params.category && params.category !== "all") query.append("category", params.category);
    if (params.status && params.status !== "all") query.append("status", params.status);
    return request(`/exams?${query.toString()}`);
  },

  getAllExams: (params = {}) => {
    const query = new URLSearchParams();
    if (params.limit) query.append("limit", params.limit || "100");
    return request(`/exams?${query.toString()}`).then(res => ({
      exams: res.data?.exams || res.exams || [],
      pagination: res.data?.pagination || res.pagination
    }));
  },

  getExamBySlug: (idOrSlug) => request(`/exams/${idOrSlug}`),

  createExam: (examData) =>
    request("/exams", {
      method: "POST",
      body: JSON.stringify(examData)
    }),

  updateExam: (id, examData) =>
    request(`/exams/${id}`, {
      method: "PUT",
      body: JSON.stringify(examData)
    }),

  deleteExam: (id) =>
    request(`/exams/${id}`, {
      method: "DELETE"
    }),

  getExamSubjects: (examId) =>
    request(`/exams/${examId}/subjects`).then(res => res.data?.subjects || res.subjects || []),

  addExamSubject: (examId, subjectData) =>
    request(`/exams/${examId}/subjects`, {
      method: "POST",
      body: JSON.stringify(subjectData)
    }),

  // Study Materials & PYQs
  getMaterials: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);
    if (params.search) query.append("search", params.search);
    if (params.examId && params.examId !== "all") query.append("examId", params.examId);
    if (params.stageId && params.stageId !== "all") query.append("stageId", params.stageId);
    if (params.subjectId && params.subjectId !== "all") query.append("subjectId", params.subjectId);
    if (params.materialType && params.materialType !== "all") query.append("materialType", params.materialType);
    if (params.year && params.year !== "all") query.append("year", params.year);
    if (params.status && params.status !== "all") query.append("status", params.status);
    if (params.isFree !== undefined && params.isFree !== "all") query.append("isFree", params.isFree);
    return request(`/materials?${query.toString()}`);
  },

  getMaterialById: (id) => request(`/materials/${id}`),

  uploadMaterialFile: (file, folder = "materials") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    return request("/materials/upload", {
      method: "POST",
      body: formData
    });
  },

  createMaterial: (materialData) =>
    request("/materials", {
      method: "POST",
      body: JSON.stringify(materialData)
    }),

  updateMaterial: (id, materialData) =>
    request(`/materials/${id}`, {
      method: "PUT",
      body: JSON.stringify(materialData)
    }),

  deleteMaterial: (id) =>
    request(`/materials/${id}`, {
      method: "DELETE"
    }),

  trackDownload: (id) =>
    request(`/materials/download/${id}`, {
      method: "POST"
    }),

  trackView: (id) =>
    request(`/materials/view/${id}`, {
      method: "POST"
    })
};

export default examService;
