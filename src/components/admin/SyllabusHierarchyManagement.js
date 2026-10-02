"use client";

import { useState, useEffect, useCallback } from "react";
import syllabusService from "@/services/syllabusService";
import examService from "@/services/examService";

export default function SyllabusHierarchyManagement({ initialExamId = null }) {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(initialExamId || "");
  const [hierarchyData, setHierarchyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Expanded nodes state
  const [expandedStages, setExpandedStages] = useState({});
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [stageModal, setStageModal] = useState({ isOpen: false, isEditing: false, data: {} });
  const [subjectModal, setSubjectModal] = useState({ isOpen: false, isEditing: false, stageId: null, data: {} });
  const [topicModal, setTopicModal] = useState({ isOpen: false, isEditing: false, subjectId: null, data: {} });
  const [itemModal, setItemModal] = useState({ isOpen: false, isEditing: false, stageId: null, subjectId: null, topicId: null, data: {} });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isOpen: false, type: "", id: "", title: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (type, message) => {
    setToastMessage({ type, message });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load all exams for dropdown
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await examService.getAllExams({ limit: 100 });
        if (res.exams) {
          setExams(res.exams);
          if (!selectedExamId && res.exams.length > 0) {
            setSelectedExamId(res.exams[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load exams:", err);
      }
    };
    fetchExams();
  }, [selectedExamId]);

  // Load hierarchy tree when exam changes
  const loadHierarchy = useCallback(async () => {
    if (!selectedExamId) return;
    setIsLoading(true);
    try {
      const res = await syllabusService.getExamHierarchy(selectedExamId);
      const data = res?.data?.stages !== undefined ? res.data : (res?.data || res);
      if (data && data.stages) {
        setHierarchyData(data);
        // Auto-expand first stage if present
        if (data.stages.length > 0) {
          setExpandedStages(prev => ({
            ...prev,
            [data.stages[0].id]: true
          }));
        }
      }
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to load syllabus hierarchy");
    } finally {
      setIsLoading(false);
    }
  }, [selectedExamId]);

  useEffect(() => {
    loadHierarchy();
  }, [loadHierarchy]);

  // Node toggle helpers
  const toggleStage = (id) => setExpandedStages(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleSubject = (id) => setExpandedSubjects(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleTopic = (id) => setExpandedTopics(prev => ({ ...prev, [id]: !prev[id] }));

  // Stage Handlers
  const handleSaveStage = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (stageModal.isEditing) {
        await syllabusService.updateStage(stageModal.data.id, stageModal.data);
        showToast("success", "Stage updated successfully ✏️");
      } else {
        await syllabusService.createStage(selectedExamId, stageModal.data);
        showToast("success", "Stage added successfully 🏛️");
      }
      setStageModal({ isOpen: false, isEditing: false, data: {} });
      loadHierarchy();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to save stage");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Subject Handlers
  const handleSaveSubject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (subjectModal.isEditing) {
        await syllabusService.updateSubject(subjectModal.data.id, subjectModal.data);
        showToast("success", "Subject updated successfully ✏️");
      } else {
        await syllabusService.createSubject({
          ...subjectModal.data,
          examId: selectedExamId,
          stageId: subjectModal.stageId
        });
        showToast("success", "Subject added successfully 📚");
      }
      setSubjectModal({ isOpen: false, isEditing: false, stageId: null, data: {} });
      loadHierarchy();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to save subject");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Topic Handlers
  const handleSaveTopic = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (topicModal.isEditing) {
        await syllabusService.updateTopic(topicModal.data.id, topicModal.data);
        showToast("success", "Topic updated successfully ✏️");
      } else {
        await syllabusService.createTopic({
          ...topicModal.data,
          subjectId: topicModal.subjectId
        });
        showToast("success", "Topic added successfully 📑");
      }
      setTopicModal({ isOpen: false, isEditing: false, subjectId: null, data: {} });
      loadHierarchy();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to save topic");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Syllabus Item Handlers
  const handleSaveItem = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (itemModal.isEditing) {
        await syllabusService.updateSyllabusItem(itemModal.data.id, itemModal.data);
        showToast("success", "Syllabus item updated successfully ✏️");
      } else {
        await syllabusService.createSyllabusItem({
          ...itemModal.data,
          examId: selectedExamId,
          stageId: itemModal.stageId,
          subjectId: itemModal.subjectId,
          topicId: itemModal.topicId || null
        });
        showToast("success", "Syllabus item added successfully 🎯");
      }
      setItemModal({ isOpen: false, isEditing: false, stageId: null, subjectId: null, topicId: null, data: {} });
      loadHierarchy();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to save syllabus item");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Action Dispatcher
  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      const { type, id } = deleteConfirmModal;
      if (type === "stage") await syllabusService.deleteStage(id);
      else if (type === "subject") await syllabusService.deleteSubject(id);
      else if (type === "topic") await syllabusService.deleteTopic(id);
      else if (type === "item") await syllabusService.deleteSyllabusItem(id);

      showToast("success", `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully 🗑️`);
      setDeleteConfirmModal({ isOpen: false, type: "", id: "", title: "" });
      loadHierarchy();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to delete item");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute Total Metrics for hierarchy
  const stages = hierarchyData?.stages || [];
  const totalSubjects = stages.reduce((acc, s) => acc + (s.subjects?.length || 0), 0);
  const totalTopics = stages.reduce((acc, s) => acc + (s.subjects || []).reduce((tAcc, sub) => tAcc + (sub.topics?.length || 0), 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`p-4 rounded-xl shadow-xl border flex items-center justify-between text-xs font-semibold backdrop-blur-md animate-fade-in ${
          toastMessage.type === "success" 
            ? "bg-emerald-950/90 text-emerald-200 border-emerald-800/80" 
            : "bg-rose-950/90 text-rose-200 border-rose-800/80"
        }`}>
          <div className="flex items-center gap-2">
            <span>{toastMessage.type === "success" ? "✅" : "⚠️"}</span>
            <span>{toastMessage.message}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)} 
            className="ml-4 text-slate-400 hover:text-white font-bold text-base cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header & Exam Selection Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <span>🏛️</span>
              <span>Exam Stage & Syllabus Architecture</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Structure multi-tier exam stages (Prelims, Mains, Interview), official subjects, chapters, and topics hierarchy.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Exam:</label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-red-500 cursor-pointer max-w-xs truncate"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id} className="bg-slate-900 text-slate-200">
                    {ex.title} ({ex.shortName || ex.category})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setStageModal({
                isOpen: true,
                isEditing: false,
                data: { name: "", stageOrder: stages.length + 1, totalMarks: 200, durationMinutes: 180, negativeMarking: 0.33, status: "active" }
              })}
              className="px-4 py-2 bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-bold shadow-md shadow-red-900/30 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ Add Exam Stage</span>
            </button>
          </div>
        </div>

        {/* Quick Hierarchy Summary Cards */}
        {hierarchyData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selected Exam</span>
              <p className="text-sm font-bold text-white truncate mt-1">{hierarchyData.title}</p>
            </div>
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Exam Stages</span>
              <p className="text-xl font-black text-amber-400 mt-1">{stages.length}</p>
            </div>
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Total Subjects</span>
              <p className="text-xl font-black text-blue-400 mt-1">{totalSubjects}</p>
            </div>
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Total Topics / Units</span>
              <p className="text-xl font-black text-emerald-400 mt-1">{totalTopics}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Hierarchy Tree View */}
      {isLoading ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-16 text-center">
          <div className="w-9 h-9 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold text-slate-400">Loading syllabus hierarchy...</p>
        </div>
      ) : stages.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-base font-bold text-white">No Exam Stages Configured</h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto">
            This exam does not have any stages configured yet. Click "Add Exam Stage" above to create Prelims, Mains, or Paper tiers.
          </p>
          <button
            onClick={() => setStageModal({
              isOpen: true,
              isEditing: false,
              data: { name: "Preliminary Examination", stageOrder: 1, totalMarks: 200, durationMinutes: 180, negativeMarking: 0.33, status: "active" }
            })}
            className="mt-4 px-4 py-2 bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-bold shadow-md shadow-red-900/30 transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ Create First Stage</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {stages.map((stage) => {
            const isStageExpanded = expandedStages[stage.id];
            const subjects = stage.subjects || [];

            return (
              <div key={stage.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg overflow-hidden transition-all">
                {/* Stage Header Bar */}
                <div className="p-4 bg-slate-950/80 border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => toggleStage(stage.id)}>
                    <button className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold hover:bg-slate-800 hover:text-white transition-colors cursor-pointer">
                      {isStageExpanded ? "▼" : "▶"}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-red-950/80 text-red-300 border border-red-800/60 text-[10px] font-bold uppercase tracking-wider">
                          Tier {stage.stageOrder}
                        </span>
                        <h3 className="text-sm font-bold text-white">{stage.name}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span>⏱️ {stage.durationMinutes || "N/A"} mins</span>
                        <span>🎯 Marks: {stage.totalMarks || 0}</span>
                        <span>⚠️ Negative: {stage.negativeMarking || 0}</span>
                        <span>📚 {subjects.length} Subjects</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSubjectModal({
                        isOpen: true,
                        isEditing: false,
                        stageId: stage.id,
                        data: { name: "", code: "", totalMarks: 100, displayOrder: subjects.length + 1, status: "active" }
                      })}
                      className="px-3 py-1.5 bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800/70 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      ➕ Add Subject
                    </button>
                    <button
                      onClick={() => setStageModal({
                        isOpen: true,
                        isEditing: true,
                        data: stage
                      })}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
                      title="Edit Stage"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirmModal({
                        isOpen: true,
                        type: "stage",
                        id: stage.id,
                        title: `Stage: ${stage.name}`
                      })}
                      className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/70 rounded-lg text-xs font-medium transition cursor-pointer"
                      title="Delete Stage"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Stage Children: Subjects */}
                {isStageExpanded && (
                  <div className="p-4 space-y-3 bg-slate-950/40">
                    {subjects.length === 0 ? (
                      <div className="p-6 text-center border-2 border-dashed border-slate-800/80 rounded-xl">
                        <p className="text-xs text-slate-400">No subjects added to this stage yet.</p>
                      </div>
                    ) : (
                      subjects.map((subject) => {
                        const isSubjectExpanded = expandedSubjects[subject.id];
                        const topics = subject.topics || [];
                        const subjectSyllabus = subject.syllabusItems || [];

                        return (
                          <div key={subject.id} className="bg-slate-900/90 rounded-xl border border-slate-800/90 shadow-xs overflow-hidden">
                            {/* Subject Header */}
                            <div className="p-3.5 bg-slate-900 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70">
                              <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => toggleSubject(subject.id)}>
                                <button className="w-6 h-6 rounded-md bg-slate-950 border border-slate-800 text-slate-400 flex items-center justify-center text-xs font-semibold hover:text-white cursor-pointer">
                                  {isSubjectExpanded ? "▼" : "▶"}
                                </button>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-bold text-white">{subject.name}</h4>
                                    {subject.code && (
                                      <span className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 text-[10px] font-mono">
                                        {subject.code}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                                    <span>🎯 {subject.totalMarks ? `${subject.totalMarks} Marks` : "Marks not set"}</span>
                                    <span>📑 {topics.length} Topics</span>
                                    <span>📝 {subjectSyllabus.length} Syllabus Items</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setTopicModal({
                                    isOpen: true,
                                    isEditing: false,
                                    subjectId: subject.id,
                                    data: { name: "", estimatedHours: 4, difficultyLevel: "medium", status: "active" }
                                  })}
                                  className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/70 rounded-md text-xs font-semibold transition cursor-pointer"
                                >
                                  ➕ Add Topic
                                </button>
                                <button
                                  onClick={() => setItemModal({
                                    isOpen: true,
                                    isEditing: false,
                                    stageId: stage.id,
                                    subjectId: subject.id,
                                    topicId: null,
                                    data: { title: "", importance: "high", weightage: 5, status: "active" }
                                  })}
                                  className="px-2.5 py-1 bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800/70 rounded-md text-xs font-semibold transition cursor-pointer"
                                >
                                  ➕ Add Syllabus Item
                                </button>
                                <button
                                  onClick={() => setSubjectModal({
                                    isOpen: true,
                                    isEditing: true,
                                    stageId: stage.id,
                                    data: subject
                                  })}
                                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium cursor-pointer"
                                  title="Edit Subject"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmModal({
                                    isOpen: true,
                                    type: "subject",
                                    id: subject.id,
                                    title: `Subject: ${subject.name}`
                                  })}
                                  className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/70 rounded-md text-xs font-medium cursor-pointer"
                                  title="Delete Subject"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>

                            {/* Subject Children: Topics and Syllabus */}
                            {isSubjectExpanded && (
                              <div className="p-3 bg-slate-950/60 space-y-3 border-t border-slate-800/70">
                                {/* Topics List */}
                                <div className="space-y-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Units & Chapters ({topics.length})
                                  </span>

                                  {topics.length === 0 ? (
                                    <p className="text-xs text-slate-500 italic">No topics created under this subject.</p>
                                  ) : (
                                    topics.map((topic) => {
                                      const isTopicExpanded = expandedTopics[topic.id];
                                      const topicItems = topic.syllabusItems || [];

                                      return (
                                        <div key={topic.id} className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => toggleTopic(topic.id)}>
                                              <span className="text-[10px] text-slate-500">{isTopicExpanded ? "▼" : "▶"}</span>
                                              <span className="font-bold text-slate-200">{topic.name}</span>
                                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                                                topic.difficultyLevel === "hard" ? "bg-rose-950/80 text-rose-300 border-rose-800/60" :
                                                topic.difficultyLevel === "medium" ? "bg-amber-950/80 text-amber-300 border-amber-800/60" :
                                                "bg-emerald-950/80 text-emerald-300 border-emerald-800/60"
                                              }`}>
                                                {topic.difficultyLevel}
                                              </span>
                                              {topic.estimatedHours > 0 && (
                                                <span className="text-slate-400 text-[11px]">⏳ {topic.estimatedHours} hrs</span>
                                              )}
                                            </div>

                                            <div className="flex items-center gap-1">
                                              <button
                                                onClick={() => setItemModal({
                                                  isOpen: true,
                                                  isEditing: false,
                                                  stageId: stage.id,
                                                  subjectId: subject.id,
                                                  topicId: topic.id,
                                                  data: { title: "", importance: "medium", weightage: 2, status: "active" }
                                                })}
                                                className="px-1.5 py-0.5 bg-purple-950/80 text-purple-300 hover:bg-purple-900 border border-purple-800/60 rounded text-[10px] font-semibold cursor-pointer"
                                              >
                                                + Item
                                              </button>
                                              <button
                                                onClick={() => setTopicModal({
                                                  isOpen: true,
                                                  isEditing: true,
                                                  subjectId: subject.id,
                                                  data: topic
                                                })}
                                                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
                                              >
                                                ✏️
                                              </button>
                                              <button
                                                onClick={() => setDeleteConfirmModal({
                                                  isOpen: true,
                                                  type: "topic",
                                                  id: topic.id,
                                                  title: `Topic: ${topic.name}`
                                                })}
                                                className="p-1 hover:bg-rose-900 rounded text-rose-400 cursor-pointer"
                                              >
                                                🗑️
                                              </button>
                                            </div>
                                          </div>

                                          {/* Topic Sub-items */}
                                          {isTopicExpanded && topicItems.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-slate-800/80 pl-4 space-y-1.5">
                                              {topicItems.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/80 p-2 rounded-lg border border-slate-800/60">
                                                  <span>• {item.title}</span>
                                                  <div className="flex items-center gap-2">
                                                    {item.weightage > 0 && <span className="text-amber-400 font-semibold">{item.weightage}% weightage</span>}
                                                    <button
                                                      onClick={() => setItemModal({ isOpen: true, isEditing: true, data: item })}
                                                      className="hover:underline text-blue-400 cursor-pointer"
                                                    >
                                                      Edit
                                                    </button>
                                                    <button
                                                      onClick={() => setDeleteConfirmModal({ isOpen: true, type: "item", id: item.id, title: item.title })}
                                                      className="hover:underline text-rose-400 cursor-pointer"
                                                    >
                                                      Delete
                                                    </button>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* STAGE MODAL */}
      {stageModal.isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 animate-scale-in">
            <h3 className="text-base font-bold text-white mb-4">
              {stageModal.isEditing ? "Edit Exam Stage" : "Add New Exam Stage"}
            </h3>
            <form onSubmit={handleSaveStage} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Stage Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Preliminary Examination, Mains Examination, Interview"
                  value={stageModal.data.name || ""}
                  onChange={(e) => setStageModal(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Stage Order</label>
                  <input
                    type="number"
                    min="1"
                    value={stageModal.data.stageOrder || 1}
                    onChange={(e) => setStageModal(prev => ({ ...prev, data: { ...prev.data, stageOrder: parseInt(e.target.value) } }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="180"
                    value={stageModal.data.durationMinutes || ""}
                    onChange={(e) => setStageModal(prev => ({ ...prev, data: { ...prev.data, durationMinutes: parseInt(e.target.value) } }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Total Marks</label>
                  <input
                    type="number"
                    step="any"
                    value={stageModal.data.totalMarks || 0}
                    onChange={(e) => setStageModal(prev => ({ ...prev, data: { ...prev.data, totalMarks: parseFloat(e.target.value) } }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Negative Marking (Penalty)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.33"
                    value={stageModal.data.negativeMarking || 0}
                    onChange={(e) => setStageModal(prev => ({ ...prev, data: { ...prev.data, negativeMarking: parseFloat(e.target.value) } }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStageModal({ isOpen: false, isEditing: false, data: {} })}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : stageModal.isEditing ? "Update Stage" : "Save Stage"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBJECT MODAL */}
      {subjectModal.isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 animate-scale-in">
            <h3 className="text-base font-bold text-white mb-4">
              {subjectModal.isEditing ? "Edit Subject" : "Add Subject to Stage"}
            </h3>
            <form onSubmit={handleSaveSubject} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajasthan History, Art & Culture"
                  value={subjectModal.data.name || ""}
                  onChange={(e) => setSubjectModal(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Subject Code</label>
                  <input
                    type="text"
                    placeholder="e.g. RAJ-HIST"
                    value={subjectModal.data.code || ""}
                    onChange={(e) => setSubjectModal(prev => ({ ...prev, data: { ...prev.data, code: e.target.value } }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Subject Marks</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={subjectModal.data.totalMarks || ""}
                    onChange={(e) => setSubjectModal(prev => ({ ...prev, data: { ...prev.data, totalMarks: parseFloat(e.target.value) } }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSubjectModal({ isOpen: false, isEditing: false, stageId: null, data: {} })}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : subjectModal.isEditing ? "Update Subject" : "Save Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOPIC MODAL */}
      {topicModal.isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 animate-scale-in">
            <h3 className="text-base font-bold text-white mb-4">
              {topicModal.isEditing ? "Edit Topic" : "Add Chapter / Topic"}
            </h3>
            <form onSubmit={handleSaveTopic} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Topic Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Major Dynasties of Rajasthan & Historical Monuments"
                  value={topicModal.data.name || ""}
                  onChange={(e) => setTopicModal(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Difficulty Level</label>
                  <select
                    value={topicModal.data.difficultyLevel || "medium"}
                    onChange={(e) => setTopicModal(prev => ({ ...prev, data: { ...prev.data, difficultyLevel: e.target.value } }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="4"
                    value={topicModal.data.estimatedHours || ""}
                    onChange={(e) => setTopicModal(prev => ({ ...prev, data: { ...prev.data, estimatedHours: parseFloat(e.target.value) } }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTopicModal({ isOpen: false, isEditing: false, subjectId: null, data: {} })}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : topicModal.isEditing ? "Update Topic" : "Save Topic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SYLLABUS ITEM MODAL */}
      {itemModal.isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 animate-scale-in">
            <h3 className="text-base font-bold text-white mb-4">
              {itemModal.isEditing ? "Edit Syllabus Item" : "Add Syllabus Item"}
            </h3>
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Title / Key Point *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Architectural Heritage of Forts: Chittorgarh, Mehrangarh, Kumbhalgarh"
                  value={itemModal.data.title || ""}
                  onChange={(e) => setItemModal(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Importance</label>
                  <select
                    value={itemModal.data.importance || "medium"}
                    onChange={(e) => setItemModal(prev => ({ ...prev, data: { ...prev.data, importance: e.target.value } }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="very_high">Very High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Weightage Score / %</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="5"
                    value={itemModal.data.weightage || ""}
                    onChange={(e) => setItemModal(prev => ({ ...prev, data: { ...prev.data, weightage: parseFloat(e.target.value) } }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setItemModal({ isOpen: false, isEditing: false, stageId: null, subjectId: null, topicId: null, data: {} })}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-linear-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : itemModal.isEditing ? "Update Item" : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800 text-center animate-scale-in">
            <div className="w-12 h-12 bg-rose-950/80 text-rose-400 border border-rose-800/80 rounded-full flex items-center justify-center text-xl mx-auto mb-3">
              ⚠️
            </div>
            <h3 className="text-base font-bold text-white">Confirm Deletion</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">{deleteConfirmModal.title}</strong>? All child subjects, topics, and syllabus items underneath will also be removed permanently.
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmModal({ isOpen: false, type: "", id: "", title: "" })}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-linear-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {isSubmitting ? "Deleting..." : "Yes, Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
