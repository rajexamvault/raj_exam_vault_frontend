"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  const [modalSubjects, setModalSubjects] = useState([]);
  const [modalTopics, setModalTopics] = useState([]);
  const [filterSubjects, setFilterSubjects] = useState([]);
  const [filterTopics, setFilterTopics] = useState([]);
  const [stats, setStats] = useState({ totalQuestions: 0, easyCount: 0, mediumCount: 0, hardCount: 0, pyqCount: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [examFilter, setExamFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [pyqFilter, setPyqFilter] = useState("all");
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

  // Bulk Selection & Deletion State
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [bulkJsonText, setBulkJsonText] = useState("");
  const [expandedExplanations, setExpandedExplanations] = useState({});

  // Bulk / JSON File Upload States
  const [bulkExamId, setBulkExamId] = useState("");
  const [bulkSubjectId, setBulkSubjectId] = useState("");
  const [bulkTopicId, setBulkTopicId] = useState("");
  const [bulkExamSubjects, setBulkExamSubjects] = useState([]);
  const [bulkTopics, setBulkTopics] = useState([]);
  const [bulkImportMode, setBulkImportMode] = useState("file"); // "file" | "paste"
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFileSize, setSelectedFileSize] = useState("");
  const [parsedBulkQuestions, setParsedBulkQuestions] = useState([]);
  const [bulkParseError, setBulkParseError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);
  const [isCustomTopicMode, setIsCustomTopicMode] = useState(false);
  const [isBulkCustomTopicMode, setIsBulkCustomTopicMode] = useState(false);
  const [bulkCustomTopicName, setBulkCustomTopicName] = useState("");

  // Question Form State
  const [formData, setFormData] = useState({
    examId: "",
    subjectId: "",
    stageId: "",
    topicId: "",
    customTopicName: "",
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
        }
      } catch (err) {
        console.warn("Exams load error:", err);
      }
    };
    fetchExams();
  }, []);

  // Update filter subjects when examFilter changes
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
      }
    };
    loadFilterSubjects();
  }, [examFilter]);

  // Update filter topics when subjectFilter changes
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
          subjectId: subjectFilter,
          topicId: topicFilter,
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
      // Reset selected checkboxes if page/filters change
      setSelectedIds([]);
    } catch (err) {
      showToast?.("error", err.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, search, examFilter, subjectFilter, topicFilter, difficultyFilter, pyqFilter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Load topics for modal whenever modal subject changes
  const handleModalSubjectChange = async (targetSubjectId) => {
    setFormData(prev => ({ ...prev, subjectId: targetSubjectId, topicId: "" }));
    if (!targetSubjectId) {
      setModalTopics([]);
      return;
    }
    try {
      const res = await syllabusService.getTopics(targetSubjectId);
      const topicsList = res.data?.topics || res.data || res.topics || [];
      setModalTopics(topicsList || []);
    } catch (err) {
      console.warn("Failed to load modal topics:", err);
      setModalTopics([]);
    }
  };

  // Handle Exam change in modal to dynamically cascade subjects and topics
  const handleModalExamChange = async (targetExamId) => {
    setFormData(prev => ({ ...prev, examId: targetExamId, subjectId: "", topicId: "" }));
    setModalTopics([]);
    if (!targetExamId) {
      setModalSubjects([]);
      return;
    }
    try {
      const subs = await examService.getExamSubjects(targetExamId);
      const subjectsList = subs || [];
      setModalSubjects(subjectsList);
      if (subjectsList.length > 0) {
        const firstSubId = subjectsList[0].id;
        setFormData(prev => ({ ...prev, subjectId: firstSubId }));
        // Also fetch topics for this subject
        try {
          const tRes = await syllabusService.getTopics(firstSubId);
          setModalTopics(tRes.data?.topics || tRes.data || tRes.topics || []);
        } catch {
          setModalTopics([]);
        }
      }
    } catch (err) {
      console.warn("Failed to load modal subjects:", err);
      setModalSubjects([]);
      setModalTopics([]);
    }
  };

  // Open Create Modal
  const handleOpenCreate = async () => {
    const defaultExamId = (examFilter && examFilter !== "all") ? examFilter : (exams[0]?.id || "");
    const defaultSubjectId = (subjectFilter && subjectFilter !== "all") ? subjectFilter : "";
    const defaultTopicId = (topicFilter && topicFilter !== "all") ? topicFilter : "";
    setEditingQuestion(null);
    setFormData({
      examId: defaultExamId,
      subjectId: defaultSubjectId,
      stageId: "",
      topicId: defaultTopicId,
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

    if (defaultExamId) {
      try {
        const subs = await examService.getExamSubjects(defaultExamId);
        setModalSubjects(subs || []);
        let chosenSubId = "";
        if (subs && subs.length > 0) {
          const matchSub = defaultSubjectId ? subs.find(s => String(s.id) === String(defaultSubjectId)) : null;
          chosenSubId = matchSub ? matchSub.id : subs[0].id;
          setFormData(prev => ({ ...prev, subjectId: chosenSubId }));
        }
        if (chosenSubId) {
          const tRes = await syllabusService.getTopics(chosenSubId);
          setModalTopics(tRes.data?.topics || tRes.data || tRes.topics || []);
        } else {
          setModalTopics([]);
        }
      } catch (err) {
        console.warn("Failed to load subjects:", err);
      }
    } else {
      setModalSubjects([]);
      setModalTopics([]);
    }

    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = async (q) => {
    setEditingQuestion(q);
    setFormData({
      examId: q.examId || "",
      subjectId: q.subjectId || "",
      stageId: q.stageId || "",
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
        const subs = await examService.getExamSubjects(q.examId);
        setModalSubjects(subs || []);
      } catch (err) {
        console.warn("Failed to load subjects for edit:", err);
      }
    }

    if (q.subjectId) {
      try {
        const tRes = await syllabusService.getTopics(q.subjectId);
        setModalTopics(tRes.data?.topics || tRes.data || tRes.topics || []);
      } catch (err) {
        console.warn("Failed to load topics for edit:", err);
        setModalTopics([]);
      }
    } else {
      setModalTopics([]);
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
    if (!formData.examId) {
      showToast?.("error", "Please select a Target Exam for this question");
      return;
    }

    if (!formData.subjectId) {
      showToast?.("error", "Subject is mandatory! Please select a Subject for this question.");
      return;
    }

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

  // Open Bulk Import / JSON File Upload Modal
  const handleOpenBulkModal = async () => {
    const targetExam = (examFilter && examFilter !== "all") ? examFilter : (exams[0]?.id || "");
    const targetSub = (subjectFilter && subjectFilter !== "all") ? subjectFilter : "";
    const targetTopic = (topicFilter && topicFilter !== "all") ? topicFilter : "";

    setBulkExamId(targetExam);
    setBulkTopicId(targetTopic);
    setBulkImportMode("file");
    setSelectedFileName("");
    setSelectedFileSize("");
    setParsedBulkQuestions([]);
    setBulkJsonText("");
    setBulkParseError(null);
    setShowPreview(false);

    if (targetExam) {
      try {
        const subs = await examService.getExamSubjects(targetExam);
        setBulkExamSubjects(subs || []);
        let chosenSubId = "";
        if (subs && subs.length > 0) {
          const matchSub = targetSub ? subs.find(s => String(s.id) === String(targetSub)) : subs[0];
          chosenSubId = matchSub ? matchSub.id : subs[0].id;
          setBulkSubjectId(chosenSubId);
        } else {
          setBulkSubjectId("");
        }
        if (chosenSubId) {
          const tRes = await syllabusService.getTopics(chosenSubId);
          setBulkTopics(tRes.data?.topics || tRes.data || tRes.topics || []);
        } else {
          setBulkTopics([]);
        }
      } catch (err) {
        console.warn("Bulk modal subject load error:", err);
        setBulkExamSubjects([]);
        setBulkSubjectId("");
        setBulkTopics([]);
      }
    } else {
      setBulkExamSubjects([]);
      setBulkSubjectId("");
      setBulkTopics([]);
    }

    setIsBulkModalOpen(true);
  };

  // Cascading Subject Selection when Exam changes in Bulk Modal
  const handleBulkExamChange = async (targetExamId) => {
    setBulkExamId(targetExamId);
    setBulkSubjectId("");
    setBulkTopicId("");
    setBulkTopics([]);
    if (!targetExamId) {
      setBulkExamSubjects([]);
      return;
    }
    try {
      const subs = await examService.getExamSubjects(targetExamId);
      setBulkExamSubjects(subs || []);
      if (subs && subs.length > 0) {
        const firstSubId = subs[0].id;
        setBulkSubjectId(firstSubId);
        try {
          const tRes = await syllabusService.getTopics(firstSubId);
          setBulkTopics(tRes.data?.topics || tRes.data || tRes.topics || []);
        } catch {
          setBulkTopics([]);
        }
      }
    } catch (err) {
      console.warn("Bulk modal exam change error:", err);
      setBulkExamSubjects([]);
      setBulkTopics([]);
    }
  };

  // Cascading Topic Selection when Subject changes in Bulk Modal
  const handleBulkSubjectChange = async (targetSubjectId) => {
    setBulkSubjectId(targetSubjectId);
    setBulkTopicId("");
    if (!targetSubjectId) {
      setBulkTopics([]);
      return;
    }
    try {
      const tRes = await syllabusService.getTopics(targetSubjectId);
      setBulkTopics(tRes.data?.topics || tRes.data || tRes.topics || []);
    } catch (err) {
      console.warn("Bulk modal topic load error:", err);
      setBulkTopics([]);
    }
  };

  // Helper to safely extract questions array from various JSON formats
  const parseQuestionsData = (data) => {
    let list = data;
    if (!Array.isArray(data)) {
      if (data && Array.isArray(data.questions)) {
        list = data.questions;
      } else if (data && Array.isArray(data.data)) {
        list = data.data;
      } else {
        throw new Error("JSON must contain an array of question objects (e.g. [{ question: '...', options: [...] }])");
      }
    }
    if (list.length === 0) {
      throw new Error("The JSON file contains 0 questions. Please provide a non-empty question list.");
    }
    return list;
  };

  // Handle .json File Selection / Drag-and-drop
  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".json") && file.type !== "application/json") {
      setBulkParseError("Please select a valid .json file");
      return;
    }
    setSelectedFileName(file.name);
    setSelectedFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    setBulkParseError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const questionsList = parseQuestionsData(parsed);
        setParsedBulkQuestions(questionsList);
        setBulkParseError(null);
      } catch (err) {
        setBulkParseError("Failed to parse JSON file: " + err.message);
        setParsedBulkQuestions([]);
      }
    };
    reader.onerror = () => {
      setBulkParseError("Failed to read the file from disk.");
      setParsedBulkQuestions([]);
    };
    reader.readAsText(file);
  };

  // Handle pasted JSON text
  const handlePasteChange = (text) => {
    setBulkJsonText(text);
    if (!text.trim()) {
      setParsedBulkQuestions([]);
      setBulkParseError(null);
      return;
    }
    try {
      const parsed = JSON.parse(text);
      const questionsList = parseQuestionsData(parsed);
      setParsedBulkQuestions(questionsList);
      setBulkParseError(null);
    } catch (err) {
      setBulkParseError("Invalid JSON syntax: " + err.message);
      setParsedBulkQuestions([]);
    }
  };

  // Load a rich sample JSON into paste tab
  const handleLoadSampleJson = () => {
    const sample = [
      {
        question: "डॉ. राजेंद्र प्रसाद के कार्यभार संभालने से पहले संविधान सभा के अस्थायी सभापति कौन थे?",
        options: [
          "सी. राजगोपालाचारी",
          "डॉ. बी. आर. अम्बेडकर",
          "टी. टी. कृष्णमाचारी",
          "डॉ. सच्चिदानंद सिन्हा"
        ],
        answer: "D",
        exam: "Civil Services (Pre.)",
        year: 2024,
        type: "pyq",
        explanation: "डॉ. सच्चिदानंद सिन्हा को 9 दिसंबर 1946 को संविधान सभा का अंतरिम अध्यक्ष चुना गया था।"
      },
      {
        questionHindi: "राजस्थान का राज्य वृक्ष कौनसा है?",
        questionEnglish: "Which is the state tree of Rajasthan?",
        options: [
          { id: "A", textHindi: "खेजड़ी", textEnglish: "Khejri (Prosopis cineraria)", isCorrect: true },
          { id: "B", textHindi: "रोहिड़ा", textEnglish: "Rohida", isCorrect: false },
          { id: "C", textHindi: "नीम", textEnglish: "Neem", isCorrect: false },
          { id: "D", textHindi: "बरगद", textEnglish: "Banyan", isCorrect: false }
        ],
        correctAnswer: "A",
        difficultyLevel: "easy",
        marks: 2.0
      }
    ];
    setBulkImportMode("paste");
    handlePasteChange(JSON.stringify(sample, null, 2));
  };

  // Submit Bulk Import
  const handleBulkImportSubmit = async (e) => {
    e.preventDefault();
    if (!bulkExamId) {
      showToast?.("error", "Please select a Target Exam for these questions");
      return;
    }
    if (!bulkSubjectId) {
      showToast?.("error", "Subject is mandatory! Please select a Subject of the Exam.");
      return;
    }
    if (!parsedBulkQuestions || parsedBulkQuestions.length === 0) {
      showToast?.("error", "Please upload a valid JSON file or paste question data first");
      return;
    }

    try {
      setIsSaving(true);
      const res = await questionService.bulkImport(parsedBulkQuestions, bulkExamId, bulkSubjectId, bulkTopicId);
      showToast?.("success", res.message || `Successfully imported ${parsedBulkQuestions.length} questions into Question Bank! 🎯`);
      setIsBulkModalOpen(false);

      // Divide & switch view directly to this Exam & Subject (& Topic) so user sees results instantly
      setExamFilter(bulkExamId);
      setSubjectFilter(bulkSubjectId);
      if (bulkTopicId) {
        setTopicFilter(bulkTopicId);
      }
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      fetchQuestions();
    } catch (err) {
      showToast?.("error", err.message || "Failed to import questions");
    } finally {
      setIsSaving(false);
    }
  };

  // Single Question Deletion
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

  // Bulk Question Deletion
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete all ${selectedIds.length} selected questions?`)) {
      return;
    }
    try {
      setIsBulkDeleting(true);
      const res = await questionService.bulkDeleteQuestions(selectedIds);
      showToast?.("success", res.message || `Deleted ${selectedIds.length} questions 🗑️`);
      setSelectedIds([]);
      fetchQuestions();
    } catch (err) {
      showToast?.("error", err.message || "Failed to delete selected questions");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Select / Deselect All
  const handleToggleSelectAll = () => {
    if (selectedIds.length === questions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(questions.map(q => q.id));
    }
  };

  // Toggle single question selection
  const handleToggleSelectQuestion = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
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
              <span>Question Bank & Dynamic MCQ Engine</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Organized strictly by Exam → Mandatory Subject with single & bulk question deletion.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer animate-fade-in"
              >
                <span>🗑️ Delete Selected ({selectedIds.length})</span>
              </button>
            )}
            <button
              onClick={handleOpenBulkModal}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
            >
              <span>📁</span>
              <span>Upload JSON / Bulk Import</span>
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

      {/* EXAM DIVISION SWITCHER BAR */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">🏛️</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Divide According to Exam:
            </span>
            {examFilter !== "all" && (
              <button
                onClick={() => { setExamFilter("all"); setSubjectFilter("all"); }}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold underline cursor-pointer ml-1"
              >
                (View All Exams)
              </button>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            {examFilter === "all"
              ? `Total ${stats.totalQuestions} questions across all Rajasthan exams`
              : `Divided under: ${exams.find(e => String(e.id) === String(examFilter))?.title || 'Selected Exam'}`}
          </div>
        </div>

        {/* Horizontal Exam Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => { setExamFilter("all"); setSubjectFilter("all"); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              examFilter === "all"
                ? "bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50 ring-2 ring-emerald-400/40"
                : "bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
            }`}
          >
            <span>🌐</span>
            <span>All Exams</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-900/80 text-[10px] font-mono">
              {stats.totalQuestions}
            </span>
          </button>

          {exams.map((ex) => {
            const isSelected = String(examFilter) === String(ex.id);
            const examCount = stats.examBreakdown?.find(b => String(b.examId) === String(ex.id))?.count;
            return (
              <button
                key={ex.id}
                onClick={() => { setExamFilter(ex.id); setSubjectFilter("all"); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50 ring-2 ring-emerald-400/40"
                    : "bg-slate-950/70 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700"
                }`}
              >
                <span>{ex.icon || "🏛️"}</span>
                <span>{ex.shortName || ex.title}</span>
                {examCount !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? "bg-emerald-900/80 text-emerald-200" : "bg-slate-900 text-slate-400"
                  }`}>
                    {examCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* If a specific exam is chosen, display that exam's subject pills */}
        {examFilter !== "all" && filterSubjects.length > 0 && (
          <div className="pt-2.5 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0">
              📚 Subjects of Exam:
            </span>
            <button
              onClick={() => setSubjectFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 cursor-pointer ${
                subjectFilter === "all"
                  ? "bg-teal-600 text-white"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              All Subjects
            </button>
            {filterSubjects.map((sub) => {
              const isSubSelected = String(subjectFilter) === String(sub.id);
              return (
                <button
                  key={sub.id}
                  onClick={() => setSubjectFilter(sub.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 cursor-pointer flex items-center gap-1 ${
                    isSubSelected
                      ? "bg-teal-600 text-white shadow-xs"
                      : "bg-slate-950 text-slate-300 hover:text-white border border-slate-800"
                  }`}
                >
                  <span>{sub.icon || "📖"}</span>
                  <span>{sub.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* If a specific subject is chosen and topics exist, display that subject's topic pills */}
        {subjectFilter !== "all" && filterTopics.length > 0 && (
          <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0">
              🏷️ Topics:
            </span>
            <button
              onClick={() => setTopicFilter("all")}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition shrink-0 cursor-pointer ${
                topicFilter === "all"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              All Topics
            </button>
            {filterTopics.map((top) => {
              const isTopSelected = String(topicFilter) === String(top.id);
              return (
                <button
                  key={top.id}
                  onClick={() => setTopicFilter(top.id)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition shrink-0 cursor-pointer flex items-center gap-1 ${
                    isTopSelected
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-950 text-slate-300 hover:text-white border border-slate-800"
                  }`}
                >
                  <span>🏷️</span>
                  <span>{top.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* FILTER BAR: Exam -> Subject hierarchy & search */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Search questions by text, PYQ details, or explanation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter by Exam */}
        <select
          value={examFilter}
          onChange={(e) => setExamFilter(e.target.value)}
          className="w-full md:w-40 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="all">🏛️ All Exams</option>
          {exams.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.title}
            </option>
          ))}
        </select>

        {/* Filter by Subject (dynamically populated when exam is selected) */}
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="w-full md:w-44 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="all">📚 All Subjects</option>
          {filterSubjects.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>

        {/* Filter by Topic (dynamically populated when subject is selected) */}
        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          disabled={subjectFilter === "all" || filterTopics.length === 0}
          className="w-full md:w-40 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-40"
        >
          <option value="all">
            {subjectFilter === "all" ? "🏷️ Select Subject" : (filterTopics.length === 0 ? "🏷️ No Topics" : "🏷️ All Topics")}
          </option>
          {filterTopics.map((top) => (
            <option key={top.id} value={top.id}>
              {top.name}
            </option>
          ))}
        </select>

        {/* Difficulty Filter */}
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="w-full md:w-28 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="all">All Levels</option>
          <option value="easy">🟢 Easy</option>
          <option value="medium">🟡 Medium</option>
          <option value="hard">🔴 Hard</option>
        </select>

        {/* PYQ Filter */}
        <select
          value={pyqFilter}
          onChange={(e) => setPyqFilter(e.target.value)}
          className="w-full md:w-32 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="all">All Questions</option>
          <option value="true">📑 PYQs Only</option>
        </select>
      </div>

      {/* Bulk Selection Header */}
      {questions.length > 0 && (
        <div className="flex items-center justify-between px-2 text-xs text-slate-400">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={selectedIds.length === questions.length && questions.length > 0}
              onChange={handleToggleSelectAll}
              className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 cursor-pointer"
            />
            <span className="font-semibold text-slate-300">
              Select All on this page ({selectedIds.length}/{questions.length} selected)
            </span>
          </label>

          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>🗑️ Delete {selectedIds.length} Selected Questions</span>
            </button>
          )}
        </div>
      )}

      {/* QUESTION CARDS LIST */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400">Loading questions from vault...</span>
        </div>
      ) : questions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <span className="text-4xl">🎯</span>
          <h3 className="text-sm font-bold text-white mt-3">No Questions Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search || examFilter !== "all" || subjectFilter !== "all"
              ? "No questions match your current filters. Try resetting filters."
              : "Start by selecting an exam and subject to add your first bilingual MCQ question!"}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            + Add First Question
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => {
            const options = Array.isArray(q.options) ? q.options : [];
            const isExplanationExpanded = !!expandedExplanations[q.id];
            const isSelected = selectedIds.includes(q.id);

            return (
              <div
                key={q.id}
                className={`bg-slate-900/70 border rounded-2xl p-5 space-y-4 transition-all ${
                  isSelected
                    ? "border-emerald-500/80 bg-slate-900/90 shadow-md shadow-emerald-950/40"
                    : "border-slate-800/80 hover:border-slate-700"
                }`}
              >
                {/* Top Strip: Selection, Exam, Subject, Difficulty, Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-800/60">
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectQuestion(q.id)}
                      className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 cursor-pointer"
                      title="Select question for deletion"
                    />

                    {/* Exam Badge */}
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-bold flex items-center gap-1">
                      <span>{q.exam?.icon || "🏛️"}</span>
                      <span>{q.exam?.title || "Exam"}</span>
                    </span>

                    {/* Subject Badge */}
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-800/50 text-[10px] font-bold flex items-center gap-1">
                      <span>📚</span>
                      <span>{q.subjectRef?.name || q.subject?.name || "General Subject"}</span>
                    </span>

                    {/* Topic Badge */}
                    {(q.topic?.name || (typeof q.topic === 'string' && q.topic)) && (
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-950/60 text-teal-300 border border-teal-800/50 text-[10px] font-bold flex items-center gap-1">
                        <span>🏷️</span>
                        <span>{typeof q.topic === 'object' ? q.topic?.name : q.topic}</span>
                      </span>
                    )}

                    {/* Difficulty Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        q.difficultyLevel === "hard"
                          ? "bg-rose-950 text-rose-300 border border-rose-800/40"
                          : q.difficultyLevel === "medium"
                          ? "bg-amber-950 text-amber-300 border border-amber-800/40"
                          : "bg-emerald-950 text-emerald-300 border border-emerald-800/40"
                      }`}
                    >
                      {q.difficultyLevel}
                    </span>

                    {/* PYQ Badge */}
                    {q.isPreviousYear && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-900/80 text-purple-200 border border-purple-700/50 text-[10px] font-bold">
                        PYQ {q.pyqYear ? `(${q.pyqYear})` : ""} {q.pyqExamName ? `• ${q.pyqExamName}` : ""}
                      </span>
                    )}
                  </div>

                  {/* Single Question Actions (Edit & Delete Function) */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(q)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                      title="Edit Question"
                    >
                      ✏️ Edit
                    </button>

                    {deleteConfirmId === q.id ? (
                      <div className="flex items-center gap-1 animate-fade-in">
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold cursor-pointer"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-[11px] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(q.id)}
                        className="px-2 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                        title="Delete Question"
                      >
                        <span>🗑️</span>
                        <span>Delete</span>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
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
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                            isCorrect ? "bg-emerald-500 text-slate-950 font-black" : "bg-slate-800 text-slate-400"
                          }`}
                        >
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
                  <div className="pt-1">
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
                  {editingQuestion ? "Edit MCQ Question" : "Add New MCQ to Question Bank"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Questions are linked to an Exam and a Mandatory Subject.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-lg p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              {/* Exam, Subject, and Topic Selectors (Strict Exam -> Subject -> Topic hierarchy) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                {/* Exam Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Target Exam *
                  </label>
                  <select
                    required
                    value={formData.examId}
                    onChange={(e) => handleModalExamChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">Select Exam</option>
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject Dropdown (Mandatory!) */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1 flex items-center justify-between">
                    <span>Target Subject *</span>
                    <span className="text-[10px] text-red-400 font-bold uppercase">Mandatory</span>
                  </label>
                  <select
                    required
                    value={formData.subjectId}
                    onChange={(e) => handleModalSubjectChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">
                      {modalSubjects.length === 0 ? "⚠️ No Subjects (Add in Exam first)" : "Select Subject"}
                    </option>
                    {modalSubjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        📖 {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Topic Dropdown & Custom Topic Creator */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300 uppercase">
                      Target Topic
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomTopicMode(!isCustomTopicMode);
                        if (!isCustomTopicMode) {
                          setFormData(prev => ({ ...prev, topicId: "" }));
                        }
                      }}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                    >
                      {isCustomTopicMode ? "⬅ Select Existing" : "+ Create Custom"}
                    </button>
                  </div>

                  {isCustomTopicMode ? (
                    <input
                      type="text"
                      placeholder="Enter custom topic (e.g. Constituent Assembly)..."
                      value={formData.customTopicName || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, customTopicName: e.target.value, topicId: "" }))}
                      className="w-full bg-slate-900 border border-emerald-500 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-emerald-400 placeholder:text-slate-500"
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
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-40"
                    >
                      <option value="">
                        {!formData.subjectId ? "-- Choose Subject First --" : (modalTopics.length === 0 ? "-- No Topics Defined --" : "-- Choose Topic (Optional) --")}
                      </option>
                      {modalTopics.map((top) => (
                        <option key={top.id} value={top.id}>
                          🏷️ {top.name}
                        </option>
                      ))}
                      {formData.subjectId && (
                        <option value="__custom__" className="text-emerald-400 font-bold">
                          ➕ + Create Custom Topic...
                        </option>
                      )}
                    </select>
                  )}
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
                  Options & Select Correct Answer (🔘 Radio button = Correct Answer)
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
                    Official PYQ Question?
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
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  {isSaving ? "Saving Question..." : editingQuestion ? "Update Question" : "Save Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK / JSON FILE UPLOAD MODAL - Divided by Exam & Subject */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>📥</span>
                  <span>Upload Questions from JSON File</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select Exam ➔ Select Subject of Exam ➔ Upload JSON file to divide and store questions.
                </p>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBulkImportSubmit} className="space-y-4">
              {/* STEP 1: Select Exam and Subject of Exam */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🎯</span>
                  <span>Step 1: Select Exam & Subject of Exam (Mandatory Division)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Select Exam */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      1. Target Exam *
                    </label>
                    <select
                      required
                      value={bulkExamId}
                      onChange={(e) => handleBulkExamChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="">-- Choose Exam --</option>
                      {exams.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Subject of Exam */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1 flex items-center justify-between">
                      <span>2. Subject *</span>
                      <span className="text-[10px] text-red-400 font-bold uppercase">Required</span>
                    </label>
                    <select
                      required
                      value={bulkSubjectId}
                      onChange={(e) => handleBulkSubjectChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="">
                        {bulkExamSubjects.length === 0
                          ? (bulkExamId ? "Loading subjects..." : "Select Exam First")
                          : "-- Select Subject --"}
                      </option>
                      {bulkExamSubjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Topic (Optional / Custom) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-300 uppercase">
                        3. Topic
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsBulkCustomTopicMode(!isBulkCustomTopicMode);
                          if (!isBulkCustomTopicMode) {
                            setBulkTopicId("");
                          }
                        }}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                      >
                        {isBulkCustomTopicMode ? "⬅ Select Existing" : "+ Create Custom"}
                      </button>
                    </div>

                    {isBulkCustomTopicMode ? (
                      <input
                        type="text"
                        placeholder="e.g. Constituent Assembly"
                        value={bulkCustomTopicName}
                        onChange={(e) => {
                          setBulkCustomTopicName(e.target.value);
                          setBulkTopicId(e.target.value);
                        }}
                        className="w-full bg-slate-900 border border-emerald-500 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-emerald-400 placeholder:text-slate-500"
                      />
                    ) : (
                      <select
                        value={bulkTopicId}
                        onChange={(e) => {
                          if (e.target.value === "__custom__") {
                            setIsBulkCustomTopicMode(true);
                            setBulkTopicId("");
                          } else {
                            setBulkTopicId(e.target.value);
                            setBulkCustomTopicName("");
                          }
                        }}
                        disabled={!bulkSubjectId}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-40"
                      >
                        <option value="">
                          {!bulkSubjectId ? "-- Select Subject First --" : (bulkTopics.length === 0 ? "-- No Topics --" : "-- Select Topic (Optional) --")}
                        </option>
                        {bulkTopics.map((top) => (
                          <option key={top.id} value={top.id}>
                            🏷️ {top.name}
                          </option>
                        ))}
                        {bulkSubjectId && (
                          <option value="__custom__" className="text-emerald-400 font-bold">
                            ➕ + Create Custom Topic...
                          </option>
                        )}
                      </select>
                    )}
                  </div>
                </div>

                {/* Division Notice Badge */}
                {bulkExamId && bulkSubjectId && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
                    <span>📌</span>
                    <span>
                      Questions will be divided under:{" "}
                      <strong>{exams.find(e => String(e.id) === String(bulkExamId))?.title}</strong>
                      {" ➔ "}
                      <strong>{bulkExamSubjects.find(s => String(s.id) === String(bulkSubjectId))?.name}</strong>
                      {bulkTopicId && bulkTopics.find(t => String(t.id) === String(bulkTopicId)) && (
                        <span>
                          {" ➔ "}
                          <strong>🏷️ {bulkTopics.find(t => String(t.id) === String(bulkTopicId))?.name}</strong>
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* STEP 2: Upload Method Toggle & File Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBulkImportMode("file")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5 ${
                        bulkImportMode === "file"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-800 text-slate-300 hover:text-white"
                      }`}
                    >
                      <span>📁</span>
                      <span>Upload JSON File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkImportMode("paste")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5 ${
                        bulkImportMode === "paste"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-800 text-slate-300 hover:text-white"
                      }`}
                    >
                      <span>📝</span>
                      <span>Paste JSON Text</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleLoadSampleJson}
                    className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 underline cursor-pointer"
                  >
                    📄 Load Sample JSON Template
                  </button>
                </div>

                {/* MODE A: Upload JSON File */}
                {bulkImportMode === "file" && (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".json,application/json"
                      onChange={(e) => handleFileSelect(e.target.files?.[0])}
                      className="hidden"
                    />

                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        handleFileSelect(e.dataTransfer.files?.[0]);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                        isDragOver
                          ? "border-emerald-400 bg-emerald-950/20"
                          : selectedFileName
                          ? "border-emerald-700 bg-slate-950/60"
                          : "border-slate-700 hover:border-emerald-500/70 bg-slate-950/40 hover:bg-slate-950/80"
                      }`}
                    >
                      {selectedFileName ? (
                        <div className="space-y-2">
                          <span className="text-3xl">📄</span>
                          <div className="text-xs font-bold text-white">{selectedFileName}</div>
                          <div className="text-[11px] text-slate-400">
                            Size: {selectedFileSize} • Click or drag another file to replace
                          </div>
                          {parsedBulkQuestions.length > 0 && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-300 text-xs font-bold border border-emerald-700/60">
                              <span>✅</span>
                              <span>{parsedBulkQuestions.length} Questions successfully detected & parsed!</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="text-3xl">☁️</span>
                          <div className="text-xs font-bold text-white">
                            Click to browse JSON file or drag & drop here
                          </div>
                          <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                            Upload your Rajasthan competitive exam question bank (.json). Supports bilingual questions, PYQs, and standard question sets.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* MODE B: Paste JSON Text */}
                {bulkImportMode === "paste" && (
                  <div className="space-y-2">
                    <textarea
                      rows={7}
                      placeholder="Paste your JSON array here (e.g. [{ question: '...', options: [...] }])..."
                      value={bulkJsonText}
                      onChange={(e) => handlePasteChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono rounded-xl p-3 outline-none focus:border-emerald-500"
                    />
                    {parsedBulkQuestions.length > 0 && (
                      <div className="text-xs text-emerald-400 font-semibold">
                        ✅ Recognized {parsedBulkQuestions.length} questions in pasted JSON.
                      </div>
                    )}
                  </div>
                )}

                {/* Parse Error Display */}
                {bulkParseError && (
                  <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{bulkParseError}</span>
                  </div>
                )}

                {/* PREVIEW OF PARSED QUESTIONS */}
                {parsedBulkQuestions.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">
                        📋 Preview Questions ({parsedBulkQuestions.length} Total Detected)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                      >
                        {showPreview ? "Hide Preview ▲" : "Show Preview ▼"}
                      </button>
                    </div>

                    {showPreview && (
                      <div className="space-y-2 pt-2 max-h-56 overflow-y-auto pr-1 text-xs">
                        {parsedBulkQuestions.slice(0, 3).map((q, idx) => {
                          const qText = q.question || q.questionHindi || q.questionEnglish || `Question #${idx + 1}`;
                          const qAns = q.correctAnswer || q.answer || "A";
                          const opts = Array.isArray(q.options) ? q.options : [];
                          return (
                            <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                              <div className="font-semibold text-white flex items-center justify-between">
                                <span className="line-clamp-2">#{idx + 1}. {qText}</span>
                                <span className="shrink-0 px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] border border-emerald-800">
                                  Ans: {qAns}
                                </span>
                              </div>
                              {opts.length > 0 && (
                                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400">
                                  {opts.map((opt, oIdx) => {
                                    const optText = typeof opt === "string" ? opt : (opt.textHindi || opt.textEnglish || opt.text || "");
                                    const optId = typeof opt === "string" ? String.fromCharCode(65 + oIdx) : (opt.id || String.fromCharCode(65 + oIdx));
                                    const isCorrect = String(optId).toUpperCase() === String(qAns).toUpperCase();
                                    return (
                                      <div key={oIdx} className={`p-1 rounded ${isCorrect ? "bg-emerald-950/60 text-emerald-200 font-bold" : ""}`}>
                                        {optId}. {optText}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {parsedBulkQuestions.length > 3 && (
                          <div className="text-center text-[11px] text-slate-500 italic">
                            ...and {parsedBulkQuestions.length - 3} more questions ready to import.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !bulkExamId || !bulkSubjectId || parsedBulkQuestions.length === 0}
                  className={`px-5 py-2 rounded-xl text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 ${
                    isSaving || !bulkExamId || !bulkSubjectId || parsedBulkQuestions.length === 0
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 cursor-pointer shadow-emerald-900/30"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Importing Questions...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>
                        Import {parsedBulkQuestions.length > 0 ? `${parsedBulkQuestions.length} ` : ""}Questions to Exam & Subject
                      </span>
                    </>
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
