const rawUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
export const API_BASE_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    signup: `${API_BASE_URL}/auth/signup`,
    verifyOtp: `${API_BASE_URL}/auth/verify-signup-otp`,
    resendOtp: `${API_BASE_URL}/auth/resend-signup-otp`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`,
    profile: `${API_BASE_URL}/auth/me`,
  },
  exams: `${API_BASE_URL}/exams`,
  materials: `${API_BASE_URL}/materials`,
  tests: `${API_BASE_URL}/tests`,
  announcements: `${API_BASE_URL}/announcements`,
  currentAffairs: `${API_BASE_URL}/current-affairs`,
  search: `${API_BASE_URL}/search`,
  superadmin: `${API_BASE_URL}/superadmin`,
  vault: `${API_BASE_URL}/user/vault`,
};

export default API_BASE_URL;
