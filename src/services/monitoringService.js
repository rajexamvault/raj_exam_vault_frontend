import API_BASE_URL from "@/lib/api";

// ─── Shared request helper ────────────────────────────────────────────────────
async function request(endpoint, options = {}) {
  // Strip leading "/api" if provided to prevent duplicate "/api/api" pathing
  const cleanEndpoint = endpoint.startsWith("/api/")
    ? endpoint.slice(4)
    : endpoint.startsWith("/api")
    ? endpoint.slice(4)
    : endpoint;
  const baseUrl = String(API_BASE_URL).replace(/\/+$/, "");
  const path = cleanEndpoint.startsWith("/") ? cleanEndpoint : `/${cleanEndpoint}`;
  const url = `${baseUrl}${path}`;

  const headers = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("raj_auth_token") ||
      localStorage.getItem("rev_token") ||
      localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const sessionId = localStorage.getItem("raj_session_id");
    if (sessionId) headers["x-session-id"] = sessionId;
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data?.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

function buildQuery(params = {}) {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return q ? `?${q}` : "";
}

// ─── Monitoring Service ───────────────────────────────────────────────────────
const monitoringService = {
  /**
   * Overview dashboard stats (requests, sessions, system vitals)
   */
  getDashboardStats: () => request("/monitoring/stats"),

  /**
   * Real-time metrics snapshot (CPU, memory, disk, live request rate)
   */
  getRealtimeMetrics: () => request("/monitoring/realtime"),

  /**
   * Server & OS info
   */
  getServerInfo: () => request("/monitoring/server"),

  /**
   * Database stats (connections, queries, table sizes)
   */
  getDatabaseInfo: () => request("/monitoring/database"),

  /**
   * API Logs (paginated, filterable)
   * @param {Object} params - { page, limit, method, statusCode, userId, route, minResponseTime, search, startDate, endDate, sortBy, sortDir }
   */
  getApiLogs: (params = {}) =>
    request(`/monitoring/api-logs${buildQuery(params)}`),

  /**
   * API Analytics — most used, slowest, error-prone, method breakdown
   * @param {string} period - '1h' | '24h' | '7d' | '30d'
   */
  getApiAnalytics: (period = "24h") =>
    request(`/monitoring/api-analytics?period=${period}`),

  /**
   * Slow API list (above threshold ms)
   * @param {Object} params - { threshold, period }
   */
  getSlowApis: (params = {}) =>
    request(`/monitoring/slow-apis${buildQuery(params)}`),

  /**
   * User sessions (login/logout history with duration)
   * @param {Object} params - { page, limit, userId, status, search, startDate, endDate }
   */
  getUserSessions: (params = {}) =>
    request(`/monitoring/sessions${buildQuery(params)}`),

  /**
   * Per-user activity (API hits, time spent, session count)
   * @param {string} period - '24h' | '7d' | '30d'
   */
  getUserActivity: (period = "7d") =>
    request(`/monitoring/user-activity?period=${period}`),

  /**
   * List all log files
   */
  getLogFiles: () => request("/monitoring/logs"),

  /**
   * Read tail of a specific log file
   * @param {string} filename - log file name
   * @param {number} lines - number of lines to tail
   */
  readLogFile: (filename, lines = 200) =>
    request(`/monitoring/logs/${encodeURIComponent(filename)}?lines=${lines}`),

  /**
   * Send heartbeat to record user activity, current URL, and stay time
   * @param {Object} data - { sessionId, currentPath, event }
   */
  recordHeartbeat: (data = {}) =>
    request("/monitoring/heartbeat", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  /**
   * Close user session on logout or window unload
   * @param {string} sessionId
   */
  closeSession: (sessionId) =>
    request("/monitoring/session/close", {
      method: "POST",
      body: JSON.stringify({ sessionId })
    })
};

export default monitoringService;
