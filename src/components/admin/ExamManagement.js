"use client";

import { useState, useEffect, useCallback } from "react";
import examService from "@/services/examService";

const CATEGORIES = [
  "State Civil Services",
  "Police & Defence",
  "Teaching & REET",
  "CET & Clerical",
  "Revenue & Patwari",
  "Engineering & Technical",
  "High Court & Judicial",
  "Other State Exams"
];

const EMOJI_ICONS = ["🏛️", "👮", "👨‍🏫", "📚", "⚖️", "🗺️", "📋", "🎓", "🚜", "🌲", "🩺", "💼"];

export default function ExamManagement({ onAddMaterialForExam, onManageSyllabusForExam, showToast }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "State Civil Services",
    department: "RPSC",
    description: "",
    icon: "🏛️",
    badge: "Popular",
    totalVacancies: "",
    examDate: "",
    syllabusUrl: "",
    status: "active"
  });

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      const res = await examService.getExams({
        page: pagination.currentPage,
        limit: 12,
        search,
        category: categoryFilter,
        status: statusFilter
      });
      if (res.data?.exams || res.exams) {
        setExams(res.data?.exams || res.exams);
        setPagination(res.data?.pagination || res.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
      }
    } catch (err) {
      showToast?.("error", err.message || "Failed to load exams");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, search, categoryFilter, statusFilter, showToast]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleOpenCreate = () => {
    setEditingExam(null);
    setFormData({
      title: "",
      slug: "",
      category: "State Civil Services",
      department: "RPSC",
      description: "",
      icon: "🏛️",
      badge: "Popular",
      totalVacancies: "",
      examDate: "",
      syllabusUrl: "",
      status: "active"
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title || "",
      slug: exam.slug || "",
      category: exam.category || "State Civil Services",
      department: exam.department || "RPSC",
      description: exam.description || "",
      icon: exam.icon || "🏛️",
      badge: exam.badge || "Popular",
      totalVacancies: exam.totalVacancies || "",
      examDate: exam.examDate || "",
      syllabusUrl: exam.syllabusUrl || "",
      status: exam.status || "active"
    });
    setIsModalOpen(true);
  };

  const handleTitleChange = (val) => {
    setFormData((prev) => {
      const generatedSlug = !editingExam
        ? val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
        : prev.slug;
      return {
        ...prev,
        title: val,
        slug: !editingExam ? generatedSlug : prev.slug
      };
    });
  };

  const handleSaveExam = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast?.("error", "Exam title is required");
      return;
    }

    setIsSaving(true);
    try {
      if (editingExam) {
        await examService.updateExam(editingExam.id, formData);
        showToast?.("success", `Exam "${formData.title}" updated successfully! ✏️`);
      } else {
        await examService.createExam(formData);
        showToast?.("success", `Exam "${formData.title}" created successfully! 🎯`);
      }
      setIsModalOpen(false);
      fetchExams();
    } catch (err) {
      showToast?.("error", err.message || "Failed to save exam");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExam = async (id) => {
    try {
      await examService.deleteExam(id);
      showToast?.("success", "Exam and its linked materials deleted");
      setDeleteConfirmId(null);
      fetchExams();
    } catch (err) {
      showToast?.("error", err.message || "Failed to delete exam");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Actions Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <span>🏛️</span>
            <span>Rajasthan Exams Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Create and organize state government exams to provide PYQs, Notes, and Study Material.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={fetchExams}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
            title="Refresh list"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-md shadow-red-900/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>+ Create New Exam</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Search exams by title, department, or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500 cursor-pointer"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-36 px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="active">🟢 Active</option>
          <option value="upcoming">⏳ Upcoming</option>
          <option value="inactive">🔴 Inactive</option>
        </select>
      </div>

      {/* Exams Grid */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-medium">Loading Rajasthan exams...</span>
        </div>
      ) : exams.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800">
          <span className="text-4xl">🏛️</span>
          <h3 className="text-sm font-bold text-white mt-3">No Exams Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {search || categoryFilter !== "all"
              ? "No exams match your search filters. Try clearing your filters."
              : "Get started by creating your first Rajasthan government exam!"}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            + Create First Exam
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group relative overflow-hidden"
            >
              {/* Top Row: Icon, Title, Status */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
                      {exam.icon || "🏛️"}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                        {exam.title}
                      </h3>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold text-slate-300">{exam.department || "RPSC"}</span>
                        <span>•</span>
                        <span className="truncate max-w-[120px]">{exam.category}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                      exam.status === "active"
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                        : exam.status === "upcoming"
                        ? "bg-amber-950/80 text-amber-400 border border-amber-800/60"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {exam.status}
                  </span>
                </div>

                {/* Description / Summary */}
                {exam.description && (
                  <p className="text-xs text-slate-400/90 mt-3 line-clamp-2 leading-relaxed">
                    {exam.description}
                  </p>
                )}

                {/* Badges & Meta */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {exam.badge && (
                    <span className="px-2 py-0.5 rounded-md bg-red-950/70 text-red-300 border border-red-800/40 text-[10px] font-bold">
                      🏷️ {exam.badge}
                    </span>
                  )}
                  {exam.totalVacancies > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-950/70 text-blue-300 border border-blue-800/40 text-[10px] font-bold">
                      💼 {exam.totalVacancies.toLocaleString()} Posts
                    </span>
                  )}
                  {exam.examDate && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-950/70 text-purple-300 border border-purple-800/40 text-[10px] font-bold">
                      📅 {exam.examDate}
                    </span>
                  )}
                </div>

                {/* Stats Counters: PYQs, Notes, Syllabus */}
                <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70 text-center">
                  <div>
                    <div className="text-xs font-black text-amber-400">
                      {exam.stats?.pyqCount || 0}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400">PYQs</div>
                  </div>
                  <div className="border-x border-slate-800">
                    <div className="text-xs font-black text-blue-400">
                      {exam.stats?.notesCount || 0}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400">Notes</div>
                  </div>
                  <div>
                    <div className="text-xs font-black text-emerald-400">
                      {exam.stats?.freeCount || 0}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400">Free PDFs</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onManageSyllabusForExam?.(exam)}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                    title="Manage Stages, Subjects, Topics and Syllabus"
                  >
                    <span>📑 Syllabus</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAddMaterialForExam?.(exam)}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                    title="Upload PYQ or Study Material for this exam"
                  >
                    <span>+ Material</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(exam)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                    title="Edit Exam details"
                  >
                    ✏️
                  </button>

                  {deleteConfirmId === exam.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDeleteExam(exam.id)}
                        className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold transition-all cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-1.5 py-1 rounded bg-slate-800 text-slate-400 text-[10px] cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(exam.id)}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/30 text-xs transition-colors cursor-pointer"
                      title="Delete Exam"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT EXAM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-scale-up my-8">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2">
                <span className="text-xl">{editingExam ? "✏️" : "🏛️"}</span>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {editingExam ? "Edit Rajasthan Exam" : "Create New Rajasthan Exam"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Add syllabus, categories, and target vacancy details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveExam} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Exam Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Exam Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RPSC RAS / RTS Preliminary & Mains 2026"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Slug & Icon Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="rpsc-ras-2026"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 placeholder:text-slate-600 font-mono focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Icon Emoji
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      maxLength={4}
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-14 px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-center text-lg text-white focus:outline-none focus:border-red-500"
                    />
                    <div className="flex gap-1 flex-wrap">
                      {EMOJI_ICONS.slice(0, 4).map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: emoji })}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs flex items-center justify-center cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Department / Board
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RPSC / RSMSSB / Rajasthan Police"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Vacancies, Badge & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Total Vacancies
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 905"
                    value={formData.totalVacancies}
                    onChange={(e) => setFormData({ ...formData, totalVacancies: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Badge / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Popular, High Priority"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Exam Date & Syllabus URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Exam Date / Schedule
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. October 2026 or Tentative"
                    value={formData.examDate}
                    onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Official Syllabus Link (URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://rpsc.rajasthan.gov.in/syllabus"
                    value={formData.syllabusUrl}
                    onChange={(e) => setFormData({ ...formData, syllabusUrl: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Description & Guidelines
                </label>
                <textarea
                  rows={3}
                  placeholder="Overview of the exam, stages (Prelims, Mains, Interview), and syllabus highlights..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Saving Exam...</span>
                    </>
                  ) : (
                    <span>{editingExam ? "Update Exam" : "Create Exam"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
