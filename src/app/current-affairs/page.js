"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import FlashTicker from "@/components/layout/FlashTicker";
import { API_BASE_URL } from "@/config/apiConfig";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES = [
  { id: "", label: "All News" },
  { id: "rajasthan_special", label: "🏜️ Rajasthan Special" },
  { id: "national", label: "🇮🇳 National Affairs" },
  { id: "schemes_policies", label: "📜 Gov Schemes & Yojana" },
  { id: "economy_budget", label: "📈 Economy & Budget" },
  { id: "awards_sports", label: "🏆 Sports & Honours" },
  { id: "science_tech", label: "🚀 Science & Tech" },
  { id: "environment", label: "🌿 Environment" },
];

export default function CurrentAffairsPage() {
  const { user, token } = useAuth();
  const [newsList, setNewsList] = useState([]);
  const [digest, setDigest] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [language, setLanguage] = useState("hi"); // 'hi' or 'en'
  const [search, setSearch] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [likedArticles, setLikedArticles] = useState({});
  const [savedBookmarks, setSavedBookmarks] = useState(new Set());

  useEffect(() => {
    if (token) {
      fetch(`${API_BASE_URL}/user/vault/bookmarks?type=current_affair`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(d => {
          if (d.success && Array.isArray(d.data)) {
            setSavedBookmarks(new Set(d.data.map(b => b.itemId)));
          }
        })
        .catch(console.error);
    }
  }, [token]);

  useEffect(() => {
    fetchCurrentAffairs();
    fetchDigest();
    fetchStats();
  }, [selectedCategory]);

  const fetchCurrentAffairs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      const res = await fetch(`${API_BASE_URL}/current-affairs?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        const list = Array.isArray(json.data)
          ? json.data
          : (json.data?.currentAffairs || json.currentAffairs || []);
        setNewsList(Array.isArray(list) ? list : []);
      } else {
        setNewsList([]);
      }
    } catch (err) {
      console.error("Failed to fetch current affairs:", err);
      setNewsList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDigest = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/current-affairs/digest`);
      const json = await res.json();
      if (json.success) {
        const articles = Array.isArray(json.data?.articles)
          ? json.data.articles
          : (Array.isArray(json.data) ? json.data : (json.articles || []));
        setDigest(Array.isArray(articles) ? articles : []);
      } else {
        setDigest([]);
      }
    } catch (err) {
      console.error("Failed to fetch digest:", err);
      setDigest([]);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/current-affairs/stats`);
      const json = await res.json();
      if (json.success) {
        setStats(json.data?.stats || json.stats || json.data || null);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleArticleClick = async (article) => {
    setSelectedArticle(article);
    try {
      await fetch(`${API_BASE_URL}/current-affairs/view/${article.id}`, { method: "POST" });
      setNewsList(prev => (Array.isArray(prev) ? prev.map(a => a.id === article.id ? { ...a, viewCount: (a.viewCount || 0) + 1 } : a) : []));
    } catch (err) {
      console.error("View tracking error:", err);
    }
  };

  const handleLike = async (e, articleId) => {
    e.stopPropagation();
    if (likedArticles[articleId]) return;

    try {
      await fetch(`${API_BASE_URL}/current-affairs/like/${articleId}`, { method: "POST" });
      setLikedArticles(prev => ({ ...prev, [articleId]: true }));
      setNewsList(prev => (Array.isArray(prev) ? prev.map(a => a.id === articleId ? { ...a, likesCount: (a.likesCount || a.likeCount || 0) + 1 } : a) : []));
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleToggleBookmark = async (e, articleId) => {
    e.stopPropagation();
    if (!token) {
      alert("Please login to save this editorial to your Personal Vault!");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/user/vault/bookmarks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          itemType: "current_affair",
          itemId: articleId
        })
      });
      const data = await res.json();
      if (data.success) {
        setSavedBookmarks(prev => {
          const next = new Set(prev);
          if (data.bookmarked) {
            next.add(articleId);
          } else {
            next.delete(articleId);
          }
          return next;
        });
      }
    } catch (err) {
      console.error("Bookmark toggle error:", err);
    }
  };

  const safeNewsList = Array.isArray(newsList) ? newsList : [];
  const filteredNews = safeNewsList.filter(article => {
    if (!article) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const tHi = (article.titleHindi || article.titleHi || "").toLowerCase();
    const tEn = (article.titleEnglish || article.titleEn || "").toLowerCase();
    const sHi = (article.summaryHindi || article.summaryHi || "").toLowerCase();
    const sEn = (article.summaryEnglish || article.summaryEn || "").toLowerCase();
    return tHi.includes(q) || tEn.includes(q) || sHi.includes(q) || sEn.includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar />
      <FlashTicker />

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-radial from-slate-800 via-slate-900 to-[#0b1329] border-b border-slate-800/80 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4 shadow-xs">
            <span>📰</span> Daily Rajasthan & National Editorials
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Daily Current Affairs & <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-orange-400 to-rose-400">Exam Digests</span>
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 font-medium">
            Stay ahead in RPSC RAS, RSSB Patwari, CET, and Rajasthan Police exams with verified bilingual news summaries, government schemes, and daily revision bullet points.
          </p>

          {/* Quick Stats Pill */}
          {stats && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-bold text-slate-300">
              <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
                📚 Total Articles: <strong className="text-amber-400">{stats.totalArticles || 0}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
                🏜️ Rajasthan Special: <strong className="text-amber-400">{stats.rajasthanArticles || stats.rajasthanCount || 0}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
                📜 Schemes & Policy: <strong className="text-emerald-400">{stats.schemesCount || stats.todayArticles || 0}</strong>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-10">
        
        {/* Daily Digest Quick Revision Strip */}
        {digest.length > 0 && (
          <div className="bg-linear-to-r from-amber-500/10 via-slate-800 to-rose-500/10 border border-amber-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">⚡</span>
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Daily Quick Revision Digest
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/40">
                Today's High-Yield Bulletins
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {digest.slice(0, 3).map((d) => (
                <div
                  key={d.id}
                  onClick={() => handleArticleClick(d)}
                  className="bg-slate-900/80 hover:bg-slate-900 border border-slate-700/80 hover:border-amber-500/50 rounded-2xl p-4 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1.5 block">
                      {d.category?.replace("_", " ")}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-2 mb-2">
                      {language === "hi" 
                        ? (d.titleHindi || d.titleHi) 
                        : (d.titleEnglish || d.titleEn || d.titleHindi || d.titleHi)}
                    </h3>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800">
                    <span>📅 {new Date(d.date || d.publishDate || d.createdAt).toLocaleDateString()}</span>
                    <span className="text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                      Read Digest →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories & Language Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-md">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-amber-500 text-slate-950 shadow-md scale-105"
                    : "bg-slate-900/60 text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search & Language Switcher */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search current affairs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            {/* Language Toggle */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700 shrink-0">
              <button
                onClick={() => setLanguage("hi")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === "hi" ? "bg-amber-500 text-slate-950 shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === "en" ? "bg-amber-500 text-slate-950 shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                ENG
              </button>
            </div>
          </div>
        </div>

        {/* Current Affairs Articles Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold">Fetching Daily Bulletins & Editorials...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-12 text-center max-w-lg mx-auto">
            <div className="text-5xl mb-3">📰</div>
            <h2 className="text-xl font-bold text-white mb-2">No Articles Found</h2>
            <p className="text-xs text-slate-400">
              There are no current affairs entries matching your active filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((article) => {
              const displayTitle = language === "hi" 
                ? (article.titleHindi || article.titleHi) 
                : (article.titleEnglish || article.titleEn || article.titleHindi || article.titleHi);
              const displaySummary = language === "hi" 
                ? (article.summaryHindi || article.summaryHi) 
                : (article.summaryEnglish || article.summaryEn || article.summaryHindi || article.summaryHi);
              const articleDate = article.date || article.publishDate || article.createdAt;
              const likeCount = article.likesCount ?? article.likeCount ?? 0;

              return (
                <div
                  key={article.id}
                  onClick={() => handleArticleClick(article)}
                  className="group bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-700/80 text-amber-400 border border-amber-500/20">
                        {article.category?.replace("_", " ")}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        📅 {new Date(articleDate).toLocaleDateString()}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 mb-2 leading-snug">
                      {displayTitle}
                    </h2>

                    <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed font-normal">
                      {displaySummary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 text-slate-400">
                      <span title="Total Views">👁️ {article.viewCount || 0}</span>
                      <button
                        onClick={(e) => handleLike(e, article.id)}
                        className={`flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer ${
                          likedArticles[article.id] ? "text-rose-400 font-bold" : ""
                        }`}
                        title="Like Article"
                      >
                        <span>❤️</span>
                        <span>{likeCount}</span>
                      </button>
                      <button
                        onClick={(e) => handleToggleBookmark(e, article.id)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                          savedBookmarks.has(article.id)
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "hover:text-amber-400 text-slate-400"
                        }`}
                        title={savedBookmarks.has(article.id) ? "Saved in Personal Vault" : "Save to Vault"}
                      >
                        <span>{savedBookmarks.has(article.id) ? "★" : "☆"}</span>
                        <span>{savedBookmarks.has(article.id) ? "Saved" : "Save"}</span>
                      </button>
                    </div>

                    <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>Full Editorial</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Article Detail Full Reading Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {selectedArticle.category?.replace("_", " ")}
                </span>
                <span className="text-xs text-slate-400 ml-3">
                  📅 {new Date(selectedArticle.date || selectedArticle.publishDate || selectedArticle.createdAt).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-200">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {language === "hi" 
                  ? (selectedArticle.titleHindi || selectedArticle.titleHi) 
                  : (selectedArticle.titleEnglish || selectedArticle.titleEn || selectedArticle.titleHindi || selectedArticle.titleHi)}
              </h2>

              {/* Summary Highlight Box */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-medium leading-relaxed">
                <span className="font-bold block mb-1">⚡ Quick Summary (संक्षिप्त सारांश):</span>
                {language === "hi" 
                  ? (selectedArticle.summaryHindi || selectedArticle.summaryHi) 
                  : (selectedArticle.summaryEnglish || selectedArticle.summaryEn || selectedArticle.summaryHindi || selectedArticle.summaryHi)}
              </div>

              {/* Detailed Long-form Content */}
              <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-4">
                <h3 className="text-base font-bold text-white">Editorial Analysis & Exam Relevance:</h3>
                <div className="whitespace-pre-line">
                  {language === "hi" 
                    ? (selectedArticle.contentHindi || selectedArticle.contentHi || selectedArticle.summaryHindi || selectedArticle.summaryHi)
                    : (selectedArticle.contentEnglish || selectedArticle.contentEn || selectedArticle.contentHindi || selectedArticle.contentHi || selectedArticle.summaryEnglish || selectedArticle.summaryHi)}
                </div>
              </div>

              {/* Exam Relevance Chips */}
              {Array.isArray(selectedArticle.examRelevance) && selectedArticle.examRelevance.length > 0 && (
                <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-2 text-xs">
                  <span className="text-slate-500 font-semibold">Target Exams:</span>
                  {selectedArticle.examRelevance.map((ex, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                      {ex}
                    </span>
                  ))}
                </div>
              )}

              {/* Tags */}
              {selectedArticle.tags && (
                <div className="pt-2 flex flex-wrap gap-2 text-xs">
                  <span className="text-slate-500 font-semibold">Key Topics:</span>
                  {Array.isArray(selectedArticle.tags)
                    ? selectedArticle.tags.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          #{t}
                        </span>
                      ))
                    : typeof selectedArticle.tags === "string"
                    ? selectedArticle.tags.split(",").map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          #{t.trim()}
                        </span>
                      ))
                    : null}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-800/30">
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>👁️ {selectedArticle.viewCount || 0} Views</span>
                <span>❤️ {selectedArticle.likesCount ?? selectedArticle.likeCount ?? 0} Likes</span>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
              >
                Close Editorial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
