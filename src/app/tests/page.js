"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import FlashTicker from "@/components/layout/FlashTicker";
import { API_BASE_URL } from "@/config/apiConfig";

export default function MockTestsPage() {
  const [tests, setTests] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedAccess, setSelectedAccess] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [leaderboardModal, setLeaderboardModal] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedExam, selectedType, selectedAccess, selectedDifficulty]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const examRes = await fetch(`${API_BASE_URL}/exams`);
      const examJson = await examRes.json();
      if (examJson.success || examJson.status === "success") {
        const examList = Array.isArray(examJson.data) ? examJson.data : (examJson.exams || examJson.data?.exams || []);
        setExams(Array.isArray(examList) ? examList : []);
      }

      const params = new URLSearchParams();
      if (selectedExam) params.append("examId", selectedExam);
      if (selectedType) params.append("testType", selectedType);
      if (selectedAccess) params.append("isFree", selectedAccess === "free" ? "true" : "false");
      if (selectedDifficulty) params.append("difficultyLevel", selectedDifficulty);

      const testRes = await fetch(`${API_BASE_URL}/tests?${params.toString()}`);
      const testJson = await testRes.json();
      if (testJson.success || testJson.status === "success") {
        const testList = Array.isArray(testJson.data) ? testJson.data : (testJson.mockTests || testJson.data?.mockTests || []);
        setTests(Array.isArray(testList) ? testList : []);
      }
    } catch (err) {
      console.error("Failed to fetch mock tests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLeaderboard = async (test) => {
    setLeaderboardModal(test);
    setLeaderboardLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/tests/${test.id}/leaderboard`);
      const json = await res.json();
      if (json.success || json.status === "success") {
        const lb = Array.isArray(json.data) ? json.data : (json.leaderboard || json.data?.leaderboard || []);
        setLeaderboardData(Array.isArray(lb) ? lb : []);
      }
    } catch (err) {
      console.error("Leaderboard error:", err);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      <Navbar />
      <FlashTicker />

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-radial from-slate-800 via-slate-900 to-[#0b1329] border-b border-slate-800/80 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4 shadow-xs">
            <span>⏱️</span> Real-Time Negative Marking Mock Test Engine
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Rajasthan Test Series & <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-pink-400 to-rose-400">Live Mock Engine</span>
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 font-medium">
            Simulate actual RPSC RAS & RSSB exam conditions with real-time countdown, 1/3rd negative marking, subject-wise section timers, and instant scorecard evaluation.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-8">
        
        {/* Filter Toolbar */}
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Exam Filter */}
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              aria-label="Filter tests by Exam"
              className="bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="">All Rajasthan Exams</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title || e.name} ({e.shortName || e.code || 'EXAM'})
                </option>
              ))}
            </select>

            {/* Test Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filter by Test Structure"
              className="bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="">All Test Formats</option>
              <option value="full_length">Full Length Mock Test</option>
              <option value="sectional">Subject / Sectional Test</option>
              <option value="pyq_paper">Previous Year Mock Paper</option>
              <option value="daily_quiz">Daily Speed Quiz</option>
            </select>

            {/* Difficulty Level */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              aria-label="Filter by Difficulty"
              className="bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="">All Difficulty Levels</option>
              <option value="easy">Easy (Foundational)</option>
              <option value="medium">Medium (Standard RPSC)</option>
              <option value="hard">Hard (Advanced Level)</option>
            </select>

            {/* Free vs Paid */}
            <select
              value={selectedAccess}
              onChange={(e) => setSelectedAccess(e.target.value)}
              aria-label="Filter by Price"
              className="bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="">All Tests (Free & Pro)</option>
              <option value="free">Free Tests Only</option>
              <option value="paid">Premium Series Only</option>
            </select>
          </div>
        </div>

        {/* Tests Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold">Loading Test Series & Question Banks...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-12 text-center max-w-lg mx-auto">
            <div className="text-5xl mb-3">📝</div>
            <h2 className="text-xl font-bold text-white mb-2">No Mock Tests Found</h2>
            <p className="text-xs text-slate-400 mb-6">
              There are no mock tests available matching the selected filter criteria.
            </p>
            <button
              onClick={() => {
                setSelectedExam("");
                setSelectedType("");
                setSelectedAccess("");
                setSelectedDifficulty("");
              }}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-lg cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Array.isArray(tests) ? tests : []).map((test) => (
              <div
                key={test.id}
                className="group bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden"
              >
                <div>
                  {/* Badge Row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {test.testType?.replace("_", " ")}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {test.isFree ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          FREE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          ₹{test.price || 99}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        test.difficultyLevel === "hard" ? "bg-red-500/10 text-red-400" :
                        test.difficultyLevel === "easy" ? "bg-emerald-500/10 text-emerald-400" :
                        "bg-blue-500/10 text-blue-400"
                      }`}>
                        {test.difficultyLevel || "Medium"}
                      </span>
                    </div>
                  </div>

                  {/* Test Title & Description */}
                  <h2 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-2 mb-2 leading-snug">
                    {test.title}
                  </h2>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 font-normal">
                    {test.description || "Official simulation test matching the exact RPSC / RSSB exam blueprint and marking scheme."}
                  </p>

                  {/* Exam / Subject Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4 text-[11px]">
                    {test.exam && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                        🏛️ {test.exam.name}
                      </span>
                    )}
                    {test.subject && (
                      <span className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-300 border border-pink-500/20 font-medium">
                        📖 {test.subject.name}
                      </span>
                    )}
                  </div>

                  {/* Test Specs Strip */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900/70 border border-slate-700/60 text-center mb-4">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold">Questions</span>
                      <strong className="text-xs text-white">{test.totalQuestions || 0} Qs</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold">Duration</span>
                      <strong className="text-xs text-white">{test.durationMinutes || 60} Mins</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold">Total Marks</span>
                      <strong className="text-xs text-white">{test.totalMarks || 100} M</strong>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleOpenLeaderboard(test)}
                    className="text-xs font-semibold text-slate-400 hover:text-purple-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>🏆 Rank Board</span>
                    <span className="text-[10px] text-slate-500">({test.totalAttempts || 0})</span>
                  </button>

                  <Link
                    href={`/tests/${test.id}`}
                    className="px-4 py-2 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                  >
                    <span>⚡</span>
                    <span>Start Test</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Leaderboard Modal */}
      {leaderboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  Aspirant Hall of Fame
                </span>
                <h3 className="text-base font-bold text-white line-clamp-1">
                  {leaderboardModal.title}
                </h3>
              </div>
              <button
                onClick={() => setLeaderboardModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {leaderboardLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs">Fetching top scores...</p>
                </div>
              ) : leaderboardData.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <div className="text-4xl mb-2">🏅</div>
                  <p className="text-xs font-semibold">No student attempts recorded yet. Be the first to top this test!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-400 px-3 py-2 uppercase tracking-wider border-b border-slate-800">
                    <span className="col-span-2">Rank</span>
                    <span className="col-span-5">Aspirant Name</span>
                    <span className="col-span-3 text-right">Score</span>
                    <span className="col-span-2 text-right">Accuracy</span>
                  </div>
                  {leaderboardData.map((row) => (
                    <div
                      key={row.rank}
                      className={`grid grid-cols-12 gap-2 items-center px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        row.rank === 1 ? "bg-amber-500/10 border border-amber-500/30 text-amber-300" :
                        row.rank === 2 ? "bg-slate-400/10 border border-slate-400/20 text-slate-200" :
                        row.rank === 3 ? "bg-orange-500/10 border border-orange-500/20 text-orange-300" :
                        "bg-slate-800/40 text-slate-300"
                      }`}
                    >
                      <div className="col-span-2 flex items-center gap-1.5 font-black">
                        {row.rank === 1 ? "🥇 #1" : row.rank === 2 ? "🥈 #2" : row.rank === 3 ? "🥉 #3" : `#${row.rank}`}
                      </div>
                      <div className="col-span-5 truncate text-white">
                        {row.userName}
                      </div>
                      <div className="col-span-3 text-right font-black text-purple-400">
                        {row.score} / {row.totalMarks}
                      </div>
                      <div className="col-span-2 text-right text-emerald-400 font-bold">
                        {row.accuracy}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-800/30">
              <button
                onClick={() => setLeaderboardModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
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
