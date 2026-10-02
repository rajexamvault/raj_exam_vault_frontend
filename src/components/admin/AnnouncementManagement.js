"use client";

import { useState, useEffect, useCallback } from "react";
import announcementService from "@/services/announcementService";
import examService from "@/services/examService";

const ANNOUNCEMENT_TYPES = [
  { value: "exam_date", label: "📅 Exam Date Announced", badgeColor: "bg-purple-950 text-purple-300 border-purple-800/40" },
  { value: "admit_card", label: "🎟️ Admit Card Released", badgeColor: "bg-blue-950 text-blue-300 border-blue-800/40" },
  { value: "result", label: "🏆 Merit List & Result Declared", badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-800/40" },
  { value: "answer_key", label: "🔑 Official Answer Key", badgeColor: "bg-amber-950 text-amber-300 border-amber-800/40" },
  { value: "vacancy_update", label: "💼 Vacancy Increase / Revised", badgeColor: "bg-cyan-950 text-cyan-300 border-cyan-800/40" },
  { value: "syllabus_revision", label: "📖 Syllabus Scheme Changed", badgeColor: "bg-indigo-950 text-indigo-300 border-indigo-800/40" },
  { value: "urgent_alert", label: "🚨 Urgent Alert / Postponed", badgeColor: "bg-rose-950 text-rose-300 border-rose-800/40" },
  { value: "general", label: "📢 General Notice", badgeColor: "bg-slate-800 text-slate-300 border-slate-700" }
];

const PRIORITIES = [
  { value: "low", label: "Low Priority" },
  { value: "normal", label: "Normal Notice" },
  { value: "high", label: "High Alert" },
  { value: "urgent_flash", label: "🚨 Urgent Live Flash" }
];

export default function AnnouncementManagement({ showToast }) {
  const [announcements, setAnnouncements] = useState([]);
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState({ totalAnnouncements: 0, flashCount: 0, examDateCount: 0, resultCount: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [examFilter, setExamFilter] = useState("all");
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    examId: "",
    title: "",
    announcementType: "exam_date",
    priority: "normal",
    summary: "",
    content: "",
    officialUrl: "",
    officialPdfUrl: "",
    publishDate: new Date().toISOString().split("T")[0],
    expireDate: "",
    isFlashTicker: false,
    status: "active"
  });

  // Load exams
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await examService.getExams({ limit: 100 });
        const examsList = res.data?.exams || res.exams || (Array.isArray(res.data) ? res.data : []);
        setExams(examsList);
      } catch (err) {
        console.warn("Exams load error:", err);
      }
    };
    fetchExams();
  }, []);

  // Fetch Announcements
  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const [annRes, stRes] = await Promise.all([
        announcementService.getAllAnnouncements({
          page: pagination.currentPage,
          limit: 10,
          search,
          examId: examFilter,
          announcementType: typeFilter,
          priority: priorityFilter
        }),
        announcementService.getStats()
      ]);

      if (annRes.data?.announcements) {
        setAnnouncements(annRes.data.announcements);
        setPagination(annRes.data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
      }
      if (stRes.data?.stats) {
        setStats(stRes.data.stats);
      }
    } catch (err) {
      showToast?.("error", err.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, search, examFilter, typeFilter, priorityFilter, showToast]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingAlert(null);
    setFormData({
      examId: exams[0]?.id || "",
      title: "",
      announcementType: "exam_date",
      priority: "normal",
      summary: "",
      content: "",
      officialUrl: "",
      officialPdfUrl: "",
      publishDate: new Date().toISOString().split("T")[0],
      expireDate: "",
      isFlashTicker: false,
      status: "active"
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (alert) => {
    setEditingAlert(alert);
    setFormData({
      examId: alert.examId || "",
      title: alert.title || "",
      announcementType: alert.announcementType || "exam_date",
      priority: alert.priority || "normal",
      summary: alert.summary || "",
      content: alert.content || "",
      officialUrl: alert.officialUrl || "",
      officialPdfUrl: alert.officialPdfUrl || "",
      publishDate: alert.publishDate || new Date().toISOString().split("T")[0],
      expireDate: alert.expireDate || "",
      isFlashTicker: !!alert.isFlashTicker,
      status: alert.status || "active"
    });
    setIsModalOpen(true);
  };

  // Save Announcement
  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast?.("error", "Announcement title is required");
      return;
    }

    try {
      setIsSaving(true);
      if (editingAlert) {
        await announcementService.updateAnnouncement(editingAlert.id, formData);
        showToast?.("success", "Announcement updated successfully ✏️");
      } else {
        await announcementService.createAnnouncement(formData);
        showToast?.("success", "Official Alert / Announcement broadcasted 📢");
      }
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      showToast?.("error", err.message || "Failed to save announcement");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id) => {
    try {
      await announcementService.deleteAnnouncement(id);
      showToast?.("success", "Announcement deleted 🗑️");
      setDeleteConfirmId(null);
      fetchAnnouncements();
    } catch (err) {
      showToast?.("error", err.message || "Failed to delete announcement");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📢</span>
              <span>Official Exam Alerts & Notifications Broadcast</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Broadcast live exam dates, admit cards, answer keys, merit lists, and live breaking flash news tickers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAnnouncements}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition cursor-pointer"
              title="Refresh Announcements"
            >
              🔄 Sync
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-linear-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold text-xs shadow-md shadow-rose-900/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>+ Post Announcement</span>
            </button>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Notices</span>
            <div className="text-xl font-black text-white mt-1">{stats.totalAnnouncements}</div>
          </div>
          <div className="bg-rose-950/40 p-3 rounded-xl border border-rose-800/40">
            <span className="text-[10px] font-bold text-rose-400 uppercase">⚡ Live Flash Tickers</span>
            <div className="text-xl font-black text-rose-300 mt-1">{stats.flashCount}</div>
          </div>
          <div className="bg-purple-950/40 p-3 rounded-xl border border-purple-800/40">
            <span className="text-[10px] font-bold text-purple-400 uppercase">📅 Exam Dates</span>
            <div className="text-xl font-black text-purple-300 mt-1">{stats.examDateCount}</div>
          </div>
          <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40">
            <span className="text-[10px] font-bold text-emerald-400 uppercase">🏆 Results & Keys</span>
            <div className="text-xl font-black text-emerald-300 mt-1">{stats.resultCount}</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search alerts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
          <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-rose-500 cursor-pointer"
        >
          <option value="all">All Announcement Types</option>
          {ANNOUNCEMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-rose-500 cursor-pointer"
        >
          <option value="all">All Priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        <select
          value={examFilter}
          onChange={(e) => setExamFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-rose-500 cursor-pointer"
        >
          <option value="all">All Target Exams</option>
          {exams.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.title}</option>
          ))}
        </select>
      </div>

      {/* Announcements Feed */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-3 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-medium">Loading exam alerts...</span>
        </div>
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800">
          <span className="text-4xl">📢</span>
          <h3 className="text-sm font-bold text-white mt-3">No Active Announcements</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Broadcast official exam schedules, admit card notifications, and live flash tickers.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            + Broadcast First Alert
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((alert) => {
            const typeObj = ANNOUNCEMENT_TYPES.find(t => t.value === alert.announcementType) || ANNOUNCEMENT_TYPES[0];

            return (
              <div
                key={alert.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all shadow-md space-y-3"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeObj.badgeColor}`}>
                      {typeObj.label}
                    </span>
                    {alert.exam && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800/40 text-[10px] font-bold">
                        {alert.exam.shortName || alert.exam.title}
                      </span>
                    )}
                    {alert.isFlashTicker && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-600/30 text-rose-300 border border-rose-500/50 text-[10px] font-black animate-pulse">
                        ⚡ LIVE FLASH TICKER
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-slate-400">
                      📅 {alert.publishDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(alert)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                      title="Edit Alert"
                    >
                      ✏️
                    </button>
                    {deleteConfirmId === alert.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteAnnouncement(alert.id)}
                          className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-1 rounded bg-slate-800 text-slate-400 text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(alert.id)}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/30 text-xs transition cursor-pointer"
                        title="Delete Alert"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                {/* Title & Summary */}
                <div>
                  <h3 className="text-sm font-bold text-white leading-relaxed">
                    {alert.title}
                  </h3>
                  {alert.summary && (
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {alert.summary}
                    </p>
                  )}
                </div>

                {/* External Links */}
                {(alert.officialUrl || alert.officialPdfUrl) && (
                  <div className="flex items-center gap-2 pt-2">
                    {alert.officialPdfUrl && (
                      <a
                        href={alert.officialPdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <span>📄 Official PDF Notice</span>
                      </a>
                    )}
                    {alert.officialUrl && (
                      <a
                        href={alert.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <span>🌐 Visit Official Portal</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingAlert ? "Edit Exam Alert / Notice" : "Broadcast New Exam Alert"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-lg p-1">✕</button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Target Exam</label>
                  <select
                    value={formData.examId}
                    onChange={(e) => setFormData(prev => ({ ...prev, examId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-rose-500"
                  >
                    <option value="">Platform-Wide / General</option>
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>{ex.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Announcement Type *</label>
                  <select
                    value={formData.announcementType}
                    onChange={(e) => setFormData(prev => ({ ...prev, announcementType: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-rose-500"
                  >
                    {ANNOUNCEMENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Headline Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RPSC RAS 2024 Prelims Exam Date Announced for 02 February 2025"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-rose-500"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Publish Date</label>
                  <input
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Summary / Highlights</label>
                <textarea
                  rows={2}
                  placeholder="Short description of the notification..."
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Official Portal URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://rpsc.rajasthan.gov.in/..."
                    value={formData.officialUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, officialUrl: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-rose-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Official PDF Download URL</label>
                  <input
                    type="url"
                    placeholder="https://.../notice.pdf"
                    value={formData.officialPdfUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, officialPdfUrl: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="flashTickerCheckbox"
                  checked={formData.isFlashTicker}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFlashTicker: e.target.checked }))}
                  className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                />
                <label htmlFor="flashTickerCheckbox" className="text-xs font-semibold text-rose-400 cursor-pointer flex items-center gap-1">
                  <span>⚡ Broadcast on Live Top Breaking Flash News Ticker</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md"
                >
                  {isSaving ? "Saving..." : editingAlert ? "Update Alert" : "Post Alert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
