"use client";

import { useState, useEffect, useCallback } from "react";
import mockTestService from "@/services/mockTestService";
import examService from "@/services/examService";
import syllabusService from "@/services/syllabusService";

const TEST_TYPES = [
  { value: "full_length", label: "🏆 Full Length Mock Test", badgeColor: "bg-purple-950 text-purple-300 border-purple-800/40" },
  { value: "sectional", label: "📑 Sectional Subject Test", badgeColor: "bg-blue-950 text-blue-300 border-blue-800/40" },
  { value: "topic_wise", label: "📖 Topic-Wise Quiz", badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-800/40" },
  { value: "pyq_mock", label: "📑 Previous Year Mock Exam", badgeColor: "bg-amber-950 text-amber-300 border-amber-800/40" },
  { value: "scholarship", label: "🎓 Mega Scholarship Test", badgeColor: "bg-rose-950 text-rose-300 border-rose-800/40" }
];

export default function MockTestManagement({ showToast }) {
  const [mockTests, setMockTests] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [examFilter, setExamFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [filterSubjects, setFilterSubjects] = useState([]);
  const [filterTopics, setFilterTopics] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [isFreeFilter, setIsFreeFilter] = useState("all");
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuestionManagerOpen, setIsQuestionManagerOpen] = useState(false);
  const [selectedTestForQuestions, setSelectedTestForQuestions] = useState(null);
  const [editingTest, setEditingTest] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isCustomTopicMode, setIsCustomTopicMode] = useState(false);

  // Form State (Dynamic Cascade: Exam -> Subject -> Topic)
  const [formSubjects, setFormSubjects] = useState([]);
  const [formTopics, setFormTopics] = useState([]);
  const [formData, setFormData] = useState({
    examId: "",
    subjectId: "",
    topicId: "",
    customTopicName: "",
    title: "",
    testType: "full_length",
    durationMinutes: 180,
    totalMarks: 200,
    totalQuestions: 150,
    negativeMarking: 0.33,
    passingMarks: 70,
    instructions: "1. All questions carry equal marks.\n2. Negative marking of 1/3 (0.33) applies for every incorrect answer.\n3. Do not refresh or close the browser tab during the test.",
    isFree: true,
    price: 0,
    status: "published",
    autoGenerate: false,
    autoPopulateCount: 20,
    difficultyLevel: "all"
  });

  // Auto Populate Panel State inside Question Manager
  const [autoPopulateConfig, setAutoPopulateConfig] = useState({
    count: 20,
    difficultyLevel: "all",
    examId: "",
    subjectId: "",
    topicId: ""
  });
  const [autoPopulateSubjects, setAutoPopulateSubjects] = useState([]);
  const [autoPopulateTopics, setAutoPopulateTopics] = useState([]);

  // Load Exams
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await examService.getExams({ limit: 100 });
        const examsList = res.data?.exams || res.exams || (Array.isArray(res.data) ? res.data : []);
        if (examsList.length > 0) {
          setExams(examsList);
        }
      } catch (err) {
        console.warn("Exams load error:", err);
      }
    };
    fetchExams();
  }, []);

  // Filter Bar: Cascade Subjects when examFilter changes
  useEffect(() => {
    const loadFilterSubjects = async () => {
      if (examFilter === "all" || !examFilter) {
        setFilterSubjects([]);
        setSubjectFilter("all");
        setFilterTopics([]);
        setTopicFilter("all");
        return;
      }
      try {
        const subs = await examService.getExamSubjects(examFilter);
        setFilterSubjects(subs || []);
        setSubjectFilter("all");
        setFilterTopics([]);
        setTopicFilter("all");
      } catch (err) {
        console.warn("Filter subjects error:", err);
        setFilterSubjects([]);
      }
    };
    loadFilterSubjects();
  }, [examFilter]);

  // Filter Bar: Cascade Topics when subjectFilter changes
  useEffect(() => {
    const loadFilterTopics = async () => {
      if (subjectFilter === "all" || !subjectFilter) {
        setFilterTopics([]);
        setTopicFilter("all");
        return;
      }
      try {
        const res = await syllabusService.getTopics(subjectFilter);
        const topicsList = res.data?.topics || res.data || res.topics || [];
        setFilterTopics(topicsList || []);
        setTopicFilter("all");
      } catch (err) {
        console.warn("Filter topics error:", err);
        setFilterTopics([]);
        setTopicFilter("all");
      }
    };
    loadFilterTopics();
  }, [subjectFilter]);

  // Fetch Tests List
  const fetchMockTests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await mockTestService.getAllTests({
        page: pagination.currentPage,
        limit: 12,
        search,
        examId: examFilter,
        subjectId: subjectFilter,
        topicId: topicFilter,
        testType: typeFilter,
        isFree: isFreeFilter
      });
      if (res.data?.mockTests) {
        setMockTests(res.data.mockTests);
        setPagination(res.data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
      }
    } catch (err) {
      showToast?.("error", err.message || "Failed to load mock tests");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, search, examFilter, subjectFilter, topicFilter, typeFilter, isFreeFilter]);

  useEffect(() => {
    fetchMockTests();
  }, [fetchMockTests]);

  // Handle Exam change in Form Modal
  const handleFormExamChange = async (targetExamId) => {
    setFormData(prev => ({ ...prev, examId: targetExamId, subjectId: "", topicId: "" }));
    setFormTopics([]);
    if (!targetExamId) {
      setFormSubjects([]);
      return;
    }
    try {
      const subs = await examService.getExamSubjects(targetExamId);
      setFormSubjects(subs || []);
    } catch (err) {
      console.warn("Form subjects error:", err);
      setFormSubjects([]);
    }
  };

  // Handle Subject change in Form Modal
  const handleFormSubjectChange = async (targetSubjectId) => {
    setFormData(prev => ({ ...prev, subjectId: targetSubjectId, topicId: "" }));
    if (!targetSubjectId) {
      setFormTopics([]);
      return;
    }
    try {
      const res = await syllabusService.getTopics(targetSubjectId);
      const topicsList = res.data?.topics || res.data || res.topics || [];
      setFormTopics(topicsList || []);
    } catch (err) {
      console.warn("Form topics error:", err);
      setFormTopics([]);
    }
  };

  // Open Create Modal
  const handleOpenCreate = async () => {
    const defaultExamId = (examFilter && examFilter !== "all") ? examFilter : (exams[0]?.id || "");
    const defaultSubjectId = (subjectFilter && subjectFilter !== "all") ? subjectFilter : "";
    const defaultTopicId = (topicFilter && topicFilter !== "all") ? topicFilter : "";

    setEditingTest(null);
    setIsCustomTopicMode(false);
    setFormData({
      examId: defaultExamId,
      subjectId: defaultSubjectId,
      topicId: defaultTopicId,
      customTopicName: "",
      title: "",
      testType: defaultTopicId ? "topic_wise" : (defaultSubjectId ? "sectional" : "full_length"),
      durationMinutes: defaultTopicId ? 30 : 180,
      totalMarks: defaultTopicId ? 50 : 200,
      totalQuestions: defaultTopicId ? 25 : 150,
      negativeMarking: 0.33,
      passingMarks: defaultTopicId ? 20 : 70,
      instructions: "1. All questions carry equal marks.\n2. Negative marking of 0.33 applies for every incorrect answer.\n3. Do not refresh or close the browser tab during the test.",
      isFree: true,
      price: 0,
      status: "published",
      autoGenerate: false,
      autoPopulateCount: 20,
      difficultyLevel: "all"
    });

    if (defaultExamId) {
      try {
        const subs = await examService.getExamSubjects(defaultExamId);
        setFormSubjects(subs || []);
        if (defaultSubjectId) {
          const tRes = await syllabusService.getTopics(defaultSubjectId);
          setFormTopics(tRes.data?.topics || tRes.data || tRes.topics || []);
        } else {
          setFormTopics([]);
        }
      } catch (err) {
        console.warn("Failed to load initial subjects:", err);
        setFormSubjects([]);
        setFormTopics([]);
      }
    } else {
      setFormSubjects([]);
      setFormTopics([]);
    }

    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = async (test) => {
    setEditingTest(test);
    setFormData({
      examId: test.examId || "",
      subjectId: test.subjectId || "",
      topicId: test.topicId || "",
      title: test.title || "",
      testType: test.testType || "full_length",
      durationMinutes: test.durationMinutes || 180,
      totalMarks: test.totalMarks || 200,
      totalQuestions: test.totalQuestions || 150,
      negativeMarking: test.negativeMarking !== undefined ? test.negativeMarking : 0.33,
      passingMarks: test.passingMarks || 70,
      instructions: test.instructions || "",
      isFree: test.isFree !== false,
      price: test.price || 0,
      status: test.status || "published",
      autoGenerate: false,
      autoPopulateCount: 20,
      difficultyLevel: "all"
    });

    if (test.examId) {
      try {
        const subs = await examService.getExamSubjects(test.examId);
        setFormSubjects(subs || []);
      } catch {
        setFormSubjects([]);
      }
    }

    if (test.subjectId) {
      try {
        const tRes = await syllabusService.getTopics(test.subjectId);
        setFormTopics(tRes.data?.topics || tRes.data || tRes.topics || []);
      } catch {
        setFormTopics([]);
      }
    } else {
      setFormTopics([]);
    }

    setIsModalOpen(true);
  };

  // Open Question Manager
  const handleOpenQuestionManager = async (test) => {
    try {
      const res = await mockTestService.getTestById(test.id);
      if (res.data?.mockTest) {
        const t = res.data.mockTest;
        setSelectedTestForQuestions(t);
        setAutoPopulateConfig({
          count: 20,
          difficultyLevel: "all",
          examId: t.examId || "",
          subjectId: t.subjectId || "",
          topicId: t.topicId || ""
        });

        // Load subjects & topics for the question manager auto-populate bar
        if (t.examId) {
          const subs = await examService.getExamSubjects(t.examId);
          setAutoPopulateSubjects(subs || []);
        }
        if (t.subjectId) {
          const tRes = await syllabusService.getTopics(t.subjectId);
          setAutoPopulateTopics(tRes.data?.topics || tRes.data || tRes.topics || []);
        } else {
          setAutoPopulateTopics([]);
        }

        setIsQuestionManagerOpen(true);
      }
    } catch (err) {
      showToast?.("error", err.message || "Failed to load test questions");
    }
  };

  // Handle exam/subject cascade in Question Manager auto-populate
  const handleAutoPopulateExamChange = async (targetExamId) => {
    setAutoPopulateConfig(prev => ({ ...prev, examId: targetExamId, subjectId: "", topicId: "" }));
    setAutoPopulateTopics([]);
    if (!targetExamId) {
      setAutoPopulateSubjects([]);
      return;
    }
    try {
      const subs = await examService.getExamSubjects(targetExamId);
      setAutoPopulateSubjects(subs || []);
    } catch {
      setAutoPopulateSubjects([]);
    }
  };

  const handleAutoPopulateSubjectChange = async (targetSubjectId) => {
    setAutoPopulateConfig(prev => ({ ...prev, subjectId: targetSubjectId, topicId: "" }));
    if (!targetSubjectId) {
      setAutoPopulateTopics([]);
      return;
    }
    try {
      const tRes = await syllabusService.getTopics(targetSubjectId);
      setAutoPopulateTopics(tRes.data?.topics || tRes.data || tRes.topics || []);
    } catch {
      setAutoPopulateTopics([]);
    }
  };

  // Save Test
  const handleSaveTest = async (e) => {
    e.preventDefault();
    if (!formData.examId || !formData.title.trim()) {
      showToast?.("error", "Target exam and test title are required");
      return;
    }

    try {
      setIsSaving(true);
      if (editingTest) {
        await mockTestService.updateTest(editingTest.id, formData);
        showToast?.("success", "Mock Test updated successfully ✏️");
      } else {
        const res = await mockTestService.createTest(formData);
        showToast?.("success", formData.autoGenerate
          ? "Mock Test created & questions auto-generated! 🎯"
          : "Mock Test created successfully 🎯"
        );
      }
      setIsModalOpen(false);
      fetchMockTests();
    } catch (err) {
      showToast?.("error", err.message || "Failed to save mock test");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Test
  const handleDeleteTest = async (id) => {
    try {
      await mockTestService.deleteTest(id);
      showToast?.("success", "Mock test removed from series 🗑️");
      setDeleteConfirmId(null);
      fetchMockTests();
    } catch (err) {
      showToast?.("error", err.message || "Failed to delete test");
    }
  };

  // Auto populate questions according to Exam, Subject, and Topic
  const handleAutoPopulate = async () => {
    if (!selectedTestForQuestions) return;
    try {
      setIsSaving(true);
      const res = await mockTestService.autoPopulateQuestions(selectedTestForQuestions.id, autoPopulateConfig);
      showToast?.("success", res.message || "Questions auto-populated from Question Bank!");
      // Reload test questions
      const updated = await mockTestService.getTestById(selectedTestForQuestions.id);
      if (updated.data?.mockTest) setSelectedTestForQuestions(updated.data.mockTest);
      fetchMockTests();
    } catch (err) {
      showToast?.("error", err.message || "Failed to auto populate questions");
    } finally {
      setIsSaving(false);
    }
  };

  // Remove single question from test
  const handleRemoveQuestion = async (qId) => {
    if (!selectedTestForQuestions) return;
    try {
      await mockTestService.removeQuestion(selectedTestForQuestions.id, qId);
      showToast?.("success", "Question removed from test");
      const updated = await mockTestService.getTestById(selectedTestForQuestions.id);
      if (updated.data?.mockTest) setSelectedTestForQuestions(updated.data.mockTest);
      fetchMockTests();
    } catch (err) {
      showToast?.("error", err.message || "Failed to remove question");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🏆</span>
              <span>Mock Tests & Live Test Series Engine</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Create and generate mock tests according to <strong>Exam</strong>, <strong>Subject</strong>, and <strong>Topic</strong> with automated question generation and real-time evaluation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchMockTests}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition cursor-pointer"
              title="Refresh Tests"
            >
              🔄 Sync
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-linear-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-900/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>+ Create Mock Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar: Exam -> Subject -> Topic -> Type -> Price */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search test title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
          </div>

          {/* Exam Filter */}
          <select
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="all">🏛️ All Rajasthan Exams</option>
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.title}</option>
            ))}
          </select>

          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="all">📚 All Subjects</option>
            {filterSubjects.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>

          {/* Topic Filter */}
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            disabled={subjectFilter === "all" || filterTopics.length === 0}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-purple-500 cursor-pointer disabled:opacity-40"
          >
            <option value="all">
              {subjectFilter === "all" ? "🏷️ Select Subject First" : (filterTopics.length === 0 ? "🏷️ No Topics" : "🏷️ All Topics")}
            </option>
            {filterTopics.map((top) => (
              <option key={top.id} value={top.id}>{top.name}</option>
            ))}
          </select>

          {/* Test Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="all">🏆 All Test Types</option>
            {TEST_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tests Grid */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400">Loading mock test series...</span>
        </div>
      ) : mockTests.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <span className="text-4xl">🏆</span>
          <h3 className="text-sm font-bold text-white mt-3">No Mock Tests Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search || examFilter !== "all" || subjectFilter !== "all" || topicFilter !== "all"
              ? "No test series match your selected criteria. Try resetting filters."
              : "Create your first full-length, sectional, or topic-wise mock test simulation."}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            + Create First Mock Test
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mockTests.map((test) => {
            const testTypeObj = TEST_TYPES.find(t => t.value === test.testType) || TEST_TYPES[0];

            return (
              <div
                key={test.id}
                className="bg-slate-900/70 border border-slate-800/80 hover:border-purple-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-md"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${testTypeObj.badgeColor}`}>
                      {testTypeObj.label}
                    </span>

                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                      test.isFree ? "bg-emerald-950 text-emerald-300 border border-emerald-800/40" : "bg-amber-950 text-amber-300 border border-amber-800/40"
                    }`}>
                      {test.isFree ? "Free Test" : `₹${test.price}`}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                    {test.title}
                  </h3>

                  {/* Hierarchy Badges: Exam -> Subject -> Topic */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center gap-1">
                      <span>{test.exam?.icon || "🏛️"}</span>
                      <span>{test.exam?.title || "Exam"}</span>
                    </span>

                    {test.subjectRef?.name && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-950/70 text-blue-300 border border-blue-800/40 text-[10px] font-bold flex items-center gap-1">
                        <span>📚</span>
                        <span>{test.subjectRef.name}</span>
                      </span>
                    )}

                    {test.topic?.name && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950/70 text-emerald-300 border border-emerald-800/40 text-[10px] font-bold flex items-center gap-1">
                        <span>🏷️</span>
                        <span>{test.topic.name}</span>
                      </span>
                    )}
                  </div>

                  {/* Test Metrics */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3.5 bg-slate-950 rounded-xl border border-slate-800/80 text-center mt-3.5 text-xs">
                    <div>
                      <div className="font-black text-purple-400">{test.durationMinutes}m</div>
                      <div className="text-[10px] text-slate-500">Duration</div>
                    </div>
                    <div className="border-x border-slate-800">
                      <div className="font-black text-emerald-400">{test.totalMarks}</div>
                      <div className="text-[10px] text-slate-500">Marks</div>
                    </div>
                    <div>
                      <div className="font-black text-blue-400">{test.totalQuestions || 0}</div>
                      <div className="text-[10px] text-slate-500">Questions</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3">
                    <span>⚠️ Neg: -{test.negativeMarking || 0.33}</span>
                    <span>👥 {test.totalAttempts || 0} Attempts</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenQuestionManager(test)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>📑 Manage Questions</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(test)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                      title="Edit Test Settings"
                    >
                      ✏️
                    </button>
                    {deleteConfirmId === test.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDeleteTest(test.id)}
                          className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-1 rounded bg-slate-800 text-slate-400 text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(test.id)}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/30 text-xs transition cursor-pointer"
                        title="Delete Test"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT TEST MODAL ACCORDING TO EXAM, SUBJECT, & TOPIC */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🏆</span>
                  <span>{editingTest ? "Edit Mock Test Series" : "Create Mock Test (Exam ➔ Subject ➔ Topic)"}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure test by target Exam, optional Subject, and Topic with auto question generation.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveTest} className="space-y-4">
              {/* Exam, Subject, and Topic Hierarchy Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                {/* Exam Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    1. Target Exam *
                  </label>
                  <select
                    required
                    value={formData.examId}
                    onChange={(e) => handleFormExamChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="">-- Choose Exam --</option>
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>{ex.title}</option>
                    ))}
                  </select>
                </div>

                {/* Subject Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1 flex items-center justify-between">
                    <span>2. Subject</span>
                    <span className="text-[10px] text-purple-400 font-semibold">Sectional</span>
                  </label>
                  <select
                    value={formData.subjectId || ""}
                    onChange={(e) => handleFormSubjectChange(e.target.value)}
                    disabled={!formData.examId}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-purple-500 cursor-pointer disabled:opacity-40"
                  >
                    <option value="">-- All Subjects / Full Exam --</option>
                    {formSubjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>📚 {sub.name}</option>
                    ))}
                  </select>
                </div>

                {/* Topic Dropdown & Custom Topic Creator */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300 uppercase">
                      3. Topic
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomTopicMode(!isCustomTopicMode);
                        if (!isCustomTopicMode) {
                          setFormData(prev => ({ ...prev, topicId: "" }));
                        }
                      }}
                      className="text-[10px] text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
                    >
                      {isCustomTopicMode ? "⬅ Select Existing" : "+ Create Custom"}
                    </button>
                  </div>

                  {isCustomTopicMode ? (
                    <input
                      type="text"
                      placeholder="e.g. Constituent Assembly"
                      value={formData.customTopicName || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, customTopicName: e.target.value, topicId: "" }))}
                      className="w-full bg-slate-900 border border-purple-500 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-purple-400 placeholder:text-slate-500"
                    />
                  ) : (
                    <select
                      value={formData.topicId || ""}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setIsCustomTopicMode(true);
                          setFormData(prev => ({ ...prev, topicId: "" }));
                        } else {
                          setFormData(prev => ({ ...prev, topicId: e.target.value, customTopicName: "" }));
                        }
                      }}
                      disabled={!formData.subjectId}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-purple-500 cursor-pointer disabled:opacity-40"
                    >
                      <option value="">
                        {!formData.subjectId ? "-- Choose Subject First --" : (formTopics.length === 0 ? "-- No Topics --" : "-- All Topics / Full Subject --")}
                      </option>
                      {formTopics.map((top) => (
                        <option key={top.id} value={top.id}>🏷️ {top.name}</option>
                      ))}
                      {formData.subjectId && (
                        <option value="__custom__" className="text-purple-400 font-bold">
                          ➕ + Create Custom Topic...
                        </option>
                      )}
                    </select>
                  )}
                </div>
              </div>

              {/* Title & Test Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Mock Test Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RAS Prelims 2024: Rajasthan History Topic Test - 01"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Test Format Type</label>
                  <select
                    value={formData.testType}
                    onChange={(e) => setFormData(prev => ({ ...prev, testType: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {TEST_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Numerical Parameters: Duration, Marks, Negative, Passing */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalMarks: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Negative Mark</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.negativeMarking}
                    onChange={(e) => setFormData(prev => ({ ...prev, negativeMarking: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Passing Score</label>
                  <input
                    type="number"
                    value={formData.passingMarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, passingMarks: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Auto Generate Option on Creation */}
              {!editingTest && (
                <div className="p-4 bg-purple-950/30 border border-purple-800/40 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="autoGenCheck"
                      checked={formData.autoGenerate}
                      onChange={(e) => setFormData(prev => ({ ...prev, autoGenerate: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                    />
                    <label htmlFor="autoGenCheck" className="text-xs font-bold text-purple-200 cursor-pointer">
                      ⚡ Automatically populate questions from Question Bank matching Exam / Subject / Topic
                    </label>
                  </div>

                  {formData.autoGenerate && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-purple-800/30">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Number of questions to pull:
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={formData.autoPopulateCount}
                          onChange={(e) => setFormData(prev => ({ ...prev, autoPopulateCount: parseInt(e.target.value) || 20 }))}
                          className="w-full bg-slate-950 border border-purple-800/60 text-slate-200 text-xs rounded-lg px-3 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Difficulty Level:
                        </label>
                        <select
                          value={formData.difficultyLevel}
                          onChange={(e) => setFormData(prev => ({ ...prev, difficultyLevel: e.target.value }))}
                          className="w-full bg-slate-950 border border-purple-800/60 text-slate-200 text-xs rounded-lg px-3 py-1.5"
                        >
                          <option value="all">Mixed / All Levels</option>
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Test Instructions</label>
                <textarea
                  rows={2}
                  value={formData.instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 outline-none focus:border-purple-500"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  {isSaving ? "Saving..." : editingTest ? "Update Test" : "Create Test"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUESTION MANAGER MODAL - Auto-Populate by Topic, Subject, & Exam */}
      {isQuestionManagerOpen && selectedTestForQuestions && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>📑</span>
                  <span>Questions in {selectedTestForQuestions.title}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Currently mapped: <strong>{selectedTestForQuestions.questions?.length || 0}</strong> questions
                </p>
              </div>
              <button onClick={() => setIsQuestionManagerOpen(false)} className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer">✕</button>
            </div>

            {/* Auto Populate Bar (Configured by Exam, Subject, Topic) */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>Auto-Populate from Question Bank (by Exam, Subject, Topic)</span>
                </span>
                <span className="text-[11px] text-slate-400">Picks random questions matching selected criteria</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                {/* Auto Populate Exam */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Exam</label>
                  <select
                    value={autoPopulateConfig.examId}
                    onChange={(e) => handleAutoPopulateExamChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {exams.map(ex => (
                      <option key={ex.id} value={ex.id}>{ex.shortName || ex.title}</option>
                    ))}
                  </select>
                </div>

                {/* Auto Populate Subject */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Subject</label>
                  <select
                    value={autoPopulateConfig.subjectId || ""}
                    onChange={(e) => handleAutoPopulateSubjectChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">All Subjects</option>
                    {autoPopulateSubjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>

                {/* Auto Populate Topic */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Topic</label>
                  <select
                    value={autoPopulateConfig.topicId || ""}
                    onChange={(e) => setAutoPopulateConfig(prev => ({ ...prev, topicId: e.target.value }))}
                    disabled={!autoPopulateConfig.subjectId}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-40"
                  >
                    <option value="">All Topics</option>
                    {autoPopulateTopics.map(top => (
                      <option key={top.id} value={top.id}>{top.name}</option>
                    ))}
                  </select>
                </div>

                {/* Questions Count & Action */}
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Count</label>
                    <input
                      type="number"
                      min="1"
                      max="150"
                      value={autoPopulateConfig.count}
                      onChange={(e) => setAutoPopulateConfig(prev => ({ ...prev, count: parseInt(e.target.value) || 10 }))}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs px-2 py-1.5 rounded-lg text-center font-bold"
                    />
                  </div>
                  <button
                    onClick={handleAutoPopulate}
                    disabled={isSaving}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer shrink-0"
                  >
                    {isSaving ? "Populating..." : "Auto Populate"}
                  </button>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {!selectedTestForQuestions.questions || selectedTestForQuestions.questions.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-400">No questions mapped yet. Use "Auto Populate" above to pull questions matching Exam / Subject / Topic.</p>
                </div>
              ) : (
                selectedTestForQuestions.questions.map((q, qIdx) => (
                  <div key={q.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold font-mono text-[10px]">
                          Q{qIdx + 1}
                        </span>
                        <span className="font-semibold text-slate-200">{q.questionHindi || q.questionEnglish}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-1">
                        {q.subjectRef?.name && (
                          <span className="px-2 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800/40 text-[10px]">
                            📚 {q.subjectRef.name}
                          </span>
                        )}
                        {q.topic?.name && (
                          <span className="px-2 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40 text-[10px]">
                            🏷️ {q.topic.name}
                          </span>
                        )}
                        <span>Answer: <strong className="text-emerald-400">{q.correctAnswer}</strong></span>
                        <span>Level: {q.difficultyLevel}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 text-xs shrink-0 cursor-pointer"
                      title="Remove from test"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0">
              <button
                onClick={() => setIsQuestionManagerOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
