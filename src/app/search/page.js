"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import FlashTicker from "@/components/layout/FlashTicker";
import { API_BASE_URL } from "@/config/apiConfig";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get("q") || "";
  const initialType = searchParams.get("type") || "all";

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState(initialType);
  const [results, setResults] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [isFreeOnly, setIsFreeOnly] = useState(false);
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal readers
  const [expandedQuestion, setExpandedQuestion] = useState({});
  const [readingArticle, setReadingArticle] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    executeSearch();
  }, [initialQuery, activeTab, selectedExam, isFreeOnly, difficulty]);

  const fetchExams = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/exams`);
      const json = await res.json();
      if (json.success) {
        setExams(json.data?.exams || json.exams || (Array.isArray(json.data) ? json.data : []));
      }
    } catch (err) {
      console.error("Exams fetch error:", err);
    }
  };

  const executeSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (activeTab !== "all") params.append("type", activeTab);
      if (selectedExam) params.append("examId", selectedExam);
      if (isFreeOnly) params.append("isFree", "true");
      if (difficulty) params.append("difficulty", difficulty);

      const res = await fetch(`${API_BASE_URL}/search?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setResults(json.data);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}&type=${activeTab}`);
  };

  const toggleQuestionExplanation = (qId) => {
    setExpandedQuestion((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const counts = results?.counts || {
    all: 0,
    exams: 0,
    materials: 0,
    questions: 0,
    tests: 0,
    currentAffairs: 0,
    announcements: 0,
  };

  const tabs = [
    { id: "all", label: "All Vault Results", count: counts.all, icon: "⚡" },
    { id: "exams", label: "Exams", count: counts.exams, icon: "🏛️" },
    { id: "materials", label: "Notes & PYQs", count: counts.materials, icon: "📚" },
    { id: "questions", label: "Question Bank", count: counts.questions, icon: "❓" },
    { id: "tests", label: "Mock Tests", count: counts.tests, icon: "⏱️" },
    { id: "current_affairs", label: "Current Affairs", count: counts.currentAffairs, icon: "📰" },
    { id: "announcements", label: "Alerts", count: counts.announcements, icon: "📢" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      <Navbar />
      <FlashTicker />

      {/* Hero Search Section */}
      <section className="relative overflow-hidden bg-radial from-slate-800 via-slate-900 to-[#0b1329] border-b border-slate-800/80 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-3 shadow-xs">
            <span>🔍</span> Universal Rajasthan Exam Vault Search
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-6">
            Search Across <span className="text-transparent bg-clip-text bg-linear-to-r from-rose-400 via-amber-400 to-red-500">All Exams, Notes & Mock Tests</span>
          </h1>

          {/* Big Search Input Form */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search by topic, PYQ, exam, question, or scheme (e.g. RAS, Patwari, Rajasthan GK)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-800/90 border-2 border-slate-700 hover:border-rose-500/50 focus:border-rose-500 rounded-2xl pl-5 pr-28 py-3.5 text-sm sm:text-base text-white placeholder-slate-400 outline-none transition-all shadow-2xl"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Main Aggregated Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20 scale-105"
                  : "bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-700 text-slate-300"
              }`}>
                {tab.count || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Layout: Sidebar Filter + Results Panel */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Facet Filters Sidebar */}
          <aside className="w-full lg:w-64 bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-5 space-y-5 shrink-0">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Filter Results
            </h3>

            {/* Target Exam Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">Target Exam</label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="">All Exams</option>
                {exams.map((e) => (
                  <option key={e.id} value={e.id}>{e.shortName || e.title || e.name}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="">All Levels</option>
                <option value="easy">Easy (Beginner)</option>
                <option value="medium">Medium (Standard)</option>
                <option value="hard">Hard (Advanced)</option>
              </select>
            </div>

            {/* Free only toggle */}
            <div className="pt-2 border-t border-slate-700/60">
              <label className="flex items-center gap-2.5 text-xs text-slate-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFreeOnly}
                  onChange={(e) => setIsFreeOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 bg-slate-900 border-slate-700 focus:ring-rose-500 cursor-pointer"
                />
                <span>Free Access Only</span>
              </label>
            </div>
          </aside>

          {/* Right Results Stream */}
          <div className="flex-1 w-full space-y-6">
            {loading ? (
              <div className="py-20 text-center text-slate-400">
                <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-semibold">Executing Vault Aggregated Query...</p>
              </div>
            ) : counts.all === 0 ? (
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-12 text-center max-w-md mx-auto">
                <div className="text-5xl mb-3">🔍</div>
                <h3 className="text-lg font-bold text-white mb-1">No Results Found</h3>
                <p className="text-xs text-slate-400 mb-4">
                  We could not find any exams, study materials, or questions matching "{query}".
                </p>
                <button
                  onClick={() => {
                    setQuery("");
                    setSelectedExam("");
                    setIsFreeOnly(false);
                    setDifficulty("");
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* 1. Exams Section */}
                {(activeTab === "all" || activeTab === "exams") && results?.data?.exams?.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span>🏛️</span> Target Rajasthan Exams ({results.data.exams.length})
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {results.data.exams.map((exam) => (
                        <Link
                          key={exam.id}
                          href={exam.url}
                          className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 transition-all flex items-center justify-between group shadow-md"
                        >
                          <div>
                            <span className="text-[10px] font-bold uppercase text-blue-400 mb-0.5 block">
                              {exam.category} • {exam.code}
                            </span>
                            <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                              {exam.title}
                            </h3>
                          </div>
                          <span className="text-blue-400 font-bold text-xs group-hover:translate-x-1 transition-transform">
                            Hub →
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Study Materials Section */}
                {(activeTab === "all" || activeTab === "materials") && results?.data?.materials?.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📚</span> Verified Study Materials & Notes ({results.data.materials.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {results.data.materials.map((mat) => (
                        <div
                          key={mat.id}
                          className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-rose-500/50 transition-all flex flex-col justify-between group shadow-md"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-700 text-rose-400">
                                {mat.contentType?.replace("_", " ")}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-400">
                                {mat.isFree ? "FREE" : `₹${mat.price}`}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors line-clamp-1">
                              {mat.title}
                            </h3>
                            <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                              {mat.description}
                            </p>
                          </div>
                          <div className="pt-3 border-t border-slate-700/60 mt-3 flex items-center justify-between text-xs">
                            <span className="text-slate-500 text-[11px]">📥 {mat.downloadCount || 0} downloads</span>
                            <Link
                              href="/materials"
                              className="text-rose-400 font-bold hover:underline"
                            >
                              Open Vault →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Mock Tests Section */}
                {(activeTab === "all" || activeTab === "tests") && results?.data?.tests?.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>⏱️</span> Mock Test Series ({results.data.tests.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {results.data.tests.map((test) => (
                        <div
                          key={test.id}
                          className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-purple-500/50 transition-all flex flex-col justify-between group shadow-md"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300">
                                {test.testType?.replace("_", " ")}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold">
                                {test.totalQuestions} Qs • {test.durationMinutes}m
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                              {test.title}
                            </h3>
                          </div>
                          <div className="pt-3 border-t border-slate-700/60 mt-3 flex items-center justify-between text-xs">
                            <span className="text-emerald-400 font-bold">{test.isFree ? "Free Test" : `₹${test.price}`}</span>
                            <Link
                              href={test.url}
                              className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
                            >
                              Attempt Test →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Question Bank Section */}
                {(activeTab === "all" || activeTab === "questions") && results?.data?.questions?.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>❓</span> Question Bank & PYQ Repository ({results.data.questions.length})
                    </h2>
                    <div className="space-y-3">
                      {results.data.questions.map((q) => (
                        <div
                          key={q.id}
                          className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3 shadow-md"
                        >
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {q.isPYQ ? `PYQ ${q.pyqYear || ""}` : "Practice MCQ"}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              {q.subject?.name || "General Section"}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                            {q.questionTextHi || q.questionTextEn}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
                            <button
                              onClick={() => toggleQuestionExplanation(q.id)}
                              className="text-amber-400 font-bold hover:underline cursor-pointer"
                            >
                              {expandedQuestion[q.id] ? "Hide Solution ▲" : "View Correct Answer & Solution ▼"}
                            </button>
                            <span className="text-slate-500 text-[11px] uppercase">Level: {q.difficultyLevel || "Medium"}</span>
                          </div>

                          {expandedQuestion[q.id] && (
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5 animate-fade-in">
                              <div className="font-bold text-emerald-400">
                                Correct Answer: Option {q.correctAnswer}
                              </div>
                              {(q.explanationHi || q.explanationEn) && (
                                <p className="text-slate-300 leading-relaxed">
                                  {q.explanationHi || q.explanationEn}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Current Affairs Section */}
                {(activeTab === "all" || activeTab === "current_affairs") && results?.data?.currentAffairs?.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📰</span> Current Affairs & Editorials ({results.data.currentAffairs.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {results.data.currentAffairs.map((ca) => (
                        <div
                          key={ca.id}
                          className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/50 transition-all flex flex-col justify-between group shadow-md"
                        >
                          <div>
                            <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1">
                              {ca.category?.replace("_", " ")}
                            </span>
                            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                              {ca.titleHi || ca.titleEn}
                            </h3>
                            <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                              {ca.summaryHi || ca.summaryEn}
                            </p>
                          </div>
                          <div className="pt-3 border-t border-slate-700/60 mt-3 flex items-center justify-between text-xs">
                            <span className="text-slate-500 text-[11px]">📅 {new Date(ca.publishDate).toLocaleDateString()}</span>
                            <Link href="/current-affairs" className="text-amber-400 font-bold hover:underline">
                              Read Full Editorial →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Announcements Section */}
                {(activeTab === "all" || activeTab === "announcements") && results?.data?.announcements?.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📢</span> Official Alerts & Flash Notifications ({results.data.announcements.length})
                    </h2>
                    <div className="space-y-2">
                      {results.data.announcements.map((ann) => (
                        <div
                          key={ann.id}
                          className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between gap-4 shadow-md"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/20 text-red-400">
                                {ann.type?.replace("_", " ")}
                              </span>
                              {ann.exam && <span className="text-xs text-blue-400 font-bold">{ann.exam.name}</span>}
                            </div>
                            <h3 className="text-sm font-bold text-white">{ann.title}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">{ann.content}</p>
                          </div>
                          {ann.actionUrl && (
                            <a
                              href={ann.actionUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold shrink-0 transition-colors"
                            >
                              Official Link ↗
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Vault Search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
