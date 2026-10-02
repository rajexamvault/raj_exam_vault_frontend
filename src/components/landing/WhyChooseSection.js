"use client";

import { 
  ShieldIcon, 
  BookOpenIcon, 
  DownloadIcon, 
  StarIcon, 
  CheckCircleIcon,
  SparklesIcon,
  ZapIcon
} from "@/components/common/Icons";

export default function WhyChooseSection() {
  const features = [
    {
      id: "authentic",
      title: "Authentic Previous Year Papers",
      tag: "100% Board Verified",
      desc: "All question papers are directly sourced from official RPSC, RSMSSB, Police Recruitment & Education Department archives with finalized revised keys.",
      points: [
        "Eliminates disputed and obsolete questions",
        "Official master question paper sequencing",
        "Exact bilingual Hindi & English phrasing"
      ],
      glow: "border-rose-500/30 hover:border-rose-400/60 bg-gradient-to-b from-rose-950/20 to-slate-900/90",
      icon: <ShieldIcon className="w-6 h-6 text-rose-400" />,
      iconBg: "bg-rose-950/80 border-rose-500/40",
    },
    {
      id: "organized",
      title: "Organized Exam-Wise Resources",
      tag: "Smart Categorization",
      desc: "No more searching through disorganized Telegram channels. Our vault arranges papers shift-wise, year-wise, and subject-wise with syllabus mapping.",
      points: [
        "Topic & weightage distribution notes",
        "Cutoff analysis included with every set",
        "Easy search by post, board and year"
      ],
      glow: "border-blue-500/30 hover:border-blue-400/60 bg-gradient-to-b from-blue-950/20 to-slate-900/90",
      icon: <BookOpenIcon className="w-6 h-6 text-blue-400" />,
      iconBg: "bg-blue-950/80 border-blue-500/40",
    },
    {
      id: "instant-pdf",
      title: "Instant PDF Access",
      tag: "Print & Offline Ready",
      desc: "Instant one-click downloads with lifetime access. Clear, crisp typesetting formatted for both mobile reading and high-quality A4 double-sided printing.",
      points: [
        "High-contrast dark & light reading support",
        "Clean typesetting without obstructing watermarks",
        "Works offline on mobile, tablet & laptop"
      ],
      glow: "border-indigo-500/30 hover:border-indigo-400/60 bg-gradient-to-b from-indigo-950/20 to-slate-900/90",
      icon: <DownloadIcon className="w-6 h-6 text-indigo-400" />,
      iconBg: "bg-indigo-950/80 border-indigo-500/40",
    },
    {
      id: "affordable",
      title: "Affordable Preparation Material",
      tag: "Student-First Pricing",
      desc: "Quality preparation shouldn't cost thousands. Get comprehensive Rajasthan exam archives for the price of a cup of tea — pure value for every aspirant.",
      points: [
        "Single-pack purchases with no recurring trap",
        "Free regular updates when new papers are released",
        "Dedicated student support on WhatsApp & Email"
      ],
      glow: "border-amber-500/30 hover:border-amber-400/60 bg-gradient-to-b from-amber-950/20 to-slate-900/90",
      icon: <StarIcon className="w-6 h-6 text-amber-400 fill-amber-400" />,
      iconBg: "bg-amber-950/80 border-amber-500/40",
    },
  ];

  return (
    <section id="why-us" className="py-20 bg-[#060b18] relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wider uppercase">
            <ZapIcon className="w-4 h-4" />
            <span>Built for Rajasthan Aspirants</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Why Choose <span className="bg-gradient-to-r from-rose-400 via-orange-300 to-indigo-300 bg-clip-text text-transparent">Raj Exam Vault?</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base font-light">
            We solve the biggest headache of Rajasthan government exam aspirants: finding accurate, clean, solved previous papers without inaccurate answer keys or scam PDFs.
          </p>
        </div>

        {/* Features 4-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat) => (
            <div
              key={feat.id}
              className={`p-6 sm:p-8 rounded-3xl border ${feat.glow} backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between group`}
            >
              <div>
                {/* Header Icon & Tag */}
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${feat.iconBg} shadow-inner group-hover:scale-110 transition-transform`}>
                    {feat.icon}
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/90 border border-slate-700 text-slate-300">
                    {feat.tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2.5 group-hover:text-blue-300 transition-colors">
                  {feat.title}
                </h3>

                {/* Description */}
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light mb-5">
                  {feat.desc}
                </p>
              </div>

              {/* Bullet Points */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                {feat.points.map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
