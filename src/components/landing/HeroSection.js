"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/common/Icons";
import examService from "@/services/examService";

export default function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [featuredExam, setFeaturedExam] = useState(null);

  useEffect(() => {
    async function loadFeaturedExam() {
      try {
        const res = await examService.getExams({ limit: 1, status: "active" });
        const list = res?.data?.exams || res?.exams || (Array.isArray(res?.data) ? res.data : []);
        if (list && list.length > 0) {
          setFeaturedExam(list[0]);
        }
      } catch (e) {
        console.warn("Could not load featured exam in hero:", e);
      }
    }
    loadFeaturedExam();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="relative bg-[#090D16] text-white pt-10 pb-16 lg:pt-16 lg:pb-20 overflow-hidden border-b border-[#141F36]">
      {/* Ambient Radial Lighting Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-900/30 via-purple-900/20 to-rose-900/20 blur-[120px] rounded-full pointer-events-none -z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Hero Column: Value Proposition & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            
            {/* Amber Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[10px] sm:text-xs tracking-wider uppercase">
              <span>✨</span>
              <span>BUILT FOR RAJASTHAN. BUILT FOR YOUR GOAL.</span>
            </div>

            {/* Main H1 Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold text-white leading-[1.15] tracking-tight">
              Smart Preparation Starts with the Right Resources.
            </h1>

            {/* Hindi Subtitle */}
            <div className="text-rose-400 font-bold text-base sm:text-lg tracking-wide">
              राजस्थान का सबसे भरोसेमंद PYQ और एग्जाम वॉल्ट
            </div>

            {/* Sub-description */}
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              From your first PYQ to your next mock test. Find exam-wise papers, handwritten notes and a clear syllabus path—all in one vault.
            </p>

            {/* Primary & Secondary Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2 w-full sm:w-auto">
              <Link
                href="/exams"
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#e62e3d] via-[#a8226a] to-[#8b5cf6] hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>Find your exam</span>
                <span>→</span>
              </Link>

              <Link
                href="/materials?isFree=true"
                className="px-7 py-3.5 rounded-full bg-[#111B33]/80 hover:bg-[#162342] text-slate-200 hover:text-white font-bold text-sm border border-slate-700/80 shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>Explore free PYQs</span>
                <span>→</span>
              </Link>
            </div>

            {/* Checkmark Features Row */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Hindi + English</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Free resources</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Exam-wise learning</span>
              </div>
            </div>

          </div>

          {/* Right Hero Column: Interactive Glassmorphic Search & RAS Spotlight Card */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="w-full max-w-[480px] bg-[#111B33]/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-slate-700/60 shadow-2xl space-y-4">
              
              {/* Search Box Header */}
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400">
                  <SearchIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search an exam, subject or topic"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-[#0A101D] border border-slate-700/80 rounded-2xl pl-10 pr-14 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
                <div className="absolute right-3 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400">
                  ⌘ K
                </div>
              </form>

              {/* Inner White Spotlight Card: RPSC RAS */}
              <div className="bg-[#F8FAFC] text-slate-900 rounded-2xl p-5 shadow-inner border border-white space-y-4">
                
                {/* Header with Popular Pill */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
                      RAJASTHAN PUBLIC SERVICE COMMISSION
                    </span>
                    <h3 className="text-xl font-black text-[#0F172A] mt-0.5">
                      {featuredExam?.title || "RPSC RAS"}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-700 uppercase tracking-wider">
                    POPULAR
                  </span>
                </div>

                {/* Stage Progression Flow */}
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/60">
                  <span>Prelims</span>
                  <span className="text-slate-400">→</span>
                  <span>Mains</span>
                  <span className="text-slate-400">→</span>
                  <span>Interview</span>
                </div>

                {/* 3 Quick Resource Access Grid Tiles */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <Link
                    href={`/exams/${featuredExam?.slug || "ras-rts"}?tab=materials`}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all text-center group"
                  >
                    <span className="text-base block mb-0.5">📄</span>
                    <span className="text-[11px] font-bold text-slate-700 group-hover:text-indigo-600">
                      PYQ Papers
                    </span>
                  </Link>

                  <Link
                    href={`/exams/${featuredExam?.slug || "ras-rts"}?tab=materials`}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all text-center group"
                  >
                    <span className="text-base block mb-0.5">📝</span>
                    <span className="text-[11px] font-bold text-slate-700 group-hover:text-indigo-600">
                      Notes
                    </span>
                  </Link>

                  <Link
                    href="/tests"
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all text-center group"
                  >
                    <span className="text-base block mb-0.5">⏱️</span>
                    <span className="text-[11px] font-bold text-slate-700 group-hover:text-indigo-600">
                      Mock Tests
                    </span>
                  </Link>
                </div>

                {/* Bottom Syllabus Link */}
                <div className="pt-1">
                  <Link
                    href={`/exams/${featuredExam?.slug || "ras-rts"}?tab=syllabus`}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-between group"
                  >
                    <span>Explore RAS syllabus</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* Bottom Feature Strip */}
        <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/40 border border-slate-800">
            <span className="text-lg">📄</span>
            <span>Previous-year papers</span>
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/40 border border-slate-800">
            <span className="text-lg">📝</span>
            <span>Topper handwritten notes</span>
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/40 border border-slate-800">
            <span className="text-lg">📑</span>
            <span>Structured syllabus</span>
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/40 border border-slate-800">
            <span className="text-lg">⏱️</span>
            <span>Live mock test series</span>
          </div>
        </div>

      </div>
    </section>
  );
}
