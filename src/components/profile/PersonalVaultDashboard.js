"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/config/apiConfig";

export default function PersonalVaultDashboard() {
  const { user, token } = useAuth();

  const [stats, setStats] = useState(null);
  const [strengths, setStrengths] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [activeBookmarkTab, setActiveBookmarkTab] = useState("all"); // 'all' | 'question' | 'material' | 'test' | 'current_affair'
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState({});

  useEffect(() => {
    if (token) {
      fetchVaultData();
    }
  }, [token]);

  const fetchVaultData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Stats
      const statsRes = await fetch(`${API_BASE_URL}/user/vault/stats`, { headers });
      const statsJson = await statsRes.json();
      if (statsJson.success) setStats(statsJson.data);

      // 2. Fetch Subject Strengths
      const strRes = await fetch(`${API_BASE_URL}/user/vault/subject-strengths`, { headers });
      const strJson = await strRes.json();
      if (strJson.success) setStrengths(strJson.data || []);

      // 3. Fetch Test Attempts History
      const attRes = await fetch(`${API_BASE_URL}/user/vault/attempts`, { headers });
      const attJson = await attRes.json();
      if (attJson.success) setAttempts(attJson.data || []);

      // 4. Fetch Bookmarks
      const bmRes = await fetch(`${API_BASE_URL}/user/vault/bookmarks`, { headers });
      const bmJson = await bmRes.json();
      if (bmJson.success) setBookmarks(bmJson.data || []);
    } catch (err) {
      console.error("Failed to load personal vault data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/vault/bookmarks/${bookmarkId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
        if (stats) setStats(prev => ({ ...prev, totalBookmarks: Math.max(0, prev.totalBookmarks - 1) }));
      }
    } catch (err) {
      console.error("Error removing bookmark:", err);
    }
  };

  const toggleQuestionSol = (qId) => {
    setExpandedQuestion(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const filteredBookmarks = bookmarks.filter(b => {
    if (activeBookmarkTab === "all") return true;
    return b.itemType === activeBookmarkTab;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold">Synchronizing your Personal Vault & Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* 1. Performance Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Tests Attempted
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats?.totalTests || 0}</span>
            <span className="text-xs font-semibold text-slate-400">Tests</span>
          </div>
          <span className="text-[10px] text-blue-600 font-bold mt-2 block">
            {stats?.totalCorrect || 0} Correct • {stats?.totalIncorrect || 0} Incorrect
          </span>
        </div>

        {/* Mean Accuracy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Mean Accuracy
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-black ${
              (stats?.meanAccuracy || 0) >= 70 ? "text-emerald-600" :
              (stats?.meanAccuracy || 0) >= 50 ? "text-amber-600" : "text-slate-900"
            }`}>
              {stats?.meanAccuracy || 0}%
            </span>
            <span className="text-xs font-bold text-slate-400">Accuracy</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-2 block">
            🎯 Rank Percentile: Top ~{100 - (stats?.percentileEstimate || 50)}%
          </span>
        </div>

        {/* Total Study Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Study Practice Time
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-600">{stats?.studyHours || 0}</span>
            <span className="text-xs font-bold text-slate-400">Hours</span>
          </div>
          <span className="text-[10px] text-purple-600 font-bold mt-2 block">
            ⏱️ {Math.round((stats?.totalStudyTimeSeconds || 0) / 60)} Mins in Live Engine
          </span>
        </div>

        {/* Saved Bookmarks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Personal Bookmarks
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-600">{stats?.totalBookmarks || 0}</span>
            <span className="text-xs font-bold text-slate-400">Saved Items</span>
          </div>
          <span className="text-[10px] text-rose-600 font-bold mt-2 block">
            ⭐ High-Yield Revision Vault
          </span>
        </div>
      </div>

      {/* 2. Subject Mastery & Weak Area Radar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <span>🎯</span>
              <span>Subject Strengths & Weak Area Radar</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifies your highest scoring domains and subjects requiring focused revision.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strengths.map((s, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800">{s.subject}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] ${
                  s.accuracy >= 75 ? "bg-emerald-100 text-emerald-800" :
                  s.accuracy >= 50 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                }`}>
                  {s.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    s.accuracy >= 75 ? "bg-emerald-500" :
                    s.accuracy >= 50 ? "bg-amber-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.max(5, s.accuracy)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>{s.correctQuestions || 0} / {s.totalQuestions || 0} Correct</span>
                <span className="font-bold text-slate-700">{s.accuracy}% Accuracy</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Mock Test History Log */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <span>⏱️</span>
              <span>Test Attempt History</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review scores, accuracy, and detailed question-by-question answer keys.
            </p>
          </div>
          <Link
            href="/tests"
            className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold hover:bg-purple-100 transition-colors"
          >
            Take New Test →
          </Link>
        </div>

        {attempts.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <div className="text-3xl mb-2">📝</div>
            <p className="text-xs font-semibold">You haven't attempted any mock tests yet.</p>
            <Link href="/tests" className="text-purple-600 font-bold text-xs hover:underline mt-1 inline-block">
              Browse Available Test Series →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-2">Test Name & Exam</th>
                  <th className="pb-2 text-center">Score</th>
                  <th className="pb-2 text-center">Accuracy</th>
                  <th className="pb-2 text-center">Time Spent</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3">
                      <div className="font-bold text-slate-900">{att.mockTestTitle}</div>
                      <span className="text-[10px] text-slate-400">{att.examName} • {new Date(att.submittedAt).toLocaleDateString()}</span>
                    </td>
                    <td className="py-3 text-center font-bold text-slate-900">
                      {att.score} / {att.totalMarks}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        att.accuracy >= 70 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        att.accuracy >= 50 ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                        {att.accuracy}%
                      </span>
                    </td>
                    <td className="py-3 text-center text-slate-500">
                      {Math.floor(att.timeSpentSeconds / 60)}m {att.timeSpentSeconds % 60}s
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/tests/${att.mockTestId}`}
                        className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                      >
                        Retake
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Bookmarked Items Vault */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <span>⭐</span>
              <span>Saved Vault Bookmarks</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Personal quick revision repository for difficult MCQs, study notes, and articles.
            </p>
          </div>

          {/* Bookmark Type Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveBookmarkTab("all")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeBookmarkTab === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All ({bookmarks.length})
            </button>
            <button
              onClick={() => setActiveBookmarkTab("question")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeBookmarkTab === "question" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Questions
            </button>
            <button
              onClick={() => setActiveBookmarkTab("material")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeBookmarkTab === "material" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => setActiveBookmarkTab("current_affair")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeBookmarkTab === "current_affair" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Current Affairs
            </button>
          </div>
        </div>

        {filteredBookmarks.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <div className="text-3xl mb-2">📁</div>
            <p className="text-xs font-semibold">No bookmarked items in this folder yet.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Click the bookmark icon on any question, PDF, or editorial to save it here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookmarks.map((bm) => (
              <div
                key={bm.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-700">
                      {bm.itemType?.replace("_", " ")}
                    </span>
                    
                    {/* Item title / content */}
                    {bm.itemType === "question" && (
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed pt-1">
                        {bm.item?.questionTextHi || bm.item?.questionTextEn || `Question #${bm.itemId}`}
                      </p>
                    )}

                    {bm.itemType === "material" && (
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 pt-1">
                          {bm.item?.title || `Study Material #${bm.itemId}`}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{bm.item?.description}</p>
                      </div>
                    )}

                    {bm.itemType === "current_affair" && (
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 pt-1">
                          {bm.item?.titleHi || bm.item?.titleEn || `Article #${bm.itemId}`}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{bm.item?.summaryHi || bm.item?.summaryEn}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemoveBookmark(bm.id)}
                    className="text-slate-400 hover:text-rose-600 text-xs font-bold p-1 transition-colors cursor-pointer shrink-0"
                    title="Remove from vault"
                  >
                    ✕ Remove
                  </button>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <span className="text-[11px] text-slate-400">
                    Saved on {new Date(bm.createdAt).toLocaleDateString()}
                  </span>

                  {bm.itemType === "question" && bm.item && (
                    <button
                      onClick={() => toggleQuestionSol(bm.itemId)}
                      className="text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      {expandedQuestion[bm.itemId] ? "Hide Solution ▲" : "View Solution ▼"}
                    </button>
                  )}

                  {bm.itemType === "material" && (
                    <Link href="/materials" className="text-rose-600 font-bold hover:underline">
                      Open in Materials Hub →
                    </Link>
                  )}

                  {bm.itemType === "current_affair" && (
                    <Link href="/current-affairs" className="text-amber-600 font-bold hover:underline">
                      Read Editorial →
                    </Link>
                  )}
                </div>

                {/* Collapsible Question Solution */}
                {expandedQuestion[bm.itemId] && bm.item && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs space-y-1 mt-1">
                    <div className="font-bold text-blue-900">Correct Answer: Option {bm.item.correctAnswer}</div>
                    <p className="text-slate-700 leading-relaxed">{bm.item.explanationHi || bm.item.explanationEn || "No explanation provided."}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
