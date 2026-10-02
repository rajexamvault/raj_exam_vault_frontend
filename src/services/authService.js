import API_BASE_URL from "@/lib/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    ...(options.headers || {})
  };

  // Only set Content-Type to JSON if body is NOT FormData
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

export const authService = {
  signup: ({ name, email, password }) =>
    request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    }),

  verifySignupOtp: ({ email, otp }) =>
    request("/auth/verify-signup-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp })
    }),

  resendSignupOtp: ({ email }) =>
    request("/auth/resend-signup-otp", {
      method: "POST",
      body: JSON.stringify({ email })
    }),

  login: ({ email, password }) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),

  forgotPassword: ({ email }) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email })
    }),

  verifyResetOtp: ({ email, otp }) =>
    request("/auth/verify-reset-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp })
    }),

  resetPassword: ({ email, otp, newPassword }) =>
    request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, otp, newPassword })
    }),

  getProfile: () => request("/auth/me"),

  checkUsername: (username) =>
    request(`/auth/check-username?username=${encodeURIComponent(username)}`),

  updateProfile: ({ name, username, category, phone, whatsappNumber, dob, targetExam, higherQualification, age, state }) =>
    request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ name, username, category, phone, whatsappNumber, dob, targetExam, higherQualification, age, state })
    }),

  changePassword: ({ currentPassword, newPassword }) =>
    request("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword })
    }),

  uploadProfileImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return request("/auth/profile-image", {
      method: "POST",
      body: formData
    });
  },

  deleteProfileImage: () =>
    request("/auth/profile-image", {
      method: "DELETE"
    })
};

export default authService;

