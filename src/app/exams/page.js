"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FlashTicker from "@/components/layout/FlashTicker";
import examService from "@/services/examService";

const CATEGORIES = [
  "All Categories",
  "State Civil Services",
  "Police & Defence",
  "Teaching & REET",
  "CET & Clerical",
  "Revenue & Patwari",
  "Engineering & Technical",
  "High Court & Judicial"
];

export default function ExamsDirectoryPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const res = await examService.getExams({
          category: selectedCategory === "All Categories" ? "all" : selectedCategory,
          search,
          limit: 50
        });
        const examsList = res?.data?.exams || res?.exams || (Array.isArray(res?.data) ? res.data : []);
        setExams(examsList);
      } catch (err) {
        console.error("Failed to load exams:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [selectedCategory, search]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <FlashTicker />
        <Navbar />

        {/* Hero Section */}
        <section className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4 sm:px-8 border-b border-slate-700">
          <div className="max-w-6xl mx-auto text-center space-y-4">
            <span className="px-3 py-1 rounded-full bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold uppercase tracking-wider">
              🏛️ Official Exam Vault
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
              Rajasthan Government Exams & Vacancies Directory
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Explore subject-wise syllabus breakdowns, previous year papers, topics, and free study notes for all RPSC & RSMSSB recruitments.
            </p>

            {/* Search Box */}
            <div className="max-w-xl mx-auto pt-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search exam (e.g. RAS, REET, Police Constable, Patwari)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-red-500 shadow-xl"
                />
                <span className="absolute left-4 top-3.5 text-slate-400 text-lg">🔍</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Categories Bar */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-red-600 text-white shadow-md shadow-red-900/20"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Exams Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin text-4xl mb-3">🔄</div>
              <p className="text-sm font-semibold text-slate-600">Loading Rajasthan exams directory...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm">
              <span className="text-4xl">🏛️</span>
              <h3 className="text-base font-bold text-slate-800 mt-2">No Exams Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                No active exams match your search query. Try clearing your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((ex) => (
                <div
                  key={ex.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-red-400 hover:shadow-xl p-6 transition-all flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Top Row: Icon & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl group-hover:scale-110 transition shrink-0">
                        {ex.icon || "🏛️"}
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase">
                        {ex.status === "active" ? "Active" : ex.status || "Published"}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition mt-3">
                      {ex.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {ex.department || "RPSC / RSMSSB"} • {ex.category}
                    </p>

                    {ex.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 mt-2.5 leading-relaxed">
                        {ex.description}
                      </p>
                    )}

                    {/* Stats Strip */}
                    <div className="grid grid-cols-3 gap-2 mt-4 p-2 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{ex.stats?.pyqCount || 0}</span>
                        <div className="text-[10px] text-slate-400">PYQs</div>
                      </div>
                      <div className="border-x border-slate-200">
                        <span className="font-bold text-slate-800">{ex.stats?.notesCount || 0}</span>
                        <div className="text-[10px] text-slate-400">Notes</div>
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">{ex.totalVacancies || "N/A"}</span>
                        <div className="text-[10px] text-slate-400">Vacancies</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/exams/${ex.slug || ex.id}`}
                      className="px-4 py-2 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Explore Exam Hub</span>
                      <span>→</span>
                    </Link>

                    {ex.syllabusUrl && (
                      <a
                        href={ex.syllabusUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Syllabus PDF 📄
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}
