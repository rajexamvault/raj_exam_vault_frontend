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

const SUBJECT_PRESETS = [
  "Rajasthan History, Art & Culture",
  "Rajasthan Geography",
  "Rajasthan Polity & Admin",
  "Economy of Rajasthan",
  "General Science & Technology",
  "Reasoning & Mental Ability",
  "Basic Mathematics",
  "General Hindi (सामान्य हिन्दी)",
  "General English",
  "Current Affairs & GK"
];

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

  // Dynamic Subjects Input State
  const [subjectInput, setSubjectInput] = useState("");

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
    status: "active",
    subjects: ["Rajasthan History, Art & Culture", "Rajasthan Geography", "General Science & Technology"]
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
  }, [pagination.currentPage, search, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleOpenCreate = () => {
    setEditingExam(null);
    setSubjectInput("");
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
      status: "active",
      subjects: ["Rajasthan History, Art & Culture", "Rajasthan Geography", "General Science & Technology"]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (exam) => {
    setEditingExam(exam);
    setSubjectInput("");
    let initialSubjects = [];
    if (Array.isArray(exam.subjects) && exam.subjects.length > 0) {
      initialSubjects = exam.subjects.map(s => (typeof s === "string" ? s : s.name));
    }

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
      status: exam.status || "active",
      subjects: initialSubjects
    });

    setIsModalOpen(true);

    // Fetch subjects dynamically if not already populated on exam object
    if (initialSubjects.length === 0 && exam.id) {
      try {
        const subs = await examService.getExamSubjects(exam.id);
        if (Array.isArray(subs) && subs.length > 0) {
          setFormData(prev => ({
            ...prev,
            subjects: subs.map(s => (typeof s === "string" ? s : s.name))
          }));
        }
      } catch (e) {
        console.warn("Could not load exam subjects:", e);
      }
    }
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

  // Add subject from preset button
  const handleAddPresetSubject = (preset) => {
    if (!formData.subjects.includes(preset)) {
      setFormData(prev => ({ ...prev, subjects: [...prev.subjects, preset] }));
    }
  };

  // Add custom typed subject
  const handleAddCustomSubject = () => {
    const trimmed = subjectInput.trim();
    if (!trimmed) return;
    if (formData.subjects.includes(trimmed)) {
      showToast?.("warning", `Subject "${trimmed}" is already in the list`);
      return;
    }
    setFormData(prev => ({ ...prev, subjects: [...prev.subjects, trimmed] }));
    setSubjectInput("");
  };

  // Remove subject
  const handleRemoveSubject = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSaveExam = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast?.("error", "Exam title is required");
      return;
    }

    if (!formData.subjects || formData.subjects.length === 0) {
      showToast?.("error", "At least one subject is mandatory for this exam. Please add subjects.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingExam) {
        await examService.updateExam(editingExam.id, formData);
        showToast?.("success", `Exam "${formData.title}" updated successfully! ✏️`);
      } else {
        await examService.createExam(formData);
        showToast?.("success", `Exam "${formData.title}" created with ${formData.subjects.length} subjects! 🎯`);
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
            Create state exams with mandatory dynamic subjects to drive Question Banks, PYQs, and Test Series.
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
              : "Get started by creating your first Rajasthan government exam with dynamic subjects!"}
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

                {/* Configured Subjects Badges */}
                {Array.isArray(exam.subjects) && exam.subjects.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      📚 Subjects ({exam.subjects.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {exam.subjects.slice(0, 3).map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px] truncate max-w-[140px]"
                        >
                          {typeof sub === "string" ? sub : sub.name}
                        </span>
                      ))}
                      {exam.subjects.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                          +{exam.subjects.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats Counters: PYQs, Notes, Questions */}
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
                      {exam.stats?.questionCount || 0}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400">Questions</div>
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
                    title="Manage Subjects, Topics and Syllabus"
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
                    title="Edit Exam details & subjects"
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
                    {editingExam ? "Edit Rajasthan Exam & Subjects" : "Create New Rajasthan Exam"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Define exam info and mandatory dynamic subjects for question banks.
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

              {/* MANDATORY DYNAMIC SUBJECTS SECTION */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 uppercase flex items-center gap-1.5">
                    <span>📚 Exam Subjects</span>
                    <span className="text-red-400">*</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 font-bold border border-red-800/50">
                      MANDATORY
                    </span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {formData.subjects.length} added {formData.subjects.length === 0 && <span className="text-red-400 font-bold">(Min 1 required)</span>}
                  </span>
                </div>

                {/* Added Subjects Pill List */}
                {formData.subjects.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                    {formData.subjects.map((sub, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-red-950/50 text-red-200 border border-red-800/50 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                      >
                        <span>📖 {sub}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(idx)}
                          className="text-red-400 hover:text-white cursor-pointer font-bold px-0.5"
                          title="Remove subject"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-amber-400 bg-amber-950/30 border border-amber-800/40 p-2.5 rounded-lg flex items-center gap-2">
                    <span>⚠️</span>
                    <span>Subjects are mandatory for this exam. Please select presets below or type custom subjects.</span>
                  </div>
                )}

                {/* Input to type custom subject */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type custom subject name (e.g. Mathematics, Indian Polity)..."
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomSubject();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSubject}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    + Add Subject
                  </button>
                </div>

                {/* Quick Add Presets */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Quick Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUBJECT_PRESETS.map((preset) => {
                      const isAdded = formData.subjects.includes(preset);
                      return (
                        <button
                          key={preset}
                          type="button"
                          disabled={isAdded}
                          onClick={() => handleAddPresetSubject(preset)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                            isAdded
                              ? "bg-slate-900 text-slate-600 border border-slate-800/50 cursor-not-allowed"
                              : "bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-red-500/50 hover:text-white"
                          }`}
                        >
                          + {preset}
                        </button>
                      );
                    })}
                  </div>
                </div>
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
                  placeholder="Overview of the exam, subjects, scheme, and syllabus highlights..."
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
