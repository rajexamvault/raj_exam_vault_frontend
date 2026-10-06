"use client";

import Link from "next/link";

export default function CtaBannerSection() {
  return (
    <section className="py-20 bg-[#090D16] text-white relative overflow-hidden border-b border-[#141F36]">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-rose-600/20 via-indigo-600/20 to-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        <span className="text-xs font-extrabold text-[#818CF8] tracking-widest uppercase block">
          YOUR NEXT CHAPTER STARTS HERE
        </span>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
          One goal. The right resources.
        </h2>

        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          No noise. Just verified exam papers, structured notes, and authentic practice for your dream Rajasthan career.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#e62e3d] via-[#a8226a] to-[#8b5cf6] hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-rose-900/40 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Start preparing now</span>
            <span>→</span>
          </Link>

          <Link
            href="/exams"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#111B33]/80 hover:bg-[#162342] text-slate-200 hover:text-white font-bold text-sm border border-slate-700 shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <span>Browse all exams</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
