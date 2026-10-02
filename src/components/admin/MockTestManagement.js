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

  // Form State
  const [formData, setFormData] = useState({
    examId: "",
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
    status: "published"
  });

  // Auto Populate Form State
  const [autoPopulateConfig, setAutoPopulateConfig] = useState({ count: 20, difficultyLevel: "medium" });

  // Load exams
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await examService.getExams({ limit: 100 });
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

  // Fetch Tests List
  const fetchMockTests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await mockTestService.getAllTests({
        page: pagination.currentPage,
        limit: 12,
        search,
        examId: examFilter,
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
  }, [pagination.currentPage, search, examFilter, typeFilter, isFreeFilter, showToast]);

  useEffect(() => {
    fetchMockTests();
  }, [fetchMockTests]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingTest(null);
    setFormData({
      examId: exams[0]?.id || "",
      title: "",
      testType: "full_length",
      durationMinutes: 180,
      totalMarks: 200,
      totalQuestions: 150,
      negativeMarking: 0.33,
      passingMarks: 70,
      instructions: "1. All questions carry equal marks.\n2. Negative marking of 0.33 applies for every incorrect answer.\n3. Do not refresh or close the browser tab during the test.",
      isFree: true,
      price: 0,
      status: "published"
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (test) => {
    setEditingTest(test);
    setFormData({
      examId: test.examId || "",
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
      status: test.status || "published"
    });
    setIsModalOpen(true);
  };

  // Open Question Manager
  const handleOpenQuestionManager = async (test) => {
    try {
      const res = await mockTestService.getTestById(test.id);
      if (res.data?.mockTest) {
        setSelectedTestForQuestions(res.data.mockTest);
        setIsQuestionManagerOpen(true);
      }
    } catch (err) {
      showToast?.("error", err.message || "Failed to load test questions");
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
        await mockTestService.createTest(formData);
        showToast?.("success", "Mock Test created successfully 🎯");
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

  // Auto populate questions
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
              Create full-length exam simulations, sectional tests, and timed practice sessions with instant score evaluation.
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

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
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

        <select
          value={examFilter}
          onChange={(e) => setExamFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="all">All Rajasthan Exams</option>
          {exams.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.title}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="all">All Test Types</option>
          {TEST_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <select
          value={isFreeFilter}
          onChange={(e) => setIsFreeFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="all">Free & Premium Tests</option>
          <option value="true">🆓 Free Only</option>
          <option value="false">💎 Premium Test Series</option>
        </select>
      </div>

      {/* Tests Grid */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-medium">Loading test series...</span>
        </div>
      ) : mockTests.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800">
          <span className="text-4xl">🏆</span>
          <h3 className="text-sm font-bold text-white mt-3">No Mock Tests Created</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Create full-length exam mock papers or topic quizzes for Rajasthan aspirants.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            + Create First Mock Test
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTests.map((test) => {
            const typeObj = TEST_TYPES.find(t => t.value === test.testType) || TEST_TYPES[0];

            return (
              <div
                key={test.id}
                className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-md group"
              >
                <div>
                  {/* Top Bar: Exam badge & Type */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800/40 text-[10px] font-bold">
                      {test.exam?.shortName || test.exam?.title || "Exam"}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeObj.badgeColor}`}>
                      {typeObj.label.split(" ")[1] || "Test"}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-white mt-3 group-hover:text-purple-300 transition-colors line-clamp-1">
                    {test.title}
                  </h3>

                  {/* Specs Matrix */}
                  <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70 text-center text-xs">
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

      {/* CREATE / EDIT TEST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingTest ? "Edit Mock Test Series" : "Create New Mock Test"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure test duration, marks, negative marking, and guidelines.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-lg p-1">✕</button>
            </div>

            <form onSubmit={handleSaveTest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Target Exam *</label>
                  <select
                    required
                    value={formData.examId}
                    onChange={(e) => setFormData(prev => ({ ...prev, examId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-purple-500"
                  >
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>{ex.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Test Type</label>
                  <select
                    value={formData.testType}
                    onChange={(e) => setFormData(prev => ({ ...prev, testType: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-purple-500"
                  >
                    {TEST_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Mock Test Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RAS Prelims 2024 Full Length Mock Test - 01"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalMarks: parseFloat(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Negative Mark</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.negativeMarking}
                    onChange={(e) => setFormData(prev => ({ ...prev, negativeMarking: parseFloat(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Passing Score</label>
                  <input
                    type="number"
                    value={formData.passingMarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, passingMarks: parseFloat(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Test Instructions</label>
                <textarea
                  rows={3}
                  value={formData.instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 outline-none focus:border-purple-500"
                />
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
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
                >
                  {isSaving ? "Saving..." : editingTest ? "Update Test" : "Create Test"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUESTION MANAGER MODAL */}
      {isQuestionManagerOpen && selectedTestForQuestions && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>📑</span>
                  <span>Questions in {selectedTestForQuestions.title}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Currently mapped: {selectedTestForQuestions.questions?.length || 0} questions
                </p>
              </div>
              <button onClick={() => setIsQuestionManagerOpen(false)} className="text-slate-400 hover:text-white text-lg p-1">✕</button>
            </div>

            {/* Auto Populate Bar */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div>
                <span className="text-xs font-bold text-slate-200">⚡ Auto-Populate from Question Bank</span>
                <p className="text-[11px] text-slate-400">Picks random questions matching this exam.</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={autoPopulateConfig.count}
                  onChange={(e) => setAutoPopulateConfig(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                  className="w-16 bg-slate-900 border border-slate-800 text-slate-200 text-xs px-2 py-1.5 rounded-lg text-center font-bold"
                  title="Number of questions"
                />
                <button
                  onClick={handleAutoPopulate}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer"
                >
                  {isSaving ? "Populating..." : "Auto Populate"}
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {!selectedTestForQuestions.questions || selectedTestForQuestions.questions.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-400">No questions mapped yet. Click "Auto Populate" above to pull from Question Bank.</p>
                </div>
              ) : (
                selectedTestForQuestions.questions.map((q, qIdx) => (
                  <div key={q.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold font-mono text-[10px]">
                          Q{qIdx + 1}
                        </span>
                        <span className="font-semibold text-slate-200">{q.questionHindi || q.questionEnglish}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                        <span>Answer: <strong className="text-emerald-400">{q.correctAnswer}</strong></span>
                        <span>Difficulty: {q.difficultyLevel}</span>
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
