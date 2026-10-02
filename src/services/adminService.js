import API_BASE_URL from "@/lib/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    ...(options.headers || {})
  };

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
      const error = new Error(data.message || "Something went wrong");
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (!error.status) {
      error.message = error.message || "Unable to connect to server. Please check backend.";
    }
    throw error;
  }
}

export const adminService = {
  // SuperAdmin Protected Endpoints
  getStats: () => request("/superadmin/stats"),

  getAdmins: ({ page = 1, limit = 10, search = "", status = "all" } = {}) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);
    if (search) params.append("search", search);
    if (status && status !== "all") params.append("status", status);

    return request(`/superadmin/admins?${params.toString()}`);
  },

  createAdmin: ({ name, email, phone, role = "admin" }) =>
    request("/superadmin/admins", {
      method: "POST",
      body: JSON.stringify({ name, email, phone, role })
    }),

  resendInvite: (adminId) =>
    request(`/superadmin/admins/${adminId}/resend-invite`, {
      method: "POST"
    }),

  toggleStatus: (adminId, status) =>
    request(`/superadmin/admins/${adminId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    }),

  deleteAdmin: (adminId) =>
    request(`/superadmin/admins/${adminId}`, {
      method: "DELETE"
    }),

  // Aspirants / Registered Users Management
  getUsers: ({ page = 1, limit = 10, search = "", exam = "all", status = "all", category = "all", role = "all" } = {}) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);
    if (search) params.append("search", search);
    if (exam && exam !== "all") params.append("exam", exam);
    if (status && status !== "all") params.append("status", status);
    if (category && category !== "all") params.append("category", category);
    if (role && role !== "all") params.append("role", role);

    return request(`/superadmin/users?${params.toString()}`);
  },

  getUserById: (userId) => request(`/superadmin/users/${userId}`),

  toggleUserStatus: (userId, status) =>
    request(`/superadmin/users/${userId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    }),

  updateUserRole: (userId, role) =>
    request(`/superadmin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role })
    }),

  deleteUser: (userId) =>
    request(`/superadmin/users/${userId}`, {
      method: "DELETE"
    }),

  // RBAC Roles & Permissions
  getRoles: () => request("/superadmin/roles"),
  getPermissions: () => request("/superadmin/permissions"),
  updateRolePermissions: (roleId, permissionIds) =>
    request(`/superadmin/roles/${roleId}/permissions`, {
      method: "PUT",
      body: JSON.stringify({ permissionIds })
    }),

  // Public Admin Invitation Verification & Password Setup Endpoints
  verifyInviteToken: (token, email) =>
    request(`/auth/verify-admin-invite?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`),

  requestNewInviteLink: (email) =>
    request("/auth/request-admin-invite-link", {
      method: "POST",
      body: JSON.stringify({ email })
    }),

  setupPassword: ({ token, email, newPassword }) =>
    request("/auth/setup-admin-password", {
      method: "POST",
      body: JSON.stringify({ token, email, newPassword })
    })
};

export default adminService;
