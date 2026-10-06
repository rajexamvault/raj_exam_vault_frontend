"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import examService from "@/services/examService";
import { 
  SearchIcon, 
  BookOpenIcon, 
  FileTextIcon, 
  ArrowRightIcon, 
  ShieldIcon, 
  GraduationCapIcon,
  AwardIcon,
  ChevronRightIcon
} from "@/components/common/Icons";

export default function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [quickExams, setQuickExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);

  useEffect(() => {
    async function loadExams() {
      try {
        setLoadingExams(true);
        const res = await examService.getExams({ limit: 6, status: "active" });
        const list = res?.data?.exams || res?.exams || (Array.isArray(res?.data) ? res.data : []);
        setQuickExams(Array.isArray(list) ? list : []);
      } catch (e) {
        console.warn("Could not load quick exams in hero:", e);
      } finally {
        setLoadingExams(false);
      }
    }
    loadExams();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="relative pt-6 pb-10 sm:py-10 bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#ffffff] overflow-hidden border-b border-slate-200/80">
      
      {/* Background Soft Sky & Silhouette */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none -z-10" />

      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* Left Hero Column: Headline, Subtitle, Search, CTA Buttons */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-start space-y-4 sm:space-y-5">
            
            {/* Main Headline */}
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-[#0f224a] leading-[1.2] tracking-tight">
              Rajasthan Exams Ki<br />
              <span className="text-[#d32f2f]">PYQ Preparation,</span><br />
              Ab Ek Jagah.
            </h1>

            {/* Sub-description */}
            <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed max-w-lg font-normal">
              RPSC, RSSB, REET, CET, Police, Patwari aur sabhi Rajasthan Government Exams ke Previous Year Question Papers ab PDF format mein.
            </p>

            {/* Big Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="w-full max-w-md flex items-center bg-white border border-slate-300 rounded-xl shadow-xs overflow-hidden focus-within:border-[#0f224a] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <input
                type="text"
                placeholder="Search exam, subject or year..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 min-w-0 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
              />
              <button
                type="submit"
                className="bg-[#0f224a] hover:bg-[#162c5b] text-white px-3.5 sm:px-5 py-2.5 sm:py-3 font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Search"
              >
                <SearchIcon className="w-4 h-4" />
              </button>
            </form>

            {/* Dual CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1 w-full sm:w-auto">
              <Link
                href="/materials"
                className="px-6 py-2.5 sm:py-3 rounded-lg bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <BookOpenIcon className="w-4 h-4" />
                <span>Browse PYQs</span>
              </Link>

              <Link
                href="/exams"
                className="px-6 py-2.5 sm:py-3 rounded-lg bg-white hover:bg-slate-50 border border-[#0f224a] text-[#0f224a] font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <AwardIcon className="w-4 h-4 text-[#0f224a]" />
                <span>Explore Exams</span>
              </Link>
            </div>

          </div>

          {/* Center Graphic Column: 3D Palace & PDF Binder Artwork */}
          <div className="lg:col-span-6 xl:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-[580px] aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 bg-white group">
              <Image
                src="/hero-light.jpg"
                alt="Rajasthan Exams PYQ Preparation - Raj Exam Vault"
                width={700}
                height={400}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                priority
              />
            </div>
          </div>

          {/* Right Column: Quick Popular Exams Card */}
          <div className="hidden xl:block xl:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-[#0f224a] font-bold text-xs">Popular Exams</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                {loadingExams ? (
                  <div className="py-4 text-center text-xs text-slate-400">Loading...</div>
                ) : quickExams.length === 0 ? (
                  <div className="py-3 text-center text-[11px] text-slate-400">No exams yet</div>
                ) : (
                  quickExams.map((exam, idx) => {
                    const name = (exam.shortName && exam.shortName.trim().toUpperCase() !== 'EXAM')
                      ? exam.shortName.trim()
                      : (exam.title || "Exam");

                    return (
                      <Link
                        key={exam.id || idx}
                        href={`/exams/${exam.slug || exam.id}`}
                        className="p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between transition-all group/item"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-sm shrink-0">{exam.icon || "🏛️"}</span>
                          <span className="text-xs font-bold text-slate-800 group-hover/item:text-[#0f224a] truncate">
                            {name}
                          </span>
                        </div>
                        <ChevronRightIcon className="w-3.5 h-3.5 text-slate-400 group-hover/item:text-[#0f224a] transition-transform group-hover/item:translate-x-0.5 shrink-0" />
                      </Link>
                    );
                  })
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <Link
                  href="/exams"
                  className="text-[11px] font-bold text-[#0f224a] hover:text-[#d32f2f] flex items-center justify-center gap-1 transition-colors"
                >
                  <span>View All Exams</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
