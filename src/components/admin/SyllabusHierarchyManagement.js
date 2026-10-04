"use client";

import { useState, useEffect, useCallback } from "react";
import syllabusService from "@/services/syllabusService";
import examService from "@/services/examService";

export default function SyllabusHierarchyManagement({ initialExamId = null }) {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(initialExamId || "");
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Expanded nodes state
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [subjectModal, setSubjectModal] = useState({ isOpen: false, isEditing: false, data: {} });
  const [topicModal, setTopicModal] = useState({ isOpen: false, isEditing: false, subjectId: null, data: {} });
  const [itemModal, setItemModal] = useState({ isOpen: false, isEditing: false, subjectId: null, topicId: null, data: {} });
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

  // Load subjects, topics, and syllabus items when exam changes
  const loadHierarchy = useCallback(async () => {
    if (!selectedExamId) return;
    setIsLoading(true);
    try {
      const res = await syllabusService.getExamHierarchy(selectedExamId);
      const data = res?.data || res;
      let subs = [];
      if (Array.isArray(data.subjects) && data.subjects.length > 0) {
        subs = data.subjects;
      } else if (Array.isArray(data.stages)) {
        // Collect from all stages if any
        subs = data.stages.flatMap(st => st.subjects || []);
      }

      // If still empty, try getExamSubjects
      if (subs.length === 0) {
        try {
          const directSubs = await syllabusService.getExamSubjects(selectedExamId);
          subs = Array.isArray(directSubs.data) ? directSubs.data : (Array.isArray(directSubs) ? directSubs : []);
        } catch (_) {}
      }

      setSubjects(subs);
      // Auto-expand all subjects
      const initialExp = {};
      subs.forEach(s => { initialExp[s.id] = true; });
      setExpandedSubjects(initialExp);
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
  const toggleSubject = (id) => setExpandedSubjects(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleTopic = (id) => setExpandedTopics(prev => ({ ...prev, [id]: !prev[id] }));

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
          examId: selectedExamId
        });
        showToast("success", "Subject added successfully 📚");
      }
      setSubjectModal({ isOpen: false, isEditing: false, data: {} });
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
        showToast("success", "Topic added successfully 🏷️");
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
          subjectId: itemModal.subjectId,
          topicId: itemModal.topicId || null
        });
        showToast("success", "Syllabus item added successfully 🎯");
      }
      setItemModal({ isOpen: false, isEditing: false, subjectId: null, topicId: null, data: {} });
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
      if (type === "subject") await syllabusService.deleteSubject(id);
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

  // Filter subjects and topics based on search
  const filteredSubjects = subjects.filter((subject) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchSub = subject.name?.toLowerCase().includes(query) || subject.code?.toLowerCase().includes(query);
    const matchTopic = subject.topics?.some(t => t.name?.toLowerCase().includes(query));
    const matchItem = subject.syllabusItems?.some(i => i.title?.toLowerCase().includes(query));
    return matchSub || matchTopic || matchItem;
  });

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {toastMessage && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
          toastMessage.type === "success"
            ? "bg-emerald-950/80 border-emerald-800 text-emerald-300"
            : "bg-red-950/80 border-red-800 text-red-300"
        }`}>
          <span>{toastMessage.message}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* HEADER BAR: Exam Selection & Quick Action */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              🏛️ Target Exam
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-4 py-2.5 outline-none focus:border-red-500 min-w-[240px] cursor-pointer"
            >
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title} ({exam.category})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 max-w-md">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              🔍 Search Syllabus
            </label>
            <input
              type="text"
              placeholder="Search subjects, topics, or sub-topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-red-500 placeholder-slate-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubjectModal({
              isOpen: true,
              isEditing: false,
              data: { name: "", code: "", totalMarks: 100, displayOrder: subjects.length + 1, status: "active" }
            })}
            className="px-4 py-2.5 bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-900/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>➕ Add Subject</span>
          </button>
        </div>
      </div>

      {/* MAIN SYLLABUS LIST: SUBJECTS -> TOPICS -> ITEMS */}
      {isLoading ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Loading syllabus & topic architecture...</p>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">📚</div>
          <h3 className="text-base font-bold text-white">No Subjects Configured Yet</h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto">
            This exam does not have any subjects or topics configured yet. Click "Add Subject" above to build its syllabus.
          </p>
          <button
            onClick={() => setSubjectModal({
              isOpen: true,
              isEditing: false,
              data: { name: "Rajasthan Polity & Admin", code: "RAJ-POL", totalMarks: 100, displayOrder: 1, status: "active" }
            })}
            className="mt-4 px-4 py-2 bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-bold shadow-md shadow-red-900/30 transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ Create First Subject</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubjects.map((subject) => {
            const isSubjectExpanded = expandedSubjects[subject.id];
            const topics = subject.topics || [];
            const subjectSyllabus = subject.syllabusItems || [];

            return (
              <div key={subject.id} className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-lg overflow-hidden transition-all">
                {/* Subject Header Bar */}
                <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => toggleSubject(subject.id)}>
                    <button className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold hover:bg-slate-800 hover:text-white transition-colors cursor-pointer">
                      {isSubjectExpanded ? "▼" : "▶"}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800/60 text-[10px] font-bold uppercase tracking-wider">
                          📚 Subject #{subject.displayOrder || 1}
                        </span>
                        <h3 className="text-sm font-bold text-white">{subject.name}</h3>
                        {subject.code && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-mono">
                            {subject.code}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span>🎯 {subject.totalMarks ? `${subject.totalMarks} Marks` : "Marks not set"}</span>
                        <span>🏷️ {topics.length} Topics</span>
                        <span>📝 {subjectSyllabus.length} Syllabus Units</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTopicModal({
                        isOpen: true,
                        isEditing: false,
                        subjectId: subject.id,
                        data: { name: "", estimatedHours: 4, difficultyLevel: "medium", status: "active" }
                      })}
                      className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/70 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                    >
                      <span>🏷️</span>
                      <span>+ Add Topic</span>
                    </button>
                    <button
                      onClick={() => setItemModal({
                        isOpen: true,
                        isEditing: false,
                        subjectId: subject.id,
                        topicId: null,
                        data: { title: "", importance: "high", weightage: 5, status: "active" }
                      })}
                      className="px-2.5 py-1.5 bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800/70 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                    >
                      <span>📝</span>
                      <span>+ Add Unit</span>
                    </button>
                    <button
                      onClick={() => setSubjectModal({
                        isOpen: true,
                        isEditing: true,
                        data: subject
                      })}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
                      title="Edit Subject"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirmModal({
                        isOpen: true,
                        type: "subject",
                        id: subject.id,
                        title: `Subject: ${subject.name}`
                      })}
                      className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/70 rounded-lg text-xs font-medium transition cursor-pointer"
                      title="Delete Subject"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Subject Children: Topics and Items */}
                {isSubjectExpanded && (
                  <div className="p-4 space-y-3 bg-slate-950/40">
                    {topics.length === 0 && subjectSyllabus.length === 0 ? (
                      <div className="p-6 text-center border-2 border-dashed border-slate-800/80 rounded-xl">
                        <p className="text-xs text-slate-400">No topics added to this subject yet. Click "+ Add Topic" above.</p>
                      </div>
                    ) : (
                      <>
                        {/* Topics List */}
                        {topics.map((topic) => {
                          const isTopicExpanded = expandedTopics[topic.id];
                          const topicItems = topic.syllabusItems || [];

                          return (
                            <div key={topic.id} className="bg-slate-900/70 rounded-xl border border-slate-800/70 shadow-xs overflow-hidden">
                              <div className="p-3 bg-slate-900/90 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60">
                                <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => toggleTopic(topic.id)}>
                                  <button className="w-5 h-5 rounded bg-slate-950 border border-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-semibold hover:text-white cursor-pointer">
                                    {isTopicExpanded ? "▼" : "▶"}
                                  </button>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-slate-200">🏷️ {topic.name}</span>
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                        topic.difficultyLevel === "hard" ? "bg-red-950/80 text-red-300 border border-red-800/50" :
                                        topic.difficultyLevel === "easy" ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/50" :
                                        "bg-amber-950/80 text-amber-300 border border-amber-800/50"
                                      }`}>
                                        {topic.difficultyLevel || "Medium"}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                      ⏱️ {topic.estimatedHours || 0} Hours • 📝 {topicItems.length} Sub-Topics / Items
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => setItemModal({
                                      isOpen: true,
                                      isEditing: false,
                                      subjectId: subject.id,
                                      topicId: topic.id,
                                      data: { title: "", importance: "high", weightage: 3, status: "active" }
                                    })}
                                    className="px-2 py-1 bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800/60 rounded text-[11px] font-semibold transition cursor-pointer"
                                  >
                                    ➕ Add Sub-Item
                                  </button>
                                  <button
                                    onClick={() => setTopicModal({
                                      isOpen: true,
                                      isEditing: true,
                                      subjectId: subject.id,
                                      data: topic
                                    })}
                                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                                    title="Edit Topic"
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
                                    className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs transition cursor-pointer"
                                    title="Delete Topic"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>

                              {/* Topic Sub-Items */}
                              {isTopicExpanded && (
                                <div className="p-3 space-y-1.5 bg-slate-950/30">
                                  {topicItems.length === 0 ? (
                                    <p className="text-[11px] text-slate-500 italic px-2 py-1">No sub-items defined for this topic.</p>
                                  ) : (
                                    topicItems.map((item) => (
                                      <div key={item.id} className="p-2 bg-slate-900/60 border border-slate-800/60 rounded-lg flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-slate-500 text-xs">•</span>
                                          <span className="text-xs text-slate-300">{item.title}</span>
                                          {item.importance && (
                                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-slate-800 text-slate-400">
                                              {item.importance}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => setItemModal({
                                              isOpen: true,
                                              isEditing: true,
                                              subjectId: subject.id,
                                              topicId: topic.id,
                                              data: item
                                            })}
                                            className="p-1 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                                          >
                                            ✏️
                                          </button>
                                          <button
                                            onClick={() => setDeleteConfirmModal({
                                              isOpen: true,
                                              type: "item",
                                              id: item.id,
                                              title: `Item: ${item.title}`
                                            })}
                                            className="p-1 text-rose-400 hover:text-rose-200 text-xs cursor-pointer"
                                          >
                                            🗑️
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SUBJECT MODAL */}
      {subjectModal.isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 animate-scale-in">
            <h3 className="text-base font-bold text-white mb-4">
              {subjectModal.isEditing ? "Edit Subject" : "Add Subject to Exam"}
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
                  onClick={() => setSubjectModal({ isOpen: false, isEditing: false, data: {} })}
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
              {itemModal.isEditing ? "Edit Syllabus Unit" : "Add Syllabus Unit / Sub-Topic"}
            </h3>
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Unit Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Guhilas of Mewar, Rathores of Marwar"
                  value={itemModal.data.title || ""}
                  onChange={(e) => setItemModal(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Importance</label>
                  <select
                    value={itemModal.data.importance || "high"}
                    onChange={(e) => setItemModal(prev => ({ ...prev, data: { ...prev.data, importance: e.target.value } }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Weightage (%)</label>
                  <input
                    type="number"
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
                  onClick={() => setItemModal({ isOpen: false, isEditing: false, subjectId: null, topicId: null, data: {} })}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-linear-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : itemModal.isEditing ? "Update Unit" : "Save Unit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-800 text-center animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-rose-950 text-rose-400 border border-rose-800/60 flex items-center justify-center text-xl mx-auto mb-3">
              🗑️
            </div>
            <h3 className="text-base font-bold text-white">Confirm Deletion</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Are you sure you want to delete <strong className="text-white">{deleteConfirmModal.title}</strong>? All associated children will also be removed.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal({ isOpen: false, type: "", id: "", title: "" })}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-900/30 transition-all cursor-pointer"
              >
                {isSubmitting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
