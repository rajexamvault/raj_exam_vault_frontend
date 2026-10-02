"use client";

import { XIcon, DownloadIcon, CheckCircleIcon, ShieldIcon, FileTextIcon, StarIcon } from "@/components/common/Icons";

export default function PreviewModal({ isOpen, onClose, resource }) {
  if (!isOpen || !resource) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
      <div 
        className="relative w-full max-w-2xl bg-[#0d162e] border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <FileTextIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {resource.category || "Official PYQ"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {resource.year || "2025 Edition"}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                {resource.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Key Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Total Papers</span>
              <span className="text-sm font-bold text-white">{resource.papers || "12 Full Papers"}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Questions</span>
              <span className="text-sm font-bold text-white">{resource.questions || "1,800+ MCQs"}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Answer Keys</span>
              <span className="text-sm font-bold text-emerald-400">100% Board Verified</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">File Format</span>
              <span className="text-sm font-bold text-indigo-400">Printable PDF</span>
            </div>
          </div>

          {/* Highlights */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-blue-500/20">
            <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <ShieldIcon className="w-4 h-4 text-blue-400" /> What&apos;s Included Inside:
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                Original bilingual (Hindi & English) exam papers
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                Final official revised answer keys with deleted question marks
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                High-quality clean PDF without watermarks on text
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                Detailed topic-wise weightage & cutoff analysis sheet
              </li>
            </ul>
          </div>

          {/* Sample Question Preview Card */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
              <span className="font-semibold text-rose-400">Sample Solved Question</span>
              <span>Rajasthan GK & History</span>
            </div>
            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              Q.1 Which Rajput ruler was honoured with the title of &apos;Rana&apos; by the Sisodia dynasty first?
            </p>
            <div className="mt-2 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 p-2 rounded-lg font-mono">
              ✓ Verified Official Answer: Rana Hammir (1326 A.D.)
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {resource.price ? `₹${resource.price}` : "FREE"}
            </span>
            {resource.originalPrice && (
              <span className="text-xs text-slate-500 line-through">
                ₹{resource.originalPrice}
              </span>
            )}
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Instant Download
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                alert(`Downloading ${resource.title}... Your PDF is generating!`);
              }}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#e62e3d] via-[#a8226a] to-[#4f46e5] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>{resource.price ? "Unlock Full Vault" : "Download Free PDF"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
