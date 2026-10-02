"use client";

import { useState, useEffect, useCallback } from "react";
import currentAffairService from "@/services/currentAffairService";

const CATEGORIES = [
  { value: "rajasthan_special", label: "🏜️ Rajasthan Special", badgeColor: "bg-amber-950 text-amber-300 border-amber-800/40" },
  { value: "national", label: "🇮🇳 National Affairs", badgeColor: "bg-blue-950 text-blue-300 border-blue-800/40" },
  { value: "international", label: "🌐 International News", badgeColor: "bg-indigo-950 text-indigo-300 border-indigo-800/40" },
  { value: "schemes_policies", label: "🏛️ Govt Schemes & Policies", badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-800/40" },
  { value: "awards_sports", label: "🏅 Awards & Sports", badgeColor: "bg-yellow-950 text-yellow-300 border-yellow-800/40" },
  { value: "economy_budget", label: "📈 Economy & Rajasthan Budget", badgeColor: "bg-purple-950 text-purple-300 border-purple-800/40" },
  { value: "science_tech", label: "🔬 Science & Technology", badgeColor: "bg-cyan-950 text-cyan-300 border-cyan-800/40" },
  { value: "environment", label: "🌿 Environment & Ecology", badgeColor: "bg-teal-950 text-teal-300 border-teal-800/40" }
];

export default function CurrentAffairsManagement({ showToast }) {
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState({ totalArticles: 0, rajasthanCount: 0, nationalCount: 0, schemesCount: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    titleEnglish: "",
    titleHindi: "",
    category: "rajasthan_special",
    summaryEnglish: "",
    summaryHindi: "",
    contentEnglish: "",
    contentHindi: "",
    date: new Date().toISOString().split("T")[0],
    bannerUrl: "",
    pdfUrl: "",
    examRelevance: ["RAS", "REET", "Police", "Patwari"],
    isFeatured: false,
    status: "published"
  });

  // Fetch Articles & Stats
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const [artRes, stRes] = await Promise.all([
        currentAffairService.getAllCurrentAffairs({
          page: pagination.currentPage,
          limit: 10,
          search,
          category: categoryFilter,
          date: dateFilter
        }),
        currentAffairService.getStats()
      ]);

      if (artRes.data?.currentAffairs) {
        setArticles(artRes.data.currentAffairs);
        setPagination(artRes.data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
      }
      if (stRes.data?.stats) {
        setStats(stRes.data.stats);
      }
    } catch (err) {
      showToast?.("error", err.message || "Failed to load current affairs");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, search, categoryFilter, dateFilter, showToast]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingArticle(null);
    setFormData({
      titleEnglish: "",
      titleHindi: "",
      category: "rajasthan_special",
      summaryEnglish: "",
      summaryHindi: "",
      contentEnglish: "",
      contentHindi: "",
      date: new Date().toISOString().split("T")[0],
      bannerUrl: "",
      pdfUrl: "",
      examRelevance: ["RAS", "REET", "Police", "Patwari", "CET"],
      isFeatured: false,
      status: "published"
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (art) => {
    setEditingArticle(art);
    setFormData({
      titleEnglish: art.titleEnglish || "",
      titleHindi: art.titleHindi || "",
      category: art.category || "rajasthan_special",
      summaryEnglish: art.summaryEnglish || "",
      summaryHindi: art.summaryHindi || "",
      contentEnglish: art.contentEnglish || "",
      contentHindi: art.contentHindi || "",
      date: art.date || new Date().toISOString().split("T")[0],
      bannerUrl: art.bannerUrl || "",
      pdfUrl: art.pdfUrl || "",
      examRelevance: Array.isArray(art.examRelevance) ? art.examRelevance : ["RAS", "REET"],
      isFeatured: !!art.isFeatured,
      status: art.status || "published"
    });
    setIsModalOpen(true);
  };

  // Save Article
  const handleSaveArticle = async (e) => {
    e.preventDefault();
    if (!formData.titleEnglish && !formData.titleHindi) {
      showToast?.("error", "Please provide title in Hindi or English");
      return;
    }

    try {
      setIsSaving(true);
      if (editingArticle) {
        await currentAffairService.updateArticle(editingArticle.id, formData);
        showToast?.("success", "Article updated successfully ✏️");
      } else {
        await currentAffairService.createArticle(formData);
        showToast?.("success", "Daily Current Affair article published 📰");
      }
      setIsModalOpen(false);
      fetchArticles();
    } catch (err) {
      showToast?.("error", err.message || "Failed to save article");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Article
  const handleDeleteArticle = async (id) => {
    try {
      await currentAffairService.deleteArticle(id);
      showToast?.("success", "Article deleted 🗑️");
      setDeleteConfirmId(null);
      fetchArticles();
    } catch (err) {
      showToast?.("error", err.message || "Failed to delete article");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📰</span>
              <span>Daily Rajasthan & National Current Affairs</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Publish daily news editorials, Rajasthan government schemes, budget updates, and monthly revision digests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchArticles}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition cursor-pointer"
              title="Refresh Articles"
            >
              🔄 Sync
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-linear-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-amber-900/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>+ Publish Article</span>
            </button>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Articles</span>
            <div className="text-xl font-black text-white mt-1">{stats.totalArticles}</div>
          </div>
          <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-800/40">
            <span className="text-[10px] font-bold text-amber-400 uppercase">🏜️ Rajasthan Special</span>
            <div className="text-xl font-black text-amber-300 mt-1">{stats.rajasthanCount}</div>
          </div>
          <div className="bg-blue-950/40 p-3 rounded-xl border border-blue-800/40">
            <span className="text-[10px] font-bold text-blue-400 uppercase">🇮🇳 National & Global</span>
            <div className="text-xl font-black text-blue-300 mt-1">{stats.nationalCount}</div>
          </div>
          <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40">
            <span className="text-[10px] font-bold text-emerald-400 uppercase">🏛️ Schemes & Policies</span>
            <div className="text-xl font-black text-emerald-300 mt-1">{stats.schemesCount}</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search keywords in title / summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="all">All News Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-amber-500 cursor-pointer"
        />
      </div>

      {/* Articles Feed */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-medium">Loading current affairs...</span>
        </div>
      ) : articles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800">
          <span className="text-4xl">📰</span>
          <h3 className="text-sm font-bold text-white mt-3">No Current Affairs Articles</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Publish your first daily news bulletin or Rajasthan special editorial.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            + Publish First Article
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((art) => {
            const catObj = CATEGORIES.find(c => c.value === art.category) || CATEGORIES[0];

            return (
              <div
                key={art.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all shadow-md space-y-3"
              >
                {/* Top Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${catObj.badgeColor}`}>
                      {catObj.label}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      📅 {art.date}
                    </span>
                    {art.isFeatured && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        ⭐ Featured
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(art)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                      title="Edit Article"
                    >
                      ✏️
                    </button>
                    {deleteConfirmId === art.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteArticle(art.id)}
                          className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-1 rounded bg-slate-800 text-slate-400 text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(art.id)}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/30 text-xs transition cursor-pointer"
                        title="Delete Article"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                {/* Title & Summary */}
                <div className="space-y-1.5">
                  {art.titleHindi && (
                    <h3 className="text-sm font-bold text-white leading-relaxed">
                      {art.titleHindi}
                    </h3>
                  )}
                  {art.titleEnglish && (
                    <h4 className="text-xs font-semibold text-slate-300">
                      {art.titleEnglish}
                    </h4>
                  )}

                  {art.summaryHindi && (
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {art.summaryHindi}
                    </p>
                  )}
                </div>

                {/* Footer Exam Tags & Counters */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-500">Relevant for:</span>
                    {(art.examRelevance || []).map((tag, tIdx) => (
                      <span key={tIdx} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <span>👁️ {art.viewCount || 0} views</span>
                    <span>❤️ {art.likesCount || 0} likes</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingArticle ? "Edit Current Affair Article" : "Publish Daily Current Affair"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-lg p-1">✕</button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-amber-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Publication Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Title (Hindi) 🇮🇳</label>
                <input
                  type="text"
                  placeholder="उदा. 'राजस्थान में नई सौर ऊर्जा नीति 2024 को कैबिनेट की मंजूरी'"
                  value={formData.titleHindi}
                  onChange={(e) => setFormData(prev => ({ ...prev, titleHindi: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Title (English)</label>
                <input
                  type="text"
                  placeholder="e.g. 'Rajasthan Cabinet approves new Solar Energy Policy 2024'"
                  value={formData.titleEnglish}
                  onChange={(e) => setFormData(prev => ({ ...prev, titleEnglish: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Summary / Key Bullet Points (Hindi)</label>
                <textarea
                  rows={2}
                  placeholder="मुख्य बिंदु..."
                  value={formData.summaryHindi}
                  onChange={(e) => setFormData(prev => ({ ...prev, summaryHindi: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Full Article Body (Hindi / English)</label>
                <textarea
                  rows={4}
                  placeholder="विस्तृत विवरण एवं परीक्षा हेतु उपयोगी तथ्य..."
                  value={formData.contentHindi}
                  onChange={(e) => setFormData(prev => ({ ...prev, contentHindi: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredCheckbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                />
                <label htmlFor="featuredCheckbox" className="text-xs font-semibold text-slate-300 cursor-pointer">
                  Pin to Featured Daily Editorial Banner
                </label>
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
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md"
                >
                  {isSaving ? "Saving..." : editingArticle ? "Update Article" : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
