"use client";

import { useState, useEffect, useCallback } from "react";
import questionService from "@/services/questionService";
import examService from "@/services/examService";
import syllabusService from "@/services/syllabusService";

const DEFAULT_OPTIONS = [
  { id: "A", textHindi: "", textEnglish: "", isCorrect: true },
  { id: "B", textHindi: "", textEnglish: "", isCorrect: false },
  { id: "C", textHindi: "", textEnglish: "", isCorrect: false },
  { id: "D", textHindi: "", textEnglish: "", isCorrect: false }
];

export default function QuestionBankManagement({ showToast }) {
  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [examStages, setExamStages] = useState([]);
  const [stageSubjects, setStageSubjects] = useState([]);
  const [stats, setStats] = useState({ totalQuestions: 0, easyCount: 0, mediumCount: 0, hardCount: 0, pyqCount: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [examFilter, setExamFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [pyqFilter, setPyqFilter] = useState("all");
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [bulkJsonText, setBulkJsonText] = useState("");
  const [expandedExplanations, setExpandedExplanations] = useState({});

  // Question Form State
  const [formData, setFormData] = useState({
    examId: "",
    stageId: "",
    subjectId: "",
    topicId: "",
    questionType: "single_choice",
    questionHindi: "",
    questionEnglish: "",
    options: DEFAULT_OPTIONS,
    correctAnswer: "A",
    explanationHindi: "",
    explanationEnglish: "",
    difficultyLevel: "medium",
    marks: 1.0,
    negativeMarks: 0.33,
    isPreviousYear: false,
    pyqYear: new Date().getFullYear(),
    pyqExamName: "",
    status: "active"
  });

  // Load exams
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await examService.getAllExams({ limit: 100 });
        const examsList = res.data?.exams || res.exams || (Array.isArray(res.data) ? res.data : []);
        if (examsList.length > 0) {
          setExams(examsList);
          if (!formData.examId) {
            setFormData(prev => ({ ...prev, examId: examsList[0].id }));
          }
        }
      } catch (err) {
        console.warn("Exams load error:", err);
      }
    };
    fetchExams();
  }, []);

  // Fetch Questions & Stats
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const [qRes, sRes] = await Promise.all([
        questionService.getQuestions({
          page: pagination.currentPage,
          limit: 10,
          search,
          examId: examFilter,
          difficultyLevel: difficultyFilter,
          isPreviousYear: pyqFilter
        }),
        questionService.getStats(examFilter)
      ]);

      if (qRes.data?.questions) {
        setQuestions(qRes.data.questions);
        setPagination(qRes.data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
      }
      if (sRes.data?.stats) {
        setStats(sRes.data.stats);
      }
    } catch (err) {
      showToast?.("error", err.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, search, examFilter, difficultyFilter, pyqFilter, showToast]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Handle Exam change in modal to cascade stages
  const handleModalExamChange = async (targetExamId) => {
    setFormData(prev => ({ ...prev, examId: targetExamId, stageId: "", subjectId: "" }));
    if (!targetExamId) {
      setExamStages([]);
      setStageSubjects([]);
      return;
    }
    try {
      const res = await syllabusService.getStages(targetExamId);
      if (res.data) setExamStages(res.data);
    } catch (err) {
      console.warn("Failed to load stages:", err);
    }
  };

  // Handle Stage change to cascade subjects
  const handleModalStageChange = async (targetStageId) => {
    setFormData(prev => ({ ...prev, stageId: targetStageId, subjectId: "" }));
    if (!targetStageId) {
      setStageSubjects([]);
      return;
    }
    try {
      const res = await syllabusService.getSubjects(targetStageId);
      if (res.data) setStageSubjects(res.data);
    } catch (err) {
      console.warn("Failed to load subjects:", err);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    const defaultExamId = exams[0]?.id || "";
    setEditingQuestion(null);
    setFormData({
      examId: defaultExamId,
      stageId: "",
      subjectId: "",
      topicId: "",
      questionType: "single_choice",
      questionHindi: "",
      questionEnglish: "",
      options: [
        { id: "A", textHindi: "", textEnglish: "", isCorrect: true },
        { id: "B", textHindi: "", textEnglish: "", isCorrect: false },
        { id: "C", textHindi: "", textEnglish: "", isCorrect: false },
        { id: "D", textHindi: "", textEnglish: "", isCorrect: false }
      ],
      correctAnswer: "A",
      explanationHindi: "",
      explanationEnglish: "",
      difficultyLevel: "medium",
      marks: 1.0,
      negativeMarks: 0.33,
      isPreviousYear: false,
      pyqYear: new Date().getFullYear(),
      pyqExamName: "",
      status: "active"
    });
    if (defaultExamId) handleModalExamChange(defaultExamId);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = async (q) => {
    setEditingQuestion(q);
    setFormData({
      examId: q.examId || "",
      stageId: q.stageId || "",
      subjectId: q.subjectId || "",
      topicId: q.topicId || "",
      questionType: q.questionType || "single_choice",
      questionHindi: q.questionHindi || "",
      questionEnglish: q.questionEnglish || "",
      options: Array.isArray(q.options) && q.options.length > 0 ? q.options : DEFAULT_OPTIONS,
      correctAnswer: q.correctAnswer || "A",
      explanationHindi: q.explanationHindi || "",
      explanationEnglish: q.explanationEnglish || "",
      difficultyLevel: q.difficultyLevel || "medium",
      marks: q.marks || 1.0,
      negativeMarks: q.negativeMarks !== undefined ? q.negativeMarks : 0.33,
      isPreviousYear: !!q.isPreviousYear,
      pyqYear: q.pyqYear || new Date().getFullYear(),
      pyqExamName: q.pyqExamName || "",
      status: q.status || "active"
    });

    if (q.examId) {
      try {
        const res = await syllabusService.getStages(q.examId);
        if (res.data) setExamStages(res.data);
        if (q.stageId) {
          const subRes = await syllabusService.getSubjects(q.stageId);
          if (subRes.data) setStageSubjects(subRes.data);
        }
      } catch (err) {
        console.warn("Preload error:", err);
      }
    }
    setIsModalOpen(true);
  };

  // Option text update helper
  const handleOptionTextChange = (index, field, value) => {
    const updated = [...formData.options];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, options: updated }));
  };

  // Correct answer change helper
  const handleCorrectAnswerSelect = (optionId) => {
    const updated = formData.options.map(opt => ({
      ...opt,
      isCorrect: opt.id === optionId
    }));
    setFormData(prev => ({ ...prev, options: updated, correctAnswer: optionId }));
  };

  // Save Question
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!formData.questionHindi && !formData.questionEnglish) {
      showToast?.("error", "Please write question text in either Hindi or English");
      return;
    }

    try {
      setIsSaving(true);
      if (editingQuestion) {
        await questionService.updateQuestion(editingQuestion.id, formData);
        showToast?.("success", "Question updated successfully ✏️");
      } else {
        await questionService.createQuestion(formData);
        showToast?.("success", "Question added to Question Bank 🎯");
      }
      setIsModalOpen(false);
      fetchQuestions();
    } catch (err) {
      showToast?.("error", err.message || "Failed to save question");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Bulk Import
  const handleBulkImportSubmit = async (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(bulkJsonText);
      if (!Array.isArray(parsed)) {
        showToast?.("error", "JSON must be an array of question objects");
        return;
      }
      setIsSaving(true);
      const res = await questionService.bulkImport(parsed, exams[0]?.id);
      showToast?.("success", res.message || "Questions imported successfully!");
      setIsBulkModalOpen(false);
      setBulkJsonText("");
      fetchQuestions();
    } catch (err) {
      showToast?.("error", "Invalid JSON format: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (id) => {
    try {
      await questionService.deleteQuestion(id);
      showToast?.("success", "Question deleted from Question Bank 🗑️");
      setDeleteConfirmId(null);
      fetchQuestions();
    } catch (err) {
      showToast?.("error", err.message || "Failed to delete question");
    }
  };

  const toggleExplanation = (id) => {
    setExpandedExplanations(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🎯</span>
              <span>Question Bank & Rich MCQ Engine</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Bilingual (Hindi & English) repository for Rajasthan exams, previous year questions, and test series.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              📥 Bulk JSON Import
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-900/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>+ Add Question</span>
            </button>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Questions</span>
            <div className="text-xl font-black text-white mt-1">{stats.totalQuestions}</div>
          </div>
          <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40">
            <span className="text-[10px] font-bold text-emerald-400 uppercase">🟢 Easy Level</span>
            <div className="text-xl font-black text-emerald-300 mt-1">{stats.easyCount}</div>
          </div>
          <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-800/40">
            <span className="text-[10px] font-bold text-amber-400 uppercase">🟡 Medium Level</span>
            <div className="text-xl font-black text-amber-300 mt-1">{stats.mediumCount}</div>
          </div>
          <div className="bg-rose-950/40 p-3 rounded-xl border border-rose-800/40">
            <span className="text-[10px] font-bold text-rose-400 uppercase">🔴 Hard Level</span>
            <div className="text-xl font-black text-rose-300 mt-1">{stats.hardCount}</div>
          </div>
          <div className="bg-purple-950/40 p-3 rounded-xl border border-purple-800/40">
            <span className="text-[10px] font-bold text-purple-400 uppercase">📑 Official PYQs</span>
            <div className="text-xl font-black text-purple-300 mt-1">{stats.pyqCount}</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search keywords in Hindi / English..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
        </div>

        <select
          value={examFilter}
          onChange={(e) => setExamFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="all">All Rajasthan Exams</option>
          {exams.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.title}</option>
          ))}
        </select>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="all">All Difficulty Levels</option>
          <option value="easy">Easy Level</option>
          <option value="medium">Medium Level</option>
          <option value="hard">Hard Level</option>
        </select>

        <select
          value={pyqFilter}
          onChange={(e) => setPyqFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="all">All Questions (PYQs & Practice)</option>
          <option value="true">📑 PYQs Only</option>
          <option value="false">🎯 Practice Questions Only</option>
        </select>
      </div>

      {/* Questions Feed */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-medium">Loading questions...</span>
        </div>
      ) : questions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800">
          <span className="text-4xl">🎯</span>
          <h3 className="text-sm font-bold text-white mt-3">No Questions Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {search || examFilter !== "all"
              ? "No questions match your current filter parameters."
              : "Get started by adding questions or importing your MCQ question bank."}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            + Add First Question
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const isExplanationExpanded = expandedExplanations[q.id];
            const options = Array.isArray(q.options) ? q.options : [];

            return (
              <div
                key={q.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all shadow-md space-y-3"
              >
                {/* Question Top Tags */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                      Q{(pagination.currentPage - 1) * 10 + idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800/40 text-[10px] font-bold">
                      {q.exam?.shortName || q.exam?.title || "Exam"}
                    </span>
                    {q.stage && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800/40 text-[10px] font-bold">
                        {q.stage.name}
                      </span>
                    )}
                    {q.subjectRef && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-medium">
                        {q.subjectRef.name}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      q.difficultyLevel === "hard" ? "bg-rose-950 text-rose-300 border border-rose-800/40" :
                      q.difficultyLevel === "medium" ? "bg-amber-950 text-amber-300 border border-amber-800/40" :
                      "bg-emerald-950 text-emerald-300 border border-emerald-800/40"
                    }`}>
                      {q.difficultyLevel}
                    </span>
                    {q.isPreviousYear && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-900/80 text-purple-200 border border-purple-700/50 text-[10px] font-bold">
                        PYQ {q.pyqYear ? `(${q.pyqYear})` : ""} {q.pyqExamName ? `• ${q.pyqExamName}` : ""}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(q)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                      title="Edit Question"
                    >
                      ✏️
                    </button>
                    {deleteConfirmId === q.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
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
                        onClick={() => setDeleteConfirmId(q.id)}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/30 text-xs transition cursor-pointer"
                        title="Delete Question"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Bilingual Text */}
                <div className="space-y-1.5">
                  {q.questionHindi && (
                    <p className="text-sm font-semibold text-white leading-relaxed">
                      {q.questionHindi}
                    </p>
                  )}
                  {q.questionEnglish && (
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      {q.questionEnglish}
                    </p>
                  )}
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {options.map((opt) => {
                    const isCorrect = opt.id === q.correctAnswer;
                    return (
                      <div
                        key={opt.id}
                        className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                          isCorrect
                            ? "bg-emerald-950/50 border-emerald-500/70 text-emerald-200 ring-1 ring-emerald-500/30"
                            : "bg-slate-950/50 border-slate-800/80 text-slate-300"
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                          isCorrect ? "bg-emerald-500 text-slate-950 font-black" : "bg-slate-800 text-slate-400"
                        }`}>
                          {opt.id}
                        </span>
                        <div>
                          {opt.textHindi && <div className="font-medium">{opt.textHindi}</div>}
                          {opt.textEnglish && <div className="text-[11px] text-slate-400">{opt.textEnglish}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Solution / Explanation Toggle */}
                {(q.explanationHindi || q.explanationEnglish) && (
                  <div className="pt-2">
                    <button
                      onClick={() => toggleExplanation(q.id)}
                      className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExplanationExpanded ? "Hide" : "Show"} Detailed Solution / Explanation</span>
                      <span>{isExplanationExpanded ? "▲" : "▼"}</span>
                    </button>

                    {isExplanationExpanded && (
                      <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5 animate-fade-in">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                          💡 Correct Answer Explanation
                        </span>
                        {q.explanationHindi && <p className="text-slate-200">{q.explanationHindi}</p>}
                        {q.explanationEnglish && <p className="text-slate-400 italic text-[11px]">{q.explanationEnglish}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT QUESTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingQuestion ? "Edit Question" : "Add New MCQ Question"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bilingual question creator with dynamic options and rich explanations.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-lg p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              {/* Exam, Stage & Subject Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Target Exam *</label>
                  <select
                    required
                    value={formData.examId}
                    onChange={(e) => handleModalExamChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Exam</option>
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>{ex.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Stage (Optional)</label>
                  <select
                    value={formData.stageId}
                    onChange={(e) => handleModalStageChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
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
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
                  >
                    <option value="">General Subject</option>
                    {stageSubjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hindi Question Text */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Question Text (Hindi) 🇮🇳
                </label>
                <textarea
                  rows={2}
                  placeholder="उदा. 'राजस्थान के किस दुर्ग को यूनेस्को विश्व धरोहर स्थल में शामिल किया गया है?'"
                  value={formData.questionHindi}
                  onChange={(e) => setFormData(prev => ({ ...prev, questionHindi: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 outline-none focus:border-emerald-500"
                />
              </div>

              {/* English Question Text */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Question Text (English)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 'Which fort of Rajasthan is included in the UNESCO World Heritage Sites?'"
                  value={formData.questionEnglish}
                  onChange={(e) => setFormData(prev => ({ ...prev, questionEnglish: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Options Form with Correct Answer Radio */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase">
                  Options & Select Correct Answer (🔘 Correct)
                </label>
                <div className="space-y-2">
                  {formData.options.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <input
                        type="radio"
                        name="correctAnswerOption"
                        checked={formData.correctAnswer === opt.id}
                        onChange={() => handleCorrectAnswerSelect(opt.id)}
                        className="w-4 h-4 text-emerald-600 cursor-pointer"
                        title="Mark as correct answer"
                      />
                      <span className="w-6 h-6 rounded-md bg-slate-800 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                        {opt.id}
                      </span>
                      <input
                        type="text"
                        placeholder={`Option ${opt.id} (Hindi)`}
                        value={opt.textHindi}
                        onChange={(e) => handleOptionTextChange(idx, "textHindi", e.target.value)}
                        className="w-1/2 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder={`Option ${opt.id} (English)`}
                        value={opt.textEnglish}
                        onChange={(e) => handleOptionTextChange(idx, "textEnglish", e.target.value)}
                        className="w-1/2 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Explanation / Solution (Hindi)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="विस्तृत व्याख्या..."
                    value={formData.explanationHindi}
                    onChange={(e) => setFormData(prev => ({ ...prev, explanationHindi: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Explanation / Solution (English)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Detailed explanation..."
                    value={formData.explanationEnglish}
                    onChange={(e) => setFormData(prev => ({ ...prev, explanationEnglish: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Difficulty & PYQ Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Difficulty</label>
                  <select
                    value={formData.difficultyLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficultyLevel: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
                  >
                    <option value="easy">🟢 Easy</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="hard">🔴 Hard</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="pyqCheckbox"
                    checked={formData.isPreviousYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPreviousYear: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                  <label htmlFor="pyqCheckbox" className="text-xs font-semibold text-slate-300 cursor-pointer">
                    Is Official Previous Year Question (PYQ)?
                  </label>
                </div>

                {formData.isPreviousYear && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">PYQ Year & Exam</label>
                    <input
                      type="text"
                      placeholder="e.g. 2021 (RAS Prelims)"
                      value={formData.pyqExamName}
                      onChange={(e) => setFormData(prev => ({ ...prev, pyqExamName: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
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
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                >
                  {isSaving ? "Saving..." : editingQuestion ? "Update Question" : "Save Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">📥 Bulk Import Questions (JSON)</h3>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              Paste a JSON array of question objects. Example format:
            </p>
            <pre className="p-3 bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 rounded-xl max-h-32 overflow-y-auto">
{`[
  {
    "questionHindi": "राजस्थान का राज्य पशु क्या है?",
    "questionEnglish": "What is the state animal of Rajasthan?",
    "options": [
      { "id": "A", "textHindi": "चिंकारा / ऊंट", "textEnglish": "Chinkara / Camel" },
      { "id": "B", "textHindi": "बाघ", "textEnglish": "Tiger" }
    ],
    "correctAnswer": "A",
    "difficultyLevel": "easy"
  }
]`}
            </pre>

            <form onSubmit={handleBulkImportSubmit} className="space-y-4">
              <textarea
                rows={8}
                required
                placeholder="Paste JSON array here..."
                value={bulkJsonText}
                onChange={(e) => setBulkJsonText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono rounded-xl p-3 outline-none focus:border-emerald-500"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  {isSaving ? "Importing..." : "Import Questions"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
