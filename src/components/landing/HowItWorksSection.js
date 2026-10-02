"use client";

import { 
  SearchIcon, 
  DownloadIcon, 
  GraduationCapIcon, 
  ArrowRightIcon,
  SparklesIcon
} from "@/components/common/Icons";

export default function HowItWorksSection() {
  const steps = [
    {
      stepNumber: "01",
      title: "Browse Resources",
      subtitle: "Filter by Board & Exam",
      desc: "Select your target Rajasthan exam (RPSC, REET, Police, CET, Patwari). Preview sample questions, paper breakdown, and answer key format.",
      icon: <SearchIcon className="w-6 h-6 text-rose-400" />,
      accent: "border-rose-500/40 text-rose-400 bg-rose-950/40",
      glow: "from-rose-500/20 to-transparent",
    },
    {
      stepNumber: "02",
      title: "Purchase / Download",
      subtitle: "Instant Safe & Secure Access",
      desc: "Unlock individual paper archives with student-friendly pricing or download free notes. PDFs unlock immediately on your dashboard.",
      icon: <DownloadIcon className="w-6 h-6 text-blue-400" />,
      accent: "border-blue-500/40 text-blue-400 bg-blue-950/40",
      glow: "from-blue-500/20 to-transparent",
    },
    {
      stepNumber: "03",
      title: "Start Smart Preparing",
      subtitle: "Solve & Master Real Trends",
      desc: "Analyze repeat patterns, master Rajasthan GK weightage, and solve actual previous papers to boost your exam speed and accuracy.",
      icon: <GraduationCapIcon className="w-6 h-6 text-emerald-400" />,
      accent: "border-emerald-500/40 text-emerald-400 bg-emerald-950/40",
      glow: "from-emerald-500/20 to-transparent",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#060b18] relative overflow-hidden">
      {/* Glow Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wider uppercase">
            <SparklesIcon className="w-4 h-4" />
            <span>Fast, Seamless, Reliable</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            How <span className="bg-gradient-to-r from-rose-400 via-orange-300 to-indigo-300 bg-clip-text text-transparent">Raj Exam Vault</span> Works
          </h2>

          <p className="text-slate-300 text-sm sm:text-base font-light">
            Get your exam preparation on the fast track in just 3 simple steps.
          </p>
        </div>

        {/* 3 Steps Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/3 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-rose-500/40 via-blue-500/40 to-emerald-500/40 -z-0" />

          {steps.map((item, idx) => (
            <div
              key={item.stepNumber}
              className="relative rounded-3xl p-6 sm:p-8 bg-[#0a1128]/90 border border-slate-800 hover:border-blue-400/50 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-2 group flex flex-col justify-between"
            >
              <div>
                {/* Step Top Bar: Number & Icon */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl sm:text-4xl font-black text-transparent bg-gradient-to-br from-slate-600 to-slate-800 bg-clip-text group-hover:from-white group-hover:to-slate-400 transition-colors">
                    {item.stepNumber}
                  </span>
                  
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${item.accent} shadow-inner group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                  {item.title}
                </h3>
                <span className="text-xs font-semibold text-rose-400 tracking-wide block mb-3">
                  {item.subtitle}
                </span>

                {/* Description */}
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span>Step {idx + 1} of 3</span>
                <ArrowRightIcon className="w-3.5 h-3.5 text-blue-400" />
              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
