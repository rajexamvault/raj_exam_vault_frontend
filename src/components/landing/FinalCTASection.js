"use client";

import { SparklesIcon, ArrowRightIcon, ShieldIcon, DownloadIcon, CheckCircleIcon } from "@/components/common/Icons";

export default function FinalCTASection() {
  return (
    <section className="py-20 bg-[#060b18] relative overflow-hidden">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        
        {/* Main CTA Card */}
        <div className="relative rounded-[36px] p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-[#0c1633] via-[#091128] to-[#120e29] border border-blue-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden text-center backdrop-blur-2xl">
          
          {/* Radial Glows inside Card */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-rose-600/30 via-purple-600/20 to-transparent blur-3xl pointer-events-none -z-10" />
          <div className="absolute -bottom-24 left-1/4 w-[400px] h-[300px] bg-blue-600/20 blur-3xl pointer-events-none -z-10" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-rose-500/40 text-rose-400 text-xs font-bold tracking-wider uppercase mb-6 shadow-md">
            <SparklesIcon className="w-4 h-4" />
            <span>Unlock Your Exam Success</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] max-w-4xl mx-auto mb-5">
            Prepare Smarter. <br />
            <span className="bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#818cf8] bg-clip-text text-transparent">
              Crack Your Rajasthan Exam.
            </span>
          </h2>

          {/* Text */}
          <p className="text-slate-300 text-sm sm:text-base md:text-lg font-light max-w-2xl mx-auto mb-8">
            Get access to carefully organized PYQs and study resources. Join 50,000+ Rajasthan aspirants preparing with 100% board-verified solutions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <a
              href="#pyq-collections"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#e62e3d] via-[#a8226a] to-[#4f46e5] hover:opacity-95 text-white font-bold text-sm sm:text-base shadow-2xl shadow-rose-950/60 flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>Explore All Resources</span>
              <ArrowRightIcon className="w-4 h-4" />
            </a>

            <a
              href="#free-resources"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-emerald-400/50 text-slate-200 hover:text-white font-bold text-sm sm:text-base transition-all hover:bg-slate-800 cursor-pointer flex items-center justify-center gap-2"
            >
              <DownloadIcon className="w-4 h-4 text-emerald-400" />
              <span>Get Free PDFs</span>
            </a>
          </div>

          {/* Assurance Row */}
          <div className="mt-10 pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
              <span>Instant PDF Downloads</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
              <span>Official Revised Keys</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
              <span>Zero Obstructing Watermarks</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
