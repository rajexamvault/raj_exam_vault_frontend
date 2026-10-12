import API_BASE_URL from "@/lib/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    ...(options.headers || {})
  };

  // Do not set Content-Type if sending FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("raj_auth_token");
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
      const error = new Error(data.message || "Failed to process request");
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (!error.status) {
      error.message = error.message || "Unable to connect to server. Please check your network.";
    }
    throw error;
  }
}

export const reportService = {
  /**
   * Submit a new bug / issue report (supports FormData for screenshot)
   */
  submitReport: (formData) => {
    return request("/reports", {
      method: "POST",
      body: formData
    });
  },

  /**
   * Get reports submitted by current logged-in user
   */
  getMyReports: ({ page = 1, limit = 20, status = "all" } = {}) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);
    if (status && status !== "all") params.append("status", status);

    return request(`/reports/my?${params.toString()}`);
  },

  /**
   * Superadmin: Get all reports with search and filter
   */
  getAllReports: ({
    page = 1,
    limit = 15,
    search = "",
    status = "all",
    priority = "all",
    category = "all"
  } = {}) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);
    if (search) params.append("search", search);
    if (status && status !== "all") params.append("status", status);
    if (priority && priority !== "all") params.append("priority", priority);
    if (category && category !== "all") params.append("category", category);

    return request(`/reports?${params.toString()}`);
  },

  /**
   * Superadmin: Get single report details
   */
  getReportById: (id) => {
    return request(`/reports/${id}`);
  },

  /**
   * Superadmin: Update report status, admin notes, and send email to user
   */
  updateReportStatus: (id, { status, adminNotes, sendEmail = true }) => {
    return request(`/reports/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
        adminNotes,
        sendEmail
      })
    });
  },

  /**
   * Superadmin: Delete report
   */
  deleteReport: (id) => {
    return request(`/reports/${id}`, {
      method: "DELETE"
    });
  },

  /**
   * Superadmin: Quick stats
   */
  getStats: () => {
    return request("/reports/stats");
  }
};

export default reportService;
