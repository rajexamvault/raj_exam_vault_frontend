"use client";

import { useState, useEffect, useCallback } from "react";
import reportService from "@/services/reportService";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open / Pending" },
  { value: "investigating", label: "Investigating" },
  { value: "resolved", label: "Resolved / Fixed" },
  { value: "closed", label: "Closed" }
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "All Priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" }
];

const CATEGORY_LABELS = {
  ui_ux: "🎨 UI & Layout",
  question_error: "❓ Question Error",
  test_issue: "🏆 Mock Test",
  materials_download: "📚 Notes / PYQ PDF",
  auth_account: "🔐 Account / Login",
  payment_subscription: "💳 Payment",
  performance: "⚡ Performance / Lag",
  other: "🛠️ Other / Feedback"
};

export default function BugReportManagement() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    investigating: 0,
    resolved: 0,
    closed: 0,
    pending: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1
  });

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Inspection & Resolution Modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalStatus, setModalStatus] = useState("resolved");
  const [adminNotes, setAdminNotes] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionNotice, setActionNotice] = useState({ type: "", message: "" });

  // Lightbox
  const [lightboxImage, setLightboxImage] = useState(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await reportService.getAllReports({
        page: pagination.page,
        limit: pagination.limit,
        search,
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter
      });

      setReports(res.data || []);
      if (res.stats) setStats(res.stats);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      console.error("Failed to fetch bug reports:", err);
      setActionNotice({ type: "error", message: err.message || "Failed to load reports" });
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter, priorityFilter, categoryFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Open Resolve Modal
  const handleOpenResolveModal = (report) => {
    setSelectedReport(report);
    setModalStatus(report.status === "open" ? "resolved" : report.status);
    setAdminNotes(
      report.adminNotes ||
      "We have resolved the problem you reported. Everything is verified and working smoothly now. Please check on your platform."
    );
    setSendEmail(true);
  };

  // Close Resolve Modal
  const handleCloseResolveModal = () => {
    setSelectedReport(null);
    setAdminNotes("");
    setIsUpdating(false);
  };

  // Submit Status & Resolution (with email)
  const handleSubmitResolution = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    setIsUpdating(true);
    setActionNotice({ type: "", message: "" });

    try {
      const res = await reportService.updateReportStatus(selectedReport.id, {
        status: modalStatus,
        adminNotes: adminNotes.trim(),
        sendEmail
      });

      setActionNotice({
        type: "success",
        message: res.message || "Bug report status updated successfully!"
      });

      handleCloseResolveModal();
      fetchReports();
    } catch (err) {
      setActionNotice({
        type: "error",
        message: err.message || "Failed to update report status."
      });
      setIsUpdating(false);
    }
  };

  // Quick Delete
  const handleDeleteReport = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bug report? This action cannot be undone.")) {
      return;
    }
    try {
      await reportService.deleteReport(id);
      setActionNotice({ type: "success", message: "Report deleted successfully" });
      fetchReports();
    } catch (err) {
      setActionNotice({ type: "error", message: err.message || "Failed to delete report" });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-800/60 flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Open
          </span>
        );
      case "investigating":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-950 text-blue-300 border border-blue-800/60 flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Investigating
          </span>
        );
      case "resolved":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60 flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Resolved
          </span>
        );
      case "closed":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
            Closed
          </span>
        );
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "critical":
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-800">Critical</span>;
      case "high":
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-800">High</span>;
      case "medium":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800">Medium</span>;
      case "low":
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">Low</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      {actionNotice.message && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-2 animate-fade-in ${
            actionNotice.type === "success"
              ? "bg-emerald-950/80 border-emerald-800 text-emerald-200"
              : "bg-rose-950/80 border-rose-800 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{actionNotice.type === "success" ? "✅" : "⚠️"}</span>
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice({ type: "", message: "" })}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Reports</span>
            <span className="text-base">📋</span>
          </div>
          <div className="text-2xl font-black text-white mt-2">{stats.total}</div>
          <p className="text-[11px] text-slate-500 mt-1">Submitted across platform</p>
        </div>

        {/* Open / Pending */}
        <div className="bg-slate-900/90 border border-amber-800/40 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300">Needs Attention</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">{stats.open}</div>
          <p className="text-[11px] text-amber-300/70 mt-1">Awaiting review or fix</p>
        </div>

        {/* Investigating */}
        <div className="bg-slate-900/90 border border-blue-800/40 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-300">Investigating</span>
            <span className="text-base">🔍</span>
          </div>
          <div className="text-2xl font-black text-blue-400 mt-2">{stats.investigating}</div>
          <p className="text-[11px] text-blue-300/70 mt-1">Work in progress</p>
        </div>

        {/* Resolved */}
        <div className="bg-slate-900/90 border border-emerald-800/40 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300">Fixed & Resolved</span>
            <span className="text-base">✅</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{stats.resolved}</div>
          <p className="text-[11px] text-emerald-300/70 mt-1">Users notified via email</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports by title, user name, or email..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
          <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            onClick={fetchReports}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            title="Refresh List"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Reports Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            <span className="w-7 h-7 border-3 border-slate-700 border-t-rose-500 rounded-full animate-spin inline-block mb-3"></span>
            <p>Loading bug reports database...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-20 text-center p-6">
            <span className="text-4xl block mb-2">🎉</span>
            <h3 className="text-base font-bold text-slate-200">No Bug Reports Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search || statusFilter !== "all" || priorityFilter !== "all"
                ? "No reports match your current filter settings. Try clearing filters."
                : "Great news! There are currently no unresolved bug reports from users."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Issue Details</th>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4">Category & Priority</th>
                  <th className="py-3 px-4">Screenshot</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Issue Details */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-500">#{report.id}</span>
                        <span className="font-bold text-slate-100 truncate block max-w-[240px]" title={report.title}>
                          {report.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5" title={report.description}>
                        {report.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                        <span>
                          {new Date(report.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </span>
                        {report.pageUrl && (
                          <>
                            <span>•</span>
                            <a
                              href={report.pageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-rose-400 hover:underline truncate max-w-[120px]"
                              title={report.pageUrl}
                            >
                              Location ↗
                            </a>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Reporter */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {report.user ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-rose-600/30 text-rose-300 border border-rose-500/30 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {report.user.name ? report.user.name.charAt(0) : "U"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-200 text-xs">{report.user.name}</div>
                            <div className="text-[10px] text-slate-400">{report.user.email}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-600/30 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {(report.contactName || "S").charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-200 text-xs">{report.contactName || "Student"}</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-950 text-amber-300 border border-amber-800">Without Login</span>
                            </div>
                            <div className="text-[10px] text-slate-400">{report.contactEmail || "No email"}</div>
                          </div>
                        </div>
                      )}
                    </td>


                    {/* Category & Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-300 block">
                          {CATEGORY_LABELS[report.category] || report.category}
                        </span>
                        {getPriorityBadge(report.priority)}
                      </div>
                    </td>

                    {/* Screenshot Preview */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {report.screenshotUrl ? (
                        <div
                          onClick={() => setLightboxImage(report.screenshotUrl)}
                          className="relative w-14 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 cursor-pointer group hover:ring-2 hover:ring-rose-500 transition-all"
                          title="Click to view full screenshot"
                        >
                          <img
                            src={report.screenshotUrl}
                            alt="Screenshot"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition-opacity">
                            🔍
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-600 italic">No image</span>
                      )}
                    </td>

                    {/* Status & Email Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getStatusBadge(report.status)}
                        {report.resolutionEmailSent && (
                          <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <span>📧</span>
                            <span>Mail Sent</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenResolveModal(report)}
                          className="px-3 py-1.5 rounded-lg bg-linear-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>🛠️</span>
                          <span>Inspect & Resolve</span>
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                          title="Delete Report"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect & Resolve Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-fade-in my-8">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500">#{selectedReport.id}</span>
                  <h3 className="text-base font-bold text-white">Inspect & Resolve Issue</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review problem details, update status, and send notification email to the user.
                </p>
              </div>
              <button
                onClick={handleCloseResolveModal}
                className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitResolution} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Problem Overview Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">
                      {CATEGORY_LABELS[selectedReport.category] || selectedReport.category}
                    </span>
                    {getPriorityBadge(selectedReport.priority)}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Reported on {new Date(selectedReport.createdAt).toLocaleString()}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{selectedReport.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 whitespace-pre-line leading-relaxed">
                    {selectedReport.description}
                  </p>
                </div>

                {/* Reporter & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-900 text-xs text-slate-400">
                  <div>
                    <span className="font-bold text-slate-300">Reporter: </span>
                    {selectedReport.user ? (
                      `${selectedReport.user.name} (${selectedReport.user.email})`
                    ) : (
                      <span className="text-amber-300">
                        {selectedReport.contactName || "Student"} ({selectedReport.contactEmail || "No email"}) [Without Login]
                        {selectedReport.contactPhone ? ` | Tel: ${selectedReport.contactPhone}` : ''}
                      </span>
                    )}
                  </div>
                  {selectedReport.pageUrl && (
                    <div className="truncate">
                      <span className="font-bold text-slate-300">URL: </span>
                      <a href={selectedReport.pageUrl} target="_blank" rel="noreferrer" className="text-rose-400 hover:underline">
                        {selectedReport.pageUrl}
                      </a>
                    </div>
                  )}
                </div>


                {/* Screenshot if available */}
                {selectedReport.screenshotUrl && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">Attached Screenshot:</span>
                    <div
                      onClick={() => setLightboxImage(selectedReport.screenshotUrl)}
                      className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 cursor-pointer group max-h-48 flex items-center justify-center"
                    >
                      <img
                        src={selectedReport.screenshotUrl}
                        alt="Screenshot"
                        className="max-h-48 w-auto object-contain"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                        🔍 Click to Zoom Full Resolution
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Update Issue Status <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "investigating", label: "🔍 Investigating" },
                    { value: "resolved", label: "✅ Resolved & Fixed" },
                    { value: "closed", label: "⚪ Closed" }
                  ].map((st) => (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => setModalStatus(st.value)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                        modalStatus === st.value
                          ? st.value === "resolved"
                            ? "bg-emerald-950 text-emerald-300 border-emerald-500 ring-2 ring-emerald-500/30"
                            : "bg-slate-800 text-white border-slate-600 ring-2 ring-slate-500/30"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Admin Resolution Note / Fix Details
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Explain how the bug was solved (this will be sent in the email to the user)..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              {/* Email User / Student Toggle */}
              {(selectedReport.user?.email || selectedReport.contactEmail) && modalStatus === "resolved" && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-950 border-slate-700"
                    />
                    <span className="text-xs font-bold text-emerald-200">
                      📧 Send resolution email to student: &quot;Your bug is fixed now, please check&quot;
                    </span>
                  </label>
                  {sendEmail && (
                    <p className="text-[11px] text-emerald-300/80 pl-6 leading-relaxed">
                      An email will be dispatched to <strong>{selectedReport.user?.email || selectedReport.contactEmail}</strong> informing them that &quot;{selectedReport.title}&quot; is fixed with link to check platform.
                    </p>
                  )}
                </div>
              )}


              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseResolveModal}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Saving & Sending Mail...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>{modalStatus === "resolved" && sendEmail ? "Resolve & Send Mail" : "Save Changes"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden bg-slate-950 p-2 border border-slate-800 shadow-2xl">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center font-bold text-sm z-10 cursor-pointer"
            >
              ✕
            </button>
            <img
              src={lightboxImage}
              alt="Screenshot Preview"
              className="max-h-[85vh] w-auto max-w-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
