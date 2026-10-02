import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('raj_auth_token') || localStorage.getItem('rev_token') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const syllabusService = {
  // Get entire tree hierarchy for an exam
  async getExamHierarchy(examId) {
    const res = await axios.get(`${API_BASE_URL}/syllabus/tree/${examId}`);
    return res.data;
  },

  // Stages
  async getStages(examId) {
    const res = await axios.get(`${API_BASE_URL}/syllabus/stages/${examId}`);
    return res.data;
  },

  async createStage(examId, data) {
    const res = await axios.post(`${API_BASE_URL}/syllabus/stages/${examId}`, data, {
      headers: getAuthHeaders()
    });
    return res.data;
  },

  async updateStage(stageId, data) {
    const res = await axios.put(`${API_BASE_URL}/syllabus/stages/${stageId}`, data, {
      headers: getAuthHeaders()
    });
    return res.data;
  },

  async deleteStage(stageId) {
    const res = await axios.delete(`${API_BASE_URL}/syllabus/stages/${stageId}`, {
      headers: getAuthHeaders()
    });
    return res.data;
  },

  // Subjects
  async getSubjects(stageId) {
    const res = await axios.get(`${API_BASE_URL}/syllabus/subjects/${stageId}`);
    return res.data;
  },

  async createSubject(data) {
    const res = await axios.post(`${API_BASE_URL}/syllabus/subjects`, data, {
      headers: getAuthHeaders()
    });
    return res.data;
  },

  async updateSubject(subjectId, data) {
    const res = await axios.put(`${API_BASE_URL}/syllabus/subjects/${subjectId}`, data, {
      headers: getAuthHeaders()
    });
    return res.data;
  },

  async deleteSubject(subjectId) {
    const res = await axios.delete(`${API_BASE_URL}/syllabus/subjects/${subjectId}`, {
      headers: getAuthHeaders()
    });
    return res.data;
  },

  // Topics
  async getTopics(subjectId) {
    const res = await axios.get(`${API_BASE_URL}/syllabus/topics/${subjectId}`);
    return res.data;
  },

  async createTopic(data) {
    const res = await axios.post(`${API_BASE_URL}/syllabus/topics`, data, {
      headers: getAuthHeaders()
    });
    return res.data;
  },

  async updateTopic(topicId, data) {
    const res = await axios.put(`${API_BASE_URL}/syllabus/topics/${topicId}`, data, {
      headers: getAuthHeaders()
    });
    return res.data;
  },

  async deleteTopic(topicId) {
    const res = await axios.delete(`${API_BASE_URL}/syllabus/topics/${topicId}`, {
      headers: getAuthHeaders()
    });
    return res.data;
  },

  // Syllabus Items
  async getSyllabusItems(params = {}) {
    const res = await axios.get(`${API_BASE_URL}/syllabus/items`, { params });
    return res.data;
  },

  async createSyllabusItem(data) {
    const res = await axios.post(`${API_BASE_URL}/syllabus/items`, data, {
      headers: getAuthHeaders()
    });
    return res.data;
  },

  async updateSyllabusItem(id, data) {
    const res = await axios.put(`${API_BASE_URL}/syllabus/items/${id}`, data, {
      headers: getAuthHeaders()
    });
    return res.data;
  },

  async deleteSyllabusItem(id) {
    const res = await axios.delete(`${API_BASE_URL}/syllabus/items/${id}`, {
      headers: getAuthHeaders()
    });
    return res.data;
  },

  // Bulk reorder
  async reorder(type, orderedIds) {
    const res = await axios.post(`${API_BASE_URL}/syllabus/reorder`, { type, orderedIds }, {
      headers: getAuthHeaders()
    });
    return res.data;
  }
};

export default syllabusService;
