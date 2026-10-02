"use client";

import { 
  DownloadIcon, 
  FileTextIcon, 
  SparklesIcon, 
  CheckCircleIcon,
  EyeIcon,
  ShieldIcon
} from "@/components/common/Icons";

export default function FreeResourcesSection({ onOpenPreview }) {
  const freePdfs = [
    {
      id: "free-raj-art",
      title: "Rajasthan Art, Culture & Heritage Master Summary",
      category: "Rajasthan GK",
      pages: "48 Pages PDF",
      downloads: "28,400+ Downloads",
      desc: "Forts, Fairs, Festivals, Folk Dances & Dynasties condensed into high-yield memory charts.",
      badge: "FREE PDF",
      fileSize: "4.2 MB",
    },
    {
      id: "free-ras-cutoff",
      title: "RPSC RAS 10-Year Prelims Category Cutoff & Trend Analysis",
      category: "RPSC RAS",
      pages: "18 Pages PDF",
      downloads: "19,200+ Downloads",
      desc: "Official category-wise cutoff trends from 2013 to 2024 with subject weightage breakdown.",
      badge: "FREE PDF",
      fileSize: "2.1 MB",
    },
    {
      id: "free-reet-syllabus",
      title: "REET 2025-26 Official Detailed Syllabus & Topic Map",
      category: "REET Teaching",
      pages: "32 Pages PDF",
      downloads: "22,500+ Downloads",
      desc: "Level 1 and Level 2 bilingual syllabus blueprint with recommended reference books.",
      badge: "FREE PDF",
      fileSize: "3.5 MB",
    },
    {
      id: "free-police-sample",
      title: "Rajasthan Police Constable 150-Question Model Mock Paper",
      category: "Police Exam",
      pages: "24 Pages PDF",
      downloads: "31,800+ Downloads",
      desc: "Latest exam pattern mock paper with OMR sheet format and full answer key.",
      badge: "FREE PDF",
      fileSize: "2.9 MB",
    },
  ];

  return (
    <section id="free-resources" className="py-20 bg-[#070c1e] relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase">
            <SparklesIcon className="w-4 h-4" />
            <span>100% Free Study Material</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Download Free <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">PDF Resources</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base font-light">
            Kickstart your preparation with our hand-crafted revision summaries, mock tests, and official syllabus blueprints — completely free of cost.
          </p>
        </div>

        {/* Free PDFs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {freePdfs.map((pdf) => (
            <div
              key={pdf.id}
              className="rounded-3xl bg-[#0a122a]/90 border border-emerald-500/20 hover:border-emerald-400/50 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.7)] transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between group backdrop-blur-xl"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {pdf.badge}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-medium">
                    {pdf.fileSize}
                  </span>
                </div>

                {/* PDF Icon & Title */}
                <div className="flex items-start gap-3 mb-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <FileTextIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-white font-bold text-sm leading-snug group-hover:text-emerald-300 transition-colors">
                    {pdf.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-slate-300/80 text-xs leading-relaxed font-light mb-4">
                  {pdf.desc}
                </p>
              </div>

              <div>
                {/* Metadata */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 py-2 border-t border-slate-800/80 mb-3">
                  <span>{pdf.pages}</span>
                  <span className="text-emerald-400 font-medium">{pdf.downloads}</span>
                </div>

                {/* Download CTA Button */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onOpenPreview && onOpenPreview(pdf)}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <EyeIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => {
                      alert(`Starting direct download for "${pdf.title}" (${pdf.fileSize}). PDF will save to your downloads!`);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/50 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <DownloadIcon className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
