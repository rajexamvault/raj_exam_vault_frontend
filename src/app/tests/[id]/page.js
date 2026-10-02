"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/config/apiConfig";

export default function MockTestEnginePage({ params }) {
  const unwrappedParams = React.use(params);
  const testId = unwrappedParams.id;
  const { user, token, isAuthenticated } = useAuth();

  // Test state
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testPhase, setTestPhase] = useState("instructions"); // 'instructions' | 'taking' | 'submitted'
  const [attemptId, setAttemptId] = useState(null);

  // Taking phase state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qId]: { selectedAnswer: 'A', timeSpent: 12 } }
  const [markedForReview, setMarkedForReview] = useState({}); // { [qId]: true }
  const [visitedQuestions, setVisitedQuestions] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [timeSpent, setTimeSpent] = useState(0);
  const [langPreference, setLangPreference] = useState("hi"); // 'hi' or 'en'
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Result phase state
  const [resultData, setResultData] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    fetchTestDetails();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testId]);

  const fetchTestDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/tests/${testId}`);
      const json = await res.json();
      if (json.success || json.status === "success") {
        const test = json.mockTest || json.data?.mockTest || json.data;
        setTestData(test);
      }
    } catch (err) {
      console.error("Failed to fetch test details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    if (!isAuthenticated) {
      alert("Please login first to record your test attempt and view official ranking.");
      window.location.href = `/login?redirect=/tests/${testId}`;
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/tests/${testId}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success || json.status === "success") {
        const attempt = json.attemptId || json.data?.attemptId;
        const test = json.mockTest || json.data?.mockTest;
        setAttemptId(attempt);
        if (test) {
          setTestData(test);
        }
        // Initialize timer
        const totalSecs = (test?.durationMinutes || testData?.durationMinutes || 60) * 60;
        setTimeRemaining(totalSecs);
        setVisitedQuestions({ 0: true });
        setTestPhase("taking");

        // Start countdown timer
        timerRef.current = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              handleAutoSubmit();
              return 0;
            }
            return prev - 1;
          });
          setTimeSpent((prev) => prev + 1);
        }, 1000);
      } else {
        alert(json.message || "Unable to launch test session.");
      }
    } catch (err) {
      console.error("Error starting test attempt:", err);
      alert("Error starting test. Please verify connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId, optionKey) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        selectedAnswer: optionKey,
        timeSpent: (prev[qId]?.timeSpent || 0) + 1
      }
    }));
  };

  const handleClearResponse = (qId) => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  const handleToggleMarkReview = (qId) => {
    setMarkedForReview((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const handleNavigateQuestion = (index) => {
    if (!testData?.questions || index < 0 || index >= testData.questions.length) return;
    setVisitedQuestions((prev) => ({ ...prev, [index]: true }));
    setCurrentQIndex(index);
  };

  const handleNext = () => {
    if (currentQIndex < (testData?.questions?.length || 0) - 1) {
      handleNavigateQuestion(currentQIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 0) {
      handleNavigateQuestion(currentQIndex - 1);
    }
  };

  const handleAutoSubmit = () => {
    alert("Time has elapsed! Your test is automatically submitting for grading.");
    handleSubmitExam();
  };

  const handleSubmitExam = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const formattedAnswers = {};
      Object.keys(answers).forEach((qId) => {
        formattedAnswers[qId] = {
          selectedAnswer: answers[qId]?.selectedAnswer || null,
          timeSpent: answers[qId]?.timeSpent || 0
        };
      });

      const res = await fetch(`${API_BASE_URL}/tests/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userAnswers: formattedAnswers,
          timeSpentSeconds: timeSpent
        })
      });

      const json = await res.json();
      if (json.success || json.status === "success") {
        setResultData(json.evaluation || json.data?.evaluation || json.data);
        setTestPhase("submitted");
        setIsSubmitModalOpen(false);
      } else {
        alert(json.message || "Failed to submit test.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Error grading test. Please check connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  if (loading && !testData) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-400">Loading Exam Interface & Blueprint...</p>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-2">Test Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">The requested mock test is not available or has been archived.</p>
        <Link href="/tests" className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold">
          ← Back to Test Series
        </Link>
      </div>
    );
  }

  const questions = testData.questions || [];
  const currentQ = questions[currentQIndex];

  // Helper to parse question options
  const getOptionsList = (q) => {
    if (!q) return [];
    if (Array.isArray(q.options)) {
      return q.options.map((opt) => ({
        key: opt.key || opt.id || 'A',
        textHi: opt.textHi || opt.textHindi || opt.text || '',
        textEn: opt.textEn || opt.textEnglish || opt.text || ''
      }));
    }
    if (typeof q.options === "object" && q.options !== null) {
      return Object.entries(q.options).map(([k, v]) => ({
        key: k.toUpperCase(),
        textHi: typeof v === "object" ? (v.hi || v.hindi) : v,
        textEn: typeof v === "object" ? (v.en || v.english) : v
      }));
    }
    return [
      { key: "A", textHi: q.optionA_Hi || q.optionA || q.optionAHindi, textEn: q.optionA_En || q.optionA || q.optionAEnglish },
      { key: "B", textHi: q.optionB_Hi || q.optionB || q.optionBHindi, textEn: q.optionB_En || q.optionB || q.optionBEnglish },
      { key: "C", textHi: q.optionC_Hi || q.optionC || q.optionCHindi, textEn: q.optionC_En || q.optionC || q.optionCEnglish },
      { key: "D", textHi: q.optionD_Hi || q.optionD || q.optionDHindi, textEn: q.optionD_En || q.optionD || q.optionDEnglish },
    ].filter(o => Boolean(o.textHi || o.textEn));
  };

  /* ----------------------------------------------------
     PHASE 1: INSTRUCTIONS SCREEN
  ---------------------------------------------------- */
  if (testPhase === "instructions") {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
        {/* Top Header */}
        <header className="bg-slate-800/90 border-b border-slate-700/80 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/tests" className="text-slate-400 hover:text-white text-sm font-semibold transition-colors">
              ← Exit Test Hub
            </Link>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              {testData.exam?.name || "Rajasthan Exam"}
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-300">
            Aspirant: <span className="text-purple-400 font-bold">{user?.name || "Guest Aspirant"}</span>
          </div>
        </header>

        {/* Content Body */}
        <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 flex-1 w-full space-y-8">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="border-b border-slate-700 pb-4">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2 inline-block">
                Official RPSC / RSSB Blueprint
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {testData.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {testData.description || "Read all general instructions carefully before launching your test session."}
              </p>
            </div>

            {/* Test Blueprint Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 text-center">
              <div>
                <span className="text-[11px] text-slate-500 block font-semibold">Total Questions</span>
                <span className="text-lg font-black text-white">{questions.length || testData.totalQuestions || 0} Qs</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block font-semibold">Test Duration</span>
                <span className="text-lg font-black text-purple-400">{testData.durationMinutes || 60} Mins</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block font-semibold">Maximum Marks</span>
                <span className="text-lg font-black text-emerald-400">{testData.totalMarks || 100} Marks</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block font-semibold">Negative Marking</span>
                <span className="text-lg font-black text-rose-400">-{testData.negativeMarking || "1/3rd"}</span>
              </div>
            </div>

            {/* Guidelines */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <h3 className="text-base font-bold text-white">General Exam Guidelines:</h3>
              <ul className="list-disc list-inside space-y-1.5 text-slate-400">
                <li>The countdown timer at the top will start immediately upon launching the test.</li>
                <li>Each question awards <strong>+{testData.passingMarks ? (testData.totalMarks / (testData.totalQuestions || 1)).toFixed(1) : "1.00"}</strong> for correct answer and deducts <strong>-{testData.negativeMarking || "0.33"}</strong> marks for incorrect response.</li>
                <li>You can switch question language anytime between <strong>Hindi</strong> and <strong>English</strong>.</li>
                <li>You can flag questions using <strong>Mark for Review</strong> to revisit them before submitting.</li>
                <li>Your test will automatically submit if the timer reaches 00:00.</li>
              </ul>
            </div>

            {/* CTA Button */}
            <div className="pt-4 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-400 font-medium">
                Ensure stable internet connectivity during the test.
              </span>
              <button
                onClick={handleStartTest}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-linear-to-r from-purple-600 via-indigo-600 to-purple-600 hover:brightness-110 text-white font-black text-sm shadow-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>⚡</span>
                <span>Launch Mock Test Now</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ----------------------------------------------------
     PHASE 2: INTERACTIVE TEST ENGINE SCREEN
  ---------------------------------------------------- */
  if (testPhase === "taking") {
    const answeredCount = Object.keys(answers).length;
    const reviewedCount = Object.keys(markedForReview).filter((k) => markedForReview[k]).length;
    const currentQId = currentQ?.id;
    const selectedOpt = answers[currentQId]?.selectedAnswer;
    const isMarked = markedForReview[currentQId];
    const options = getOptionsList(currentQ);

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col select-none">
        
        {/* Top Sticky Test Bar */}
        <header className="sticky top-0 z-40 bg-slate-800/95 backdrop-blur-md border-b border-slate-700 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-white max-w-[200px] sm:max-w-md truncate">
              {testData.title}
            </h2>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300">
              Q {currentQIndex + 1} / {questions.length}
            </span>
          </div>

          {/* Center / Right: Countdown Timer & Submit Button */}
          <div className="flex items-center gap-3 sm:gap-6">
            
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setLangPreference("hi")}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                  langPreference === "hi" ? "bg-purple-600 text-white" : "text-slate-400"
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLangPreference("en")}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                  langPreference === "en" ? "bg-purple-600 text-white" : "text-slate-400"
                }`}
              >
                ENG
              </button>
            </div>

            {/* Countdown Clock */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-black text-sm sm:text-base border ${
              timeRemaining < 300 
                ? "bg-red-500/20 border-red-500/50 text-red-400 animate-pulse" 
                : "bg-slate-900 border-slate-700 text-purple-300"
            }`}>
              <span>⏱️</span>
              <span>{formatTime(timeRemaining)}</span>
            </div>

            {/* Submit CTA */}
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 sm:px-5 py-1.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Submit Test
            </button>
          </div>
        </header>

        {/* Main Split Layout */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Canvas: Question & Answers */}
          <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-4xl mx-auto w-full flex flex-col justify-between">
            {currentQ ? (
              <div className="space-y-6">
                
                {/* Question Meta Strip */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400">Question {currentQIndex + 1}</span>
                    {currentQ.subject && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                        {currentQ.subject.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold">
                    <span className="text-emerald-400">+1.00 Marks</span>
                    <span className="text-rose-400">-{testData.negativeMarking || "0.33"} Neg</span>
                  </div>
                </div>

                {/* Question Statement */}
                <div className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                  {langPreference === "hi" 
                    ? (currentQ.questionHindi || currentQ.questionTextHi || currentQ.questionEnglish || currentQ.questionTextEn)
                    : (currentQ.questionEnglish || currentQ.questionTextEn || currentQ.questionHindi || currentQ.questionTextHi)}
                </div>

                {/* Options List */}
                <div className="space-y-3 pt-2">
                  {options.map((opt) => {
                    const isSelected = selectedOpt === opt.key;
                    const optText = langPreference === "hi" ? (opt.textHi || opt.textEn) : (opt.textEn || opt.textHi);
                    return (
                      <div
                        key={opt.key}
                        onClick={() => handleSelectOption(currentQId, opt.key)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                          isSelected
                            ? "bg-purple-600/20 border-purple-500 text-white shadow-md"
                            : "bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-slate-200"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border ${
                          isSelected
                            ? "bg-purple-600 text-white border-purple-500"
                            : "bg-slate-700/60 text-slate-300 border-slate-600"
                        }`}>
                          {opt.key}
                        </div>
                        <span className="text-xs sm:text-sm font-medium leading-normal">
                          {optText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 font-semibold">
                No question available at this index.
              </div>
            )}

            {/* Bottom Question Actions Toolbar */}
            <div className="mt-8 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleMarkReview(currentQId)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isMarked
                      ? "bg-purple-600 text-white border-purple-500"
                      : "bg-slate-800 text-purple-300 border-purple-500/30 hover:bg-slate-700"
                  }`}
                >
                  {isMarked ? "★ Marked for Review" : "☆ Mark for Review"}
                </button>
                {selectedOpt && (
                  <button
                    onClick={() => handleClearResponse(currentQId)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Clear Response
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentQIndex === 0}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentQIndex === questions.length - 1}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white shadow-md transition-colors cursor-pointer"
                >
                  Save & Next →
                </button>
              </div>
            </div>
          </main>

          {/* Right Sidebar: Question Status Palette */}
          <aside className="w-full lg:w-80 bg-slate-800/80 border-t lg:border-t-0 lg:border-l border-slate-700/80 p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Question Palette
              </h3>

              {/* Status Legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-400 mb-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>Review ({reviewedCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span>Unanswered ({questions.length - answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-600" />
                  <span>Total ({questions.length})</span>
                </div>
              </div>

              {/* Number Buttons Grid */}
              <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const isAns = Boolean(answers[q.id]?.selectedAnswer);
                  const isRev = Boolean(markedForReview[q.id]);
                  const isCurr = currentQIndex === idx;

                  let btnBg = "bg-slate-700/60 text-slate-300 border-slate-600";
                  if (isRev) {
                    btnBg = "bg-purple-600 text-white border-purple-400";
                  } else if (isAns) {
                    btnBg = "bg-emerald-600 text-white border-emerald-400";
                  } else if (visitedQuestions[idx]) {
                    btnBg = "bg-rose-500/30 text-rose-300 border-rose-500/40";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleNavigateQuestion(idx)}
                      className={`h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all border cursor-pointer ${btnBg} ${
                        isCurr ? "ring-2 ring-white scale-105" : ""
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Final Trigger */}
            <div className="pt-4 border-t border-slate-700/80 mt-4">
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="w-full py-3 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                Submit Entire Test Paper
              </button>
            </div>
          </aside>
        </div>

        {/* Submit Confirmation Modal */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 text-center">
              <div className="text-4xl">⚠️</div>
              <h3 className="text-lg font-bold text-white">Confirm Test Submission</h3>
              
              <div className="grid grid-cols-2 gap-3 text-xs font-semibold p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                <div className="text-emerald-400">
                  <span className="block text-slate-400 text-[10px]">Attempted</span>
                  <span className="text-base font-black">{answeredCount} Qs</span>
                </div>
                <div className="text-rose-400">
                  <span className="block text-slate-400 text-[10px]">Unattempted</span>
                  <span className="text-base font-black">{questions.length - answeredCount} Qs</span>
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Are you sure you want to end this test session? Your responses will be graded instantly.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                >
                  Resume Test
                </button>
                <button
                  onClick={handleSubmitExam}
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black shadow-lg transition-colors cursor-pointer"
                >
                  {submitting ? "Grading..." : "Yes, Submit Now"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ----------------------------------------------------
     PHASE 3: INSTANT EVALUATION SCORECARD SCREEN
  ---------------------------------------------------- */
  if (testPhase === "submitted" && resultData) {
    const evaluatedAnswers = resultData.evaluatedAnswers || {};
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
        {/* Top Result Header */}
        <header className="bg-slate-800/90 border-b border-slate-700/80 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/tests" className="text-purple-400 hover:text-purple-300 text-xs font-bold transition-colors">
              ← Return to Mock Test Directory
            </Link>
          </div>
          <div className="text-xs font-bold text-slate-300">
            Official Scorecard Evaluated
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 flex-1 w-full space-y-8">
          
          {/* Hero Score Box */}
          <div className="bg-linear-to-r from-purple-900/40 via-slate-800 to-indigo-900/40 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-4">
              <span>🎯</span> Instant Grading Evaluation
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              {testData.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              Submission Recorded for Aspirant: <strong>{user?.name || "Student"}</strong>
            </p>

            {/* Big Score Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-700 text-center">
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Total Marks Scored</span>
                <span className="text-2xl sm:text-3xl font-black text-purple-400">{resultData.score} / {resultData.totalMarks}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Overall Accuracy</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">{resultData.accuracy}%</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Correct Answers</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">{resultData.correctCount}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Incorrect (-Neg)</span>
                <span className="text-2xl sm:text-3xl font-black text-rose-400">{resultData.incorrectCount}</span>
              </div>
            </div>
          </div>

          {/* Question-by-Question Solution Analysis */}
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📖</span>
                <span>Question Solution & Answer Key Analysis</span>
              </h2>
              <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                <button
                  onClick={() => setLangPreference("hi")}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                    langPreference === "hi" ? "bg-purple-600 text-white" : "text-slate-400"
                  }`}
                >
                  हिंदी
                </button>
                <button
                  onClick={() => setLangPreference("en")}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                    langPreference === "en" ? "bg-purple-600 text-white" : "text-slate-400"
                  }`}
                >
                  ENG
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const evalInfo = evaluatedAnswers[q.id] || {};
                const isCorrect = evalInfo.isCorrect;
                const isAttempted = evalInfo.isAttempted;
                const options = getOptionsList(q);

                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl border p-5 transition-all ${
                      !isAttempted
                        ? "bg-slate-800/40 border-slate-700/60"
                        : isCorrect
                        ? "bg-emerald-950/20 border-emerald-500/40"
                        : "bg-rose-950/20 border-rose-500/40"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-3 text-xs">
                      <span className="font-bold text-slate-300">Question {idx + 1}</span>
                      <div className="flex items-center gap-2">
                        {!isAttempted ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">
                            Unattempted (0 M)
                          </span>
                        ) : isCorrect ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ✓ Correct (+{evalInfo.marksAwarded} M)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            ✗ Incorrect ({evalInfo.marksAwarded} M)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question Text */}
                    <h3 className="text-sm font-semibold text-white mb-4 leading-relaxed">
                      {langPreference === "hi" 
                        ? (q.questionHindi || q.questionTextHi || q.questionEnglish || q.questionTextEn)
                        : (q.questionEnglish || q.questionTextEn || q.questionHindi || q.questionTextHi)}
                    </h3>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      {options.map((opt) => {
                        const isStudent = evalInfo.selectedAnswer === opt.key;
                        const isAnswerKey = String(q.correctAnswer).toUpperCase() === opt.key;
                        const optText = langPreference === "hi" ? (opt.textHi || opt.textEn) : (opt.textEn || opt.textHi);

                        let optClass = "bg-slate-900/60 border-slate-700/60 text-slate-300";
                        if (isAnswerKey) {
                          optClass = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                        } else if (isStudent && !isCorrect) {
                          optClass = "bg-rose-500/20 border-rose-500 text-rose-300 line-through";
                        }

                        return (
                          <div
                            key={opt.key}
                            className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${optClass}`}
                          >
                            <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-slate-800">
                              {opt.key}
                            </span>
                            <span className="truncate">{optText}</span>
                            {isAnswerKey && <span className="ml-auto text-emerald-400 font-bold">✓ Correct Key</span>}
                            {isStudent && !isCorrect && <span className="ml-auto text-rose-400">Your choice</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {(q.explanationHindi || q.explanationHi || q.explanationEnglish || q.explanationEn) && (
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
                        <span className="font-bold text-purple-400 block">💡 Detailed Explanation:</span>
                        <p className="leading-relaxed">
                          {langPreference === "hi" 
                            ? (q.explanationHindi || q.explanationHi || q.explanationEnglish || q.explanationEn)
                            : (q.explanationEnglish || q.explanationEn || q.explanationHindi || q.explanationHi)}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
