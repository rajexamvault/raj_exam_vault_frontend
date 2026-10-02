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

export const announcementService = {
  getAllAnnouncements: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);
    if (params.search) query.append("search", params.search);
    if (params.examId && params.examId !== "all") query.append("examId", params.examId);
    if (params.announcementType && params.announcementType !== "all") query.append("announcementType", params.announcementType);
    if (params.priority && params.priority !== "all") query.append("priority", params.priority);
    if (params.status && params.status !== "all") query.append("status", params.status);
    if (params.isFlashTicker !== undefined && params.isFlashTicker !== "all") query.append("isFlashTicker", params.isFlashTicker);
    return request(`/announcements?${query.toString()}`);
  },

  getFlashTicker: () => request("/announcements/flash-ticker"),

  getStats: () => request("/announcements/stats"),

  getAnnouncement: (idOrSlug) => request(`/announcements/${idOrSlug}`),

  createAnnouncement: (announcementData) =>
    request("/announcements", {
      method: "POST",
      body: JSON.stringify(announcementData)
    }),

  updateAnnouncement: (id, announcementData) =>
    request(`/announcements/${id}`, {
      method: "PUT",
      body: JSON.stringify(announcementData)
    }),

  deleteAnnouncement: (id) =>
    request(`/announcements/${id}`, {
      method: "DELETE"
    })
};

export default announcementService;
