"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import FlashTicker from "@/components/layout/FlashTicker";
import Footer from "@/components/layout/Footer";
import currentAffairService from "@/services/currentAffairService";
import { API_BASE_URL } from "@/config/apiConfig";
import { useAuth } from "@/context/AuthContext";

const CATEGORY_META = {
  rajasthan_special: { label: "Rajasthan Special", icon: "🏜️", color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300" },
  national: { label: "National Affairs", icon: "🇮🇳", color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300" },
  international: { label: "International", icon: "🌐", color: "from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-300" },
  schemes_policies: { label: "Gov Schemes & Yojana", icon: "📜", color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300" },
  economy_budget: { label: "Economy & Budget", icon: "📈", color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-300" },
  awards_sports: { label: "Sports & Honours", icon: "🏆", color: "from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-300" },
  science_tech: { label: "Science & Tech", icon: "🚀", color: "from-cyan-500/20 to-sky-500/20 border-cyan-500/30 text-cyan-300" },
  environment: { label: "Environment & Ecology", icon: "🌿", color: "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-300" },
};

export default function CurrentAffairDetailPage({ params }) {
  const resolvedParams = use(params);
  const rawSlug = resolvedParams?.slug;
  const decodedSlug = rawSlug ? decodeURIComponent(rawSlug) : "";

  const { user, token } = useAuth();

  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Reader Preferences
  const [language, setLanguage] = useState("hi"); // 'hi' | 'en' | 'dual'
  const [fontSize, setFontSize] = useState("base"); // 'sm' | 'base' | 'lg'
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  // MCQ practice interaction state
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState({});

  useEffect(() => {
    if (!decodedSlug) return;
    loadArticle(decodedSlug);
  }, [decodedSlug]);

  useEffect(() => {
    if (!token || !article?.id) return;
    checkBookmarkStatus(article.id);
  }, [token, article?.id]);

  const loadArticle = async (slugOrId) => {
    try {
      setLoading(true);
      setNotFound(false);

      const res = await currentAffairService.getArticle(slugOrId);
      const articleData = res?.data?.article || res?.article || res?.data;

      if (!articleData) {
        setNotFound(true);
        return;
      }

      setArticle(articleData);
      setLikesCount(articleData.likesCount ?? articleData.likeCount ?? 0);

      // Determine initial language preference based on available fields
      if (!articleData.titleHindi && articleData.titleEnglish) {
        setLanguage("en");
      }

      // Record view count
      try {
        await currentAffairService.trackView(articleData.id);
      } catch (err) {
        console.warn("View tracking silently failed:", err?.message);
      }

      // Fetch related articles from same category
      fetchRelated(articleData.category, articleData.id);
    } catch (err) {
      console.error("Error fetching article details:", err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelated = async (category, currentId) => {
    try {
      const res = await currentAffairService.getAllCurrentAffairs({
        category: category || "all",
        limit: 5,
      });
      const list = res?.data?.currentAffairs || res?.currentAffairs || (Array.isArray(res?.data) ? res.data : []);
      const filtered = list.filter((item) => item.id !== currentId).slice(0, 4);
      setRelatedArticles(filtered);
    } catch (e) {
      console.warn("Could not fetch related articles:", e);
    }
  };

  const checkBookmarkStatus = async (articleId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/vault/bookmarks?type=current_affair`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const found = json.data.some((b) => Number(b.itemId) === Number(articleId));
        setIsBookmarked(found);
      }
    } catch (e) {
      console.warn("Failed checking bookmark status:", e);
    }
  };

  const handleLike = async () => {
    if (liked || !article?.id) return;
    try {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
      await currentAffairService.trackLike(article.id);
    } catch (err) {
      console.error("Like tracking error:", err);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!token) {
      alert("Please login to save this editorial into your Personal Revision Vault!");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/user/vault/bookmarks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemType: "current_affair",
          itemId: article.id,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsBookmarked(Boolean(json.bookmarked));
      }
    } catch (e) {
      console.error("Bookmark toggle failed:", e);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOptionSelect = (qIdx, optIdx) => {
    if (selectedAnswers[qIdx] !== undefined) return; // Prevent re-selection
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    setShowExplanations((prev) => ({ ...prev, [qIdx]: true }));
  };

  const categoryMeta = article?.category && CATEGORY_META[article.category]
    ? CATEGORY_META[article.category]
    : { label: article?.category?.replace(/_/g, " ") || "General GK", icon: "📰", color: "from-slate-500/20 to-slate-600/20 border-slate-500/30 text-slate-300" };

  const fontSizeClass =
    fontSize === "sm" ? "text-xs sm:text-sm leading-relaxed" : fontSize === "lg" ? "text-base sm:text-lg leading-loose" : "text-sm sm:text-base leading-relaxed";

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <Navbar />
      <FlashTicker />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Loading State */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-4 w-48 bg-slate-800 rounded-md" />
            <div className="h-10 w-3/4 bg-slate-800 rounded-xl" />
            <div className="h-6 w-1/2 bg-slate-800/60 rounded-md" />
            <div className="h-64 bg-slate-800/40 rounded-3xl border border-slate-800" />
            <div className="space-y-3 pt-6">
              <div className="h-4 bg-slate-800 rounded-md" />
              <div className="h-4 bg-slate-800 rounded-md w-5/6" />
              <div className="h-4 bg-slate-800 rounded-md w-4/6" />
            </div>
          </div>
        )}

        {/* Not Found State */}
        {!loading && (notFound || !article) && (
          <div className="text-center py-20 px-6 bg-slate-900/60 border border-slate-800 rounded-3xl max-w-2xl mx-auto shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl">
              📰
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
              Current Affairs Article Not Found
            </h1>
            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
              The editorial or news bulletin you are searching for might have been archived, renamed, or is temporarily unavailable.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/current-affairs"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
              >
                ← Browse All Current Affairs
              </Link>
              <Link
                href="/"
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all border border-slate-700"
              >
                Go to Homepage
              </Link>
            </div>
          </div>
        )}

        {/* Active Article Details */}
        {!loading && article && (
          <article className="space-y-8 animate-fade-in">
            {/* Top Navigation & Breadcrumb */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-400 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Home
                </Link>
                <span>/</span>
                <Link href="/current-affairs" className="hover:text-amber-400 transition-colors">
                  Current Affairs
                </Link>
                <span>/</span>
                <span className="text-amber-400 truncate max-w-xs sm:max-w-md">
                  {article.category?.replace(/_/g, " ") || "Article"}
                </span>
              </div>

              <Link
                href="/current-affairs"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-700/60"
              >
                <span>←</span>
                <span>All Articles</span>
              </Link>
            </div>

            {/* Article Header Card */}
            <header className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-slate-800/90 shadow-2xl relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border bg-gradient-to-r flex items-center gap-1.5 ${categoryMeta.color}`}>
                  <span>{categoryMeta.icon}</span>
                  <span className="uppercase tracking-wider">{categoryMeta.label}</span>
                </span>

                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <span>📅</span>
                  <span>{article.date ? new Date(article.date).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" }) : "Recent"}</span>
                </span>

                <span className="text-slate-600">•</span>

                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <span>👁️</span>
                  <span>{(article.viewCount || 0) + 1} views</span>
                </span>

                <span className="text-slate-600">•</span>

                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <span>✓</span>
                  <span>Exam Verified</span>
                </span>
              </div>

              {/* Main Headline (Hindi / English / Dual) */}
              <div className="space-y-3">
                {language === "dual" ? (
                  <>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug">
                      {article.titleHindi || article.titleEnglish}
                    </h1>
                    {article.titleEnglish && article.titleHindi && (
                      <h2 className="text-lg sm:text-xl font-bold text-slate-300 leading-normal">
                        {article.titleEnglish}
                      </h2>
                    )}
                  </>
                ) : language === "hi" ? (
                  <>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug">
                      {article.titleHindi || article.titleEnglish}
                    </h1>
                    {article.titleEnglish && article.titleHindi && (
                      <p className="text-sm font-medium text-slate-400 leading-normal">
                        {article.titleEnglish}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug">
                      {article.titleEnglish || article.titleHindi}
                    </h1>
                    {article.titleHindi && article.titleEnglish && (
                      <p className="text-sm font-medium text-slate-400 leading-normal font-hindi">
                        {article.titleHindi}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Target Exam Badges */}
              {(article.examRelevance || article.tags) && (
                <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Relevant For:</span>
                  {(Array.isArray(article.examRelevance) ? article.examRelevance : []).map((exam, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold shadow-xs"
                    >
                      {exam}
                    </span>
                  ))}
                  {Array.isArray(article.tags) &&
                    article.tags.map((tag, idx) => (
                      <span
                        key={`tag-${idx}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>
              )}
            </header>

            {/* Sticky/Interactive Reader Tool Strip */}
            <div className="sticky top-20 z-20 p-3 sm:p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setLanguage("hi")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    language === "hi"
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  हिंदी (Hindi)
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    language === "en"
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage("dual")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    language === "dual"
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Dual View 🌐
                </button>
              </div>

              {/* Font Size Adjuster */}
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
                <span className="px-2 text-slate-500 font-semibold">Size:</span>
                <button
                  onClick={() => setFontSize("sm")}
                  className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center transition-all ${
                    fontSize === "sm" ? "bg-slate-800 text-amber-400 border border-slate-700" : "text-slate-400 hover:text-white"
                  }`}
                  title="Compact Font Size"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize("base")}
                  className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center transition-all ${
                    fontSize === "base" ? "bg-slate-800 text-amber-400 border border-slate-700" : "text-slate-400 hover:text-white"
                  }`}
                  title="Default Font Size"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize("lg")}
                  className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center transition-all ${
                    fontSize === "lg" ? "bg-slate-800 text-amber-400 border border-slate-700" : "text-slate-400 hover:text-white"
                  }`}
                  title="Large Font Size"
                >
                  A+
                </button>
              </div>

              {/* Action Buttons: Like, Bookmark, Share, Print */}
              <div className="flex items-center gap-2">
                {/* Like Button */}
                <button
                  onClick={handleLike}
                  disabled={liked}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    liked
                      ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                      : "bg-slate-800/80 hover:bg-rose-500/10 border-slate-700 text-slate-300 hover:text-rose-400 hover:border-rose-500/30"
                  }`}
                  title="Applaud / Like this editorial"
                >
                  <span>{liked ? "❤️" : "🤍"}</span>
                  <span>{likesCount}</span>
                </button>

                {/* Bookmark Button */}
                <button
                  onClick={handleBookmarkToggle}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isBookmarked
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      : "bg-slate-800/80 hover:bg-amber-500/10 border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500/30"
                  }`}
                  title={isBookmarked ? "Saved in Personal Vault" : "Save to Vault for Quick Revision"}
                >
                  <span>{isBookmarked ? "★" : "☆"}</span>
                  <span className="hidden sm:inline">{isBookmarked ? "Saved" : "Save to Vault"}</span>
                </button>

                {/* Share Link */}
                <button
                  onClick={handleShare}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Share this article"
                >
                  <span>🔗</span>
                  <span>{copied ? "Copied!" : "Share"}</span>
                </button>

                {/* Print Article */}
                <button
                  onClick={() => window.print()}
                  className="hidden md:flex px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold items-center gap-1.5 transition-all cursor-pointer"
                  title="Print this editorial or save as PDF"
                >
                  <span>🖨️</span>
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Optional Banner Image */}
            {article.bannerUrl && (
              <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-xl max-h-96 w-full">
                <img
                  src={article.bannerUrl}
                  alt={article.titleEnglish || article.titleHindi || "Current Affairs Banner"}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Quick Summary / Key Takeaways Box */}
            {(article.summaryHindi || article.summaryEnglish) && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 text-amber-100 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">⚡</span>
                  <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider">
                    Quick Revision Summary (संक्षिप्त सारांश)
                  </h3>
                </div>

                <div className={`space-y-3 ${fontSizeClass}`}>
                  {language === "dual" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {article.summaryHindi && (
                        <div className="p-3 rounded-xl bg-slate-900/40 border border-amber-500/20">
                          <span className="text-[11px] font-bold text-amber-400 block mb-1 uppercase">हिंदी:</span>
                          <p className="leading-relaxed">{article.summaryHindi}</p>
                        </div>
                      )}
                      {article.summaryEnglish && (
                        <div className="p-3 rounded-xl bg-slate-900/40 border border-amber-500/20">
                          <span className="text-[11px] font-bold text-amber-400 block mb-1 uppercase">English:</span>
                          <p className="leading-relaxed">{article.summaryEnglish}</p>
                        </div>
                      )}
                    </div>
                  ) : language === "hi" ? (
                    <p className="leading-relaxed font-hindi">
                      {article.summaryHindi || article.summaryEnglish}
                    </p>
                  ) : (
                    <p className="leading-relaxed">
                      {article.summaryEnglish || article.summaryHindi}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Main Editorial Content */}
            <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/50 border border-slate-800/80 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>📖</span>
                  <span>Editorial Analysis & Exam Coverage</span>
                </h2>
                {article.pdfUrl && (
                  <a
                    href={article.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                  >
                    <span>📥</span>
                    <span>Download Official PDF</span>
                  </a>
                )}
              </div>

              {/* Long-form Text */}
              <div className={`space-y-6 text-slate-300 ${fontSizeClass}`}>
                {language === "dual" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                    {/* Hindi Column */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                        <span>🇮🇳</span>
                        <span>हिन्दी संस्करण (Hindi Version)</span>
                      </div>
                      <div className="whitespace-pre-line leading-relaxed font-hindi text-slate-200">
                        {article.contentHindi || article.summaryHindi || "इस आलेख का विस्तृत विवरण शीघ्र ही अद्यतन किया जाएगा।"}
                      </div>
                    </div>

                    {/* English Column */}
                    <div className="space-y-4 md:pl-8 pt-6 md:pt-0">
                      <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                        <span>🌐</span>
                        <span>English Version</span>
                      </div>
                      <div className="whitespace-pre-line leading-relaxed text-slate-200">
                        {article.contentEnglish || article.summaryEnglish || "Detailed editorial content in English will be updated shortly."}
                      </div>
                    </div>
                  </div>
                ) : language === "hi" ? (
                  <div className="whitespace-pre-line leading-relaxed font-hindi space-y-4">
                    {article.contentHindi || article.summaryHindi || article.contentEnglish || "इस आलेख का विस्तृत विवरण उपलब्ध है।"}
                  </div>
                ) : (
                  <div className="whitespace-pre-line leading-relaxed space-y-4">
                    {article.contentEnglish || article.summaryEnglish || article.contentHindi || "Detailed editorial text is available above."}
                  </div>
                )}
              </div>
            </div>

            {/* Interactive MCQ Practice Section (If questions provided) */}
            {Array.isArray(article.mcqQuestions) && article.mcqQuestions.length > 0 && (
              <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                      SELF TEST & RETENTION
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                      <span>🎯</span>
                      <span>Daily Quiz from this Editorial ({article.mcqQuestions.length} Questions)</span>
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Exam Standard
                  </span>
                </div>

                <div className="space-y-6">
                  {article.mcqQuestions.map((q, qIdx) => {
                    const questionText = language === "en" ? (q.questionEnglish || q.questionHindi) : (q.questionHindi || q.questionEnglish);
                    const selected = selectedAnswers[qIdx];
                    const isAnswered = selected !== undefined;
                    const isCorrect = isAnswered && selected === q.correctAnswer;

                    return (
                      <div key={qIdx} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-4">
                        <div className="flex items-start gap-3">
                          <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 font-black text-xs flex items-center justify-center shrink-0">
                            Q{qIdx + 1}
                          </span>
                          <p className="font-bold text-white text-sm sm:text-base leading-snug">
                            {questionText}
                          </p>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                          {Array.isArray(q.options) &&
                            q.options.map((opt, optIdx) => {
                              const isThisSelected = selected === optIdx;
                              const isThisCorrect = q.correctAnswer === optIdx;

                              let optStyle = "bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300";
                              if (isAnswered) {
                                if (isThisCorrect) {
                                  optStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold shadow-md shadow-emerald-500/10";
                                } else if (isThisSelected && !isThisCorrect) {
                                  optStyle = "bg-rose-500/20 border-rose-500 text-rose-200 font-bold";
                                } else {
                                  optStyle = "bg-slate-900/50 border-slate-800 text-slate-500";
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleOptionSelect(qIdx, optIdx)}
                                  disabled={isAnswered}
                                  className={`p-3 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center gap-2.5 cursor-pointer ${optStyle}`}
                                >
                                  <span className="w-5 h-5 rounded-md bg-slate-800/80 text-[11px] font-bold flex items-center justify-center shrink-0">
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span className="flex-1">{opt}</span>
                                  {isAnswered && isThisCorrect && <span className="text-emerald-400 font-black">✓</span>}
                                  {isAnswered && isThisSelected && !isThisCorrect && <span className="text-rose-400 font-black">✕</span>}
                                </button>
                              );
                            })}
                        </div>

                        {/* Answer Explanation */}
                        {showExplanations[qIdx] && q.explanation && (
                          <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 text-xs text-amber-200 space-y-1 animate-fade-in">
                            <span className="font-bold flex items-center gap-1 text-amber-300">
                              <span>💡</span>
                              <span>Explanation (व्याख्या):</span>
                            </span>
                            <p className="leading-relaxed text-slate-300 font-medium">
                              {q.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Author / Editorial Info Card */}
            <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg">
                  🏛️
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">
                    Raj Exam Vault Editorial Board
                  </h4>
                  <p className="text-xs text-slate-400">
                    Curated & verified for RPSC (RAS, 1st/2nd Grade), RSSB (Patwari, VDO, CET), & Police.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleShare}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all cursor-pointer"
                >
                  Share Article
                </button>
                <Link
                  href="/current-affairs"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
                >
                  More Editorial GK →
                </Link>
              </div>
            </div>

            {/* Related Articles / Quick Revision */}
            {relatedArticles.length > 0 && (
              <section className="pt-8 space-y-5 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <span>📚</span>
                    <span>Related Current Affairs</span>
                  </h3>
                  <Link
                    href={`/current-affairs?category=${article.category || ""}`}
                    className="text-xs font-bold text-amber-400 hover:underline"
                  >
                    View All in this Category →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {relatedArticles.map((rel) => {
                    const relMeta = rel.category && CATEGORY_META[rel.category]
                      ? CATEGORY_META[rel.category]
                      : { label: "GK", icon: "📰", color: "from-slate-500/20 to-slate-600/20 border-slate-500/30 text-slate-300" };

                    return (
                      <Link
                        key={rel.id}
                        href={`/current-affairs/${rel.slug || rel.id}`}
                        className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-lg"
                      >
                        <div className="space-y-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border inline-block ${relMeta.color}`}>
                            {relMeta.icon} {relMeta.label}
                          </span>
                          <h4 className="font-bold text-sm text-slate-200 group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                            {rel.titleEnglish || rel.title || rel.titleHindi}
                          </h4>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{rel.date ? new Date(rel.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Recent"}</span>
                          <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">Read →</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}
