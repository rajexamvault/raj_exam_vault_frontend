"use client";

import { useState, useEffect, useCallback } from "react";
import examService from "@/services/examService";
import syllabusService from "@/services/syllabusService";

const MATERIAL_TYPES = [
  { value: "pyq", label: "📑 PYQ (Previous Year Paper)", badgeColor: "bg-amber-950/80 text-amber-300 border-amber-800/60" },
  { value: "notes", label: "📝 Subject Notes & Handouts", badgeColor: "bg-blue-950/80 text-blue-300 border-blue-800/60" },
  { value: "syllabus_pdf", label: "📖 Official Syllabus PDF", badgeColor: "bg-purple-950/80 text-purple-300 border-purple-800/60" },
  { value: "model_paper", label: "🎯 Model Paper & Practice Set", badgeColor: "bg-rose-950/80 text-rose-300 border-rose-800/60" },
  { value: "formula_sheet", label: "⚡ Formula / Quick Revision Sheet", badgeColor: "bg-yellow-950/80 text-yellow-300 border-yellow-800/60" },
  { value: "free_pdf", label: "🆓 Free Current Affairs & Digest", badgeColor: "bg-emerald-950/80 text-emerald-300 border-emerald-800/60" },
  { value: "book_pdf", label: "📚 Reference Book & Standard Text", badgeColor: "bg-cyan-950/80 text-cyan-300 border-cyan-800/60" }
];

export default function MaterialManagement({ preselectedExam, showToast }) {
  const [materials, setMaterials] = useState([]);
  const [exams, setExams] = useState([]);
  const [examStages, setExamStages] = useState([]);
  const [stageSubjects, setStageSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [examFilter, setExamFilter] = useState(preselectedExam ? String(preselectedExam.id) : "all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [isFreeFilter, setIsFreeFilter] = useState("all");
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    examId: preselectedExam ? preselectedExam.id : "",
    stageId: "",
    subjectId: "",
    title: "",
    materialType: "pyq",
    year: new Date().getFullYear(),
    subject: "Rajasthan GK",
    paperType: "Full Paper",
    fileUrl: "",
    fileSize: "3.5 MB",
    fileType: "pdf",
    isFree: true,
    price: 0,
    hasSolutions: true,
    description: "",
    status: "published"
  });

  // Load all exams for filter & modal
  const loadExamsList = useCallback(async () => {
    try {
      const res = await examService.getExams({ limit: 100 });
      if (res.data?.exams || res.exams) {
        setExams(res.data?.exams || res.exams);
      }
    } catch (err) {
      console.warn("Exams load notice:", err.message);
    }
  }, []);

  // Fetch Materials List
  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      const res = await examService.getMaterials({
        page: pagination.currentPage,
        limit: 15,
        search,
        examId: examFilter,
        materialType: typeFilter,
        year: yearFilter,
        isFree: isFreeFilter
      });
      if (res.data?.materials || res.materials) {
        setMaterials(res.data?.materials || res.materials);
        setPagination(res.data?.pagination || res.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
      }
    } catch (err) {
      showToast?.("error", err.message || "Failed to load study materials");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, search, examFilter, typeFilter, yearFilter, isFreeFilter, showToast]);

  useEffect(() => {
    loadExamsList();
  }, [loadExamsList]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  useEffect(() => {
    if (preselectedExam) {
      setExamFilter(String(preselectedExam.id));
    }
  }, [preselectedExam]);

  // Load stages when exam changes in modal
  const handleModalExamChange = async (targetExamId) => {
    setFormData(prev => ({ ...prev, examId: targetExamId, stageId: "", subjectId: "" }));
    if (!targetExamId) {
      setExamStages([]);
      setStageSubjects([]);
      return;
    }
    try {
      const res = await syllabusService.getStages(targetExamId);
      if (res.data) {
        setExamStages(res.data);
      }
    } catch (err) {
      console.warn("Failed to load stages for exam:", err);
    }
  };

  // Load subjects when stage changes in modal
  const handleModalStageChange = async (targetStageId) => {
    setFormData(prev => ({ ...prev, stageId: targetStageId, subjectId: "" }));
    if (!targetStageId) {
      setStageSubjects([]);
      return;
    }
    try {
      const res = await syllabusService.getSubjects(targetStageId);
      if (res.data) {
        setStageSubjects(res.data);
      }
    } catch (err) {
      console.warn("Failed to load subjects for stage:", err);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    const defaultExamId = preselectedExam ? preselectedExam.id : exams[0]?.id || "";
    setEditingMaterial(null);
    setFormData({
      examId: defaultExamId,
      stageId: "",
      subjectId: "",
      title: "",
      materialType: "pyq",
      year: new Date().getFullYear(),
      subject: "Rajasthan GK",
      paperType: "Full Paper",
      fileUrl: "",
      fileSize: "3.5 MB",
      fileType: "pdf",
      isFree: true,
      price: 0,
      hasSolutions: true,
      description: "",
      status: "published"
    });
    if (defaultExamId) {
      handleModalExamChange(defaultExamId);
    }
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = async (mat) => {
    setEditingMaterial(mat);
    setFormData({
      examId: mat.examId || "",
      stageId: mat.stageId || "",
      subjectId: mat.subjectId || "",
      title: mat.title || "",
      materialType: mat.materialType || "pyq",
      year: mat.year || new Date().getFullYear(),
      subject: mat.subject || "General Paper",
      paperType: mat.paperType || "Full Paper",
      fileUrl: mat.fileUrl || "",
      fileSize: mat.fileSize || "3.5 MB",
      fileType: mat.fileType || "pdf",
      isFree: mat.isFree !== false,
      price: mat.price || 0,
      hasSolutions: mat.hasSolutions !== false,
      description: mat.description || "",
      status: mat.status || "published"
    });

    if (mat.examId) {
      try {
        const res = await syllabusService.getStages(mat.examId);
        if (res.data) setExamStages(res.data);
        if (mat.stageId) {
          const subRes = await syllabusService.getSubjects(mat.stageId);
          if (subRes.data) setStageSubjects(subRes.data);
        }
      } catch (err) {
        console.warn("Failed to preload stages/subjects:", err);
      }
    }

    setIsModalOpen(true);
  };

  // Handle direct file upload via Multer / StorageService
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 50MB
    if (file.size > 50 * 1024 * 1024) {
      showToast?.("error", "File size exceeds maximum limit of 50MB");
      return;
    }

    try {
      setIsUploadingFile(true);
      const res = await examService.uploadMaterialFile(file, "study_materials");
      if (res.data?.url) {
        // Calculate formatted size
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";
        const ext = file.name.split(".").pop().toLowerCase();

        setFormData(prev => ({
          ...prev,
          fileUrl: res.data.url,
          fileSize: sizeMb,
          fileType: ext,
          title: prev.title || file.name.replace(/\.[^/.]+$/, "")
        }));
        showToast?.("success", `File "${file.name}" uploaded successfully! 📦`);
      }
    } catch (err) {
      showToast?.("error", err.message || "Failed to upload file");
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Save Material (Create or Update)
  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    if (!formData.examId) {
      showToast?.("error", "Please select a target Exam.");
      return;
    }
    if (!formData.title.trim()) {
      showToast?.("error", "Material title is required.");
      return;
    }
    if (!formData.fileUrl.trim()) {
      showToast?.("error", "Please upload a document or provide a file URL.");
      return;
    }

    try {
      setIsSaving(true);
      if (editingMaterial) {
        await examService.updateMaterial(editingMaterial.id, formData);
        showToast?.("success", "Study Material updated successfully ✏️");
      } else {
        await examService.createMaterial(formData);
        showToast?.("success", "Study Material / PYQ uploaded successfully 📄");
      }
      setIsModalOpen(false);
      fetchMaterials();
    } catch (err) {
      showToast?.("error", err.message || "Failed to save material");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Material
  const handleDeleteMaterial = async (id) => {
    try {
      await examService.deleteMaterial(id);
      showToast?.("success", "Material removed from vault 🗑️");
      setDeleteConfirmId(null);
      fetchMaterials();
    } catch (err) {
      showToast?.("error", err.message || "Failed to delete material");
    }
  };

  // Handle Download Tracking
  const handleDownload = async (mat) => {
    try {
      await examService.trackDownload(mat.id);
      window.open(mat.fileUrl, "_blank");
      fetchMaterials();
    } catch {
      window.open(mat.fileUrl, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📚</span>
            <span>Study Material & PYQ Vault</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Central repository for Previous Year Papers, Answer Keys, Subject Notes, and Free PDFs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMaterials}
            className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            title="Refresh Vault"
          >
            🔄 Sync
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-900/30 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span>+ Upload Material</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by title or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
        </div>

        {/* Exam Filter */}
        <select
          value={examFilter}
          onChange={(e) => setExamFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-medium rounded-xl px-3 py-2 outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="all">All Rajasthan Exams</option>
          {exams.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.title}</option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-medium rounded-xl px-3 py-2 outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="all">All Material Types</option>
          {MATERIAL_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* Year Filter */}
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-medium rounded-xl px-3 py-2 outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="all">All Years</option>
          {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2016, 2013].map((yr) => (
            <option key={yr} value={yr}>{yr}</option>
          ))}
        </select>

        {/* Free / Paid Filter */}
        <select
          value={isFreeFilter}
          onChange={(e) => setIsFreeFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-medium rounded-xl px-3 py-2 outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="all">Free & Premium</option>
          <option value="true">🆓 Free Only</option>
          <option value="false">💎 Premium Only</option>
        </select>
      </div>

      {/* Materials List Table / Grid */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-medium">Loading vault materials...</span>
        </div>
      ) : materials.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800">
          <span className="text-4xl">📂</span>
          <h3 className="text-sm font-bold text-white mt-3">No Study Materials Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {search || examFilter !== "all" || typeFilter !== "all"
              ? "No study materials match your search filters."
              : "Upload your first Previous Year Paper, Subject Notes, or Free PDF!"}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            + Upload First Material
          </button>
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Material Title & Details</th>
                  <th className="py-3.5 px-4 sm:px-6">Target Exam</th>
                  <th className="py-3.5 px-4 sm:px-6">Type & Year</th>
                  <th className="py-3.5 px-4 sm:px-6">Size & Downloads</th>
                  <th className="py-3.5 px-4 sm:px-6">Access</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {materials.map((mat) => {
                  const typeObj = MATERIAL_TYPES.find(t => t.value === mat.materialType) || MATERIAL_TYPES[0];

                  return (
                    <tr key={mat.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-base shrink-0">
                            {mat.materialType === "pyq" ? "📑" : mat.materialType === "notes" ? "📝" : "📚"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-200 line-clamp-1">{mat.title}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>{mat.subject || "General Paper"}</span>
                              <span>•</span>
                              <span>{mat.paperType || "Full Paper"}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 sm:px-6">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold text-[11px] border border-slate-700">
                          {mat.exam?.shortName || mat.exam?.title || "Exam"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeObj.badgeColor}`}>
                            {typeObj.label.split(" ")[0]} {typeObj.label.split(" ")[1]}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            Year: {mat.year}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="text-[11px] text-slate-300 font-medium">
                          💾 {mat.fileSize || "3.5 MB"}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                          ⬇️ {mat.totalDownloads || 0} Downloads
                        </div>
                      </td>

                      <td className="py-3.5 px-4 sm:px-6">
                        {mat.isFree ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[10px] font-extrabold uppercase">
                            Free
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60 text-[10px] font-extrabold">
                            ₹{mat.price}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownload(mat)}
                            className="p-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-800/40 text-xs transition-colors cursor-pointer"
                            title="Download / Open PDF"
                          >
                            ⬇️ Open
                          </button>
                          <button
                            onClick={() => handleOpenEdit(mat)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                            title="Edit Material"
                          >
                            ✏️
                          </button>

                          {deleteConfirmId === mat.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteMaterial(mat.id)}
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
                              onClick={() => setDeleteConfirmId(mat.id)}
                              className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/30 text-xs transition-colors cursor-pointer"
                              title="Delete Material"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MATERIAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingMaterial ? "Edit Study Material / PYQ" : "Upload New Study Material / PYQ"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Link files directly to any Rajasthan exam and optional stage or subject.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-4">
              {/* Exam & Cascading Stage / Subject Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Target Exam *</label>
                  <select
                    required
                    value={formData.examId}
                    onChange={(e) => handleModalExamChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                  >
                    <option value="">Select Exam</option>
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>{ex.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Exam Stage (Optional)</label>
                  <select
                    value={formData.stageId}
                    onChange={(e) => handleModalStageChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                  >
                    <option value="">All Stages</option>
                    {examStages.map((st) => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Subject (Optional)</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData(prev => ({ ...prev, subjectId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                  >
                    <option value="">General Subject</option>
                    {stageSubjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Document / Material Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RAS Prelims 2023 Official Question Paper with Answer Key"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              {/* Type, Year, Paper Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Material Type *</label>
                  <select
                    value={formData.materialType}
                    onChange={(e) => setFormData(prev => ({ ...prev, materialType: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                  >
                    {MATERIAL_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Paper Type / Shift</label>
                  <input
                    type="text"
                    placeholder="e.g. Paper-1 (Morning Shift)"
                    value={formData.paperType}
                    onChange={(e) => setFormData(prev => ({ ...prev, paperType: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Direct File Upload & URL */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 uppercase">
                    Upload PDF / Document File (Max 50MB)
                  </label>
                  {isUploadingFile && (
                    <span className="text-xs text-blue-400 font-semibold animate-pulse">Uploading file...</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold cursor-pointer text-center transition">
                    📁 Browse Local File
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-slate-500 font-mono">OR paste URL directly below:</span>
                </div>

                <input
                  type="url"
                  required
                  placeholder="https://... or uploaded file path"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, fileUrl: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-blue-500 font-mono"
                />

                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  <span>Size: {formData.fileSize}</span>
                  <span>•</span>
                  <span>Type: {formData.fileType.toUpperCase()}</span>
                </div>
              </div>

              {/* Access Settings: Free vs Paid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    id="isFreeCheckbox"
                    checked={formData.isFree}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFree: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="isFreeCheckbox" className="text-xs font-semibold text-slate-200 cursor-pointer">
                    Free for all Aspirants
                  </label>
                </div>

                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    id="hasSolutionsCheckbox"
                    checked={formData.hasSolutions}
                    onChange={(e) => setFormData(prev => ({ ...prev, hasSolutions: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="hasSolutionsCheckbox" className="text-xs font-semibold text-slate-200 cursor-pointer">
                    Includes Official Answer Key / Solution
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploadingFile}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                >
                  {isSaving ? "Saving..." : editingMaterial ? "Update Material" : "Save Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
