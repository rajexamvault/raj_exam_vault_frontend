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

export const currentAffairService = {
  getAllCurrentAffairs: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);
    if (params.search) query.append("search", params.search);
    if (params.category && params.category !== "all") query.append("category", params.category);
    if (params.date) query.append("date", params.date);
    if (params.month) query.append("month", params.month);
    if (params.isFeatured !== undefined && params.isFeatured !== "all") query.append("isFeatured", params.isFeatured);
    if (params.status && params.status !== "all") query.append("status", params.status);
    return request(`/current-affairs?${query.toString()}`);
  },

  getDailyDigest: (date) => {
    const query = date ? `?date=${date}` : "";
    return request(`/current-affairs/digest${query}`);
  },

  getStats: () => request("/current-affairs/stats"),

  getArticle: (idOrSlug) => request(`/current-affairs/${idOrSlug}`),

  createArticle: (articleData) =>
    request("/current-affairs", {
      method: "POST",
      body: JSON.stringify(articleData)
    }),

  updateArticle: (id, articleData) =>
    request(`/current-affairs/${id}`, {
      method: "PUT",
      body: JSON.stringify(articleData)
    }),

  deleteArticle: (id) =>
    request(`/current-affairs/${id}`, {
      method: "DELETE"
    }),

  trackView: (id) =>
    request(`/current-affairs/view/${id}`, {
      method: "POST"
    }),

  trackLike: (id) =>
    request(`/current-affairs/like/${id}`, {
      method: "POST"
    })
};

export default currentAffairService;
