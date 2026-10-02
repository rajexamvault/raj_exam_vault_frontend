"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import FlashTicker from "@/components/layout/FlashTicker";
import { API_BASE_URL } from "@/config/apiConfig";
import { useAuth } from "@/context/AuthContext";

export default function StudyMaterialsPage() {
  const { user, token } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedAccess, setSelectedAccess] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [activePreview, setActivePreview] = useState(null);
  const [savedBookmarks, setSavedBookmarks] = useState(new Set());

  useEffect(() => {
    if (token) {
      fetch(`${API_BASE_URL}/user/vault/bookmarks?type=material`, {
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
    fetchData();
  }, [selectedExam, selectedType, selectedAccess, selectedLanguage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch exams for filter dropdown
      const examRes = await fetch(`${API_BASE_URL}/exams`);
      const examJson = await examRes.json();
      if (examJson.success) {
        const examList = examJson.data?.exams || examJson.exams || (Array.isArray(examJson.data) ? examJson.data : []);
        setExams(Array.isArray(examList) ? examList : []);
      }

      // Build query params
      const params = new URLSearchParams();
      if (selectedExam) params.append("examId", selectedExam);
      if (selectedType) params.append("materialType", selectedType);
      if (selectedAccess) params.append("isFree", selectedAccess === "free" ? "true" : "false");
      if (selectedLanguage) params.append("language", selectedLanguage);

      const matRes = await fetch(`${API_BASE_URL}/materials?${params.toString()}`);
      const matJson = await matRes.json();
      if (matJson.success) {
        const matList = matJson.data?.materials || matJson.materials || (Array.isArray(matJson.data) ? matJson.data : []);
        setMaterials(Array.isArray(matList) ? matList : []);
      }
    } catch (err) {
      console.error("Failed to fetch materials:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (mat) => {
    try {
      await fetch(`${API_BASE_URL}/materials/download/${mat.id}`, { method: "POST" });
      // Update local download count
      setMaterials(prev => prev.map(m => m.id === mat.id ? { ...m, downloadCount: (m.downloadCount || 0) + 1 } : m));
      // Trigger file download
      const link = document.createElement("a");
      link.href = mat.fileUrl.startsWith("http") ? mat.fileUrl : `${API_BASE_URL.replace("/api", "")}${mat.fileUrl}`;
      link.target = "_blank";
      link.download = mat.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download tracking error:", err);
    }
  };

  const handleViewPreview = async (mat) => {
    try {
      await fetch(`${API_BASE_URL}/materials/view/${mat.id}`, { method: "POST" });
      setMaterials(prev => prev.map(m => m.id === mat.id ? { ...m, viewCount: (m.viewCount || 0) + 1 } : m));
      setActivePreview(mat);
    } catch (err) {
      console.error("View tracking error:", err);
      setActivePreview(mat);
    }
  };

  const handleToggleBookmark = async (mat) => {
    if (!token) {
      alert("Please login to save this material to your Personal Vault!");
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
          itemType: "material",
          itemId: mat.id
        })
      });
      const data = await res.json();
      if (data.success) {
        setSavedBookmarks(prev => {
          const next = new Set(prev);
          if (data.bookmarked) {
            next.add(mat.id);
          } else {
            next.delete(mat.id);
          }
          return next;
        });
      }
    } catch (err) {
      console.error("Bookmark toggle error:", err);
    }
  };

  const safeMaterials = Array.isArray(materials) ? materials : [];
  const filteredMaterials = safeMaterials.filter(m => {
    if (!m) return false;
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      m.title?.toLowerCase().includes(query) ||
      m.description?.toLowerCase().includes(query) ||
      m.exam?.name?.toLowerCase().includes(query) ||
      m.subject?.name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      <Navbar />
      <FlashTicker />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-radial from-slate-800 via-slate-900 to-[#0b1329] border-b border-slate-800/80 py-12 sm:py-16">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4 animate-fade-in shadow-xs">
            <span>📚</span> Verified PDFs, Hand-Written Notes & PYQs
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Rajasthan Study Materials & <span className="text-transparent bg-clip-text bg-linear-to-r from-rose-400 via-amber-400 to-red-500">PYQ Vault</span>
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 font-medium leading-relaxed">
            Download high-yield subject notes, previous year question papers, official syllabus copies, and solved tests for RPSC RAS, RSSB, REET, and CET.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        
        {/* Search & Filter Toolbar */}
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 sm:p-6 mb-8 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <input
                type="text"
                placeholder="Search notes, PYQs, subjects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors shadow-inner"
              />
              <span className="absolute right-3.5 top-3 text-slate-500 text-sm">🔍</span>
            </div>

            {/* Exam Filter */}
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              aria-label="Filter by Target Exam"
              className="bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="">All Exams (RPSC, RSSB...)</option>
              {exams.map(e => (
                <option key={e.id} value={e.id}>{e.shortName || e.title || e.name} - {e.title || e.name}</option>
              ))}
            </select>

            {/* Content Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filter by Resource Type"
              className="bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="">All Resource Types</option>
              <option value="pyq">Previous Year Questions (PYQs)</option>
              <option value="notes">Handwritten & Revision Notes</option>
              <option value="syllabus_pdf">Official Syllabus PDF</option>
              <option value="model_paper">Model Practice Paper</option>
              <option value="formula_sheet">Formula & Fact Sheets</option>
            </select>

            {/* Access & Language Filter */}
            <div className="flex gap-2">
              <select
                value={selectedAccess}
                onChange={(e) => setSelectedAccess(e.target.value)}
                aria-label="Filter by Access Price"
                className="w-1/2 bg-slate-900/90 border border-slate-700 rounded-xl px-2 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="">All Access</option>
                <option value="free">Free</option>
                <option value="paid">Premium</option>
              </select>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                aria-label="Filter by Language"
                className="w-1/2 bg-slate-900/90 border border-slate-700 rounded-xl px-2 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="">Language</option>
                <option value="hi">Hindi</option>
                <option value="en">English</option>
                <option value="bilingual">Bilingual</option>
              </select>
            </div>
          </div>
        </div>

        {/* Materials Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold">Loading Vault Materials & PYQs...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-12 text-center max-w-lg mx-auto">
            <div className="text-5xl mb-3">📁</div>
            <h2 className="text-xl font-bold text-white mb-2">No Study Materials Found</h2>
            <p className="text-xs text-slate-400 mb-6">
              Try adjusting your search keywords or clearing filter parameters.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedExam("");
                setSelectedType("");
                setSelectedAccess("");
                setSelectedLanguage("");
              }}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((mat) => (
              <div
                key={mat.id}
                className="group bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-rose-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Header Tag / Badges */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-700/80 text-rose-400 border border-rose-500/20">
                      {(mat.materialType || mat.contentType || "pyq").replace("_", " ")}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {mat.isFree ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          FREE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          ₹{mat.price || 49}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-700 text-slate-300 uppercase">
                        {mat.language || "Bilingual"}
                      </span>
                    </div>
                  </div>

                  {/* Title & Exam Meta */}
                  <h2 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors line-clamp-2 mb-2 leading-snug">
                    {mat.title}
                  </h2>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 font-normal">
                    {mat.description || "Official high quality study notes curated for Rajasthan competitive examinations."}
                  </p>

                  {/* Associated Exam & Subject Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4 text-[11px]">
                    {mat.exam && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                        🏛️ {mat.exam.shortName || mat.exam.title || mat.exam.name}
                      </span>
                    )}
                    {(mat.subject || mat.subjectRef) && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                        📖 {typeof mat.subject === 'string' ? mat.subject : mat.subjectRef?.name || mat.subject?.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Telemetry & CTAs */}
                <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                    <span title="Total Downloads">📥 {mat.totalDownloads ?? mat.downloadCount ?? 0}</span>
                    <span title="Total Views">👁️ {mat.viewCount ?? 0}</span>
                    {mat.fileSize && <span>💾 {mat.fileSize}</span>}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleBookmark(mat)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        savedBookmarks.has(mat.id)
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white"
                      }`}
                      title={savedBookmarks.has(mat.id) ? "Saved in Vault" : "Save to Personal Vault"}
                    >
                      <span>{savedBookmarks.has(mat.id) ? "★" : "☆"}</span>
                      <span>{savedBookmarks.has(mat.id) ? "Saved" : "Save"}</span>
                    </button>
                    <button
                      onClick={() => handleViewPreview(mat)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                      title="Preview Document"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleDownload(mat)}
                      className="px-3 py-1.5 rounded-xl bg-linear-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      <span>📥</span>
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Document Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                  {(activePreview.materialType || activePreview.contentType || "pyq").replace("_", " ")}
                </span>
                <h3 className="text-lg font-bold text-white line-clamp-1">
                  {activePreview.title}
                </h3>
              </div>
              <button
                onClick={() => setActivePreview(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-sm text-slate-300">
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Storage Engine:</span>{" "}
                  <span className="font-bold text-sky-400 uppercase">Cloudinary CDN</span>
                </div>
                <div>
                  <span className="text-slate-500">Format:</span>{" "}
                  <span className="font-bold text-white uppercase">{activePreview.fileType || "PDF"}</span>
                </div>
                <div>
                  <span className="text-slate-500">Access:</span>{" "}
                  <span className="font-bold text-emerald-400">{activePreview.isFree ? "Free Document" : `Premium ₹${activePreview.price}`}</span>
                </div>
                {activePreview.fileUrl && (
                  <a
                    href={activePreview.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>Full Tab</span>
                    <span>↗</span>
                  </a>
                )}
              </div>

              {/* Live PDF Preview Iframe */}
              <div className="w-full h-96 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative shadow-inner">
                {activePreview.fileUrl ? (
                  <iframe
                    src={activePreview.fileUrl}
                    className="w-full h-full border-0 bg-white"
                    title={activePreview.title}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="text-4xl mb-2">📄</div>
                    <h4 className="text-white font-bold text-sm mb-1">{activePreview.title}</h4>
                    <p className="text-xs text-slate-500 max-w-md">
                      Verified exam preparation document hosted on Cloudinary cloud storage.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">Description & Exam Coverage:</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {activePreview.description || "Comprehensive exam preparation material compiled by top educators and subject matter experts."}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-2 bg-slate-800/30">
              <button
                onClick={() => setActivePreview(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  handleDownload(activePreview);
                  setActivePreview(null);
                }}
                className="px-5 py-2 rounded-xl bg-linear-to-r from-rose-600 to-red-600 text-white font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
              >
                <span>📥</span>
                <span>Download ({activePreview.fileSize || "PDF"})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
