"use client";

import { useState } from "react";
import { 
  GraduationCapIcon, 
  BookOpenIcon, 
  ShieldIcon, 
  AwardIcon, 
  ArrowRightIcon, 
  SparklesIcon, 
  FileTextIcon,
  ChevronRightIcon
} from "@/components/common/Icons";

export default function ExamCategoriesSection({ onSelectCategory }) {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const categories = [
    {
      id: "rpsc",
      name: "RPSC (RAS)",
      fullName: "Rajasthan Administrative Services",
      desc: "Comprehensive Prelims & Mains papers with model answers and cutoff trends.",
      papers: "45+ Papers",
      questions: "6,500+ MCQs",
      badge: "High Competition",
      badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
      accent: "from-rose-500/20 to-purple-600/10",
      borderColor: "border-rose-500/30 hover:border-rose-400/70",
      icon: <AwardIcon className="w-6 h-6 text-rose-400" />,
      type: "officer",
    },
    {
      id: "reet",
      name: "REET (Teaching)",
      fullName: "Rajasthan Eligibility Exam for Teachers",
      desc: "Level 1 & Level 2 (Science/Maths & SST) original solved papers & pedagogy banks.",
      papers: "38+ Papers",
      questions: "5,200+ MCQs",
      badge: "Level 1 & 2",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      accent: "from-blue-500/20 to-indigo-600/10",
      borderColor: "border-blue-500/30 hover:border-blue-400/70",
      icon: <GraduationCapIcon className="w-6 h-6 text-blue-400" />,
      type: "teaching",
    },
    {
      id: "police",
      name: "Rajasthan Police",
      fullName: "Constable & Sub-Inspector (SI)",
      desc: "Complete shift-wise papers, reasoning & Rajasthan GK solved mock archives.",
      papers: "52+ Papers",
      questions: "7,800+ MCQs",
      badge: "Latest 2024-25",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      accent: "from-amber-500/20 to-orange-600/10",
      borderColor: "border-amber-500/30 hover:border-amber-400/70",
      icon: <ShieldIcon className="w-6 h-6 text-amber-400" />,
      type: "police",
    },
    {
      id: "cet",
      name: "CET (Grad & 12th)",
      fullName: "Common Eligibility Test",
      desc: "Graduation level & 12th Senior Secondary level all shifts with official keys.",
      papers: "34+ Papers",
      questions: "4,800+ MCQs",
      badge: "Mandatory Exam",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      accent: "from-purple-500/20 to-pink-600/10",
      borderColor: "border-purple-500/30 hover:border-purple-400/70",
      icon: <SparklesIcon className="w-6 h-6 text-purple-400" />,
      type: "eligibility",
    },
    {
      id: "patwari",
      name: "Patwari",
      fullName: "Revenue Board Patwari Exam",
      desc: "Full syllabus PYQ papers with special focus on Computer & Rajasthan Geography.",
      papers: "24+ Papers",
      questions: "3,600+ MCQs",
      badge: "Popular",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      accent: "from-emerald-500/20 to-teal-600/10",
      borderColor: "border-emerald-500/30 hover:border-emerald-400/70",
      icon: <FileTextIcon className="w-6 h-6 text-emerald-400" />,
      type: "revenue",
    },
    {
      id: "ldc",
      name: "LDC / Junior Assistant",
      fullName: "High Court & RSMSSB Clerk",
      desc: "General Hindi, English and General Knowledge past papers with answer explanations.",
      papers: "30+ Papers",
      questions: "4,200+ MCQs",
      badge: "High Vacancies",
      badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      accent: "from-cyan-500/20 to-blue-600/10",
      borderColor: "border-cyan-500/30 hover:border-cyan-400/70",
      icon: <BookOpenIcon className="w-6 h-6 text-cyan-400" />,
      type: "clerk",
    },
    {
      id: "vdo",
      name: "VDO (Gram Sevak)",
      fullName: "Village Development Officer",
      desc: "Prelims and Mains exam papers with analytical solutions & syllabus guide.",
      papers: "18+ Papers",
      questions: "2,900+ MCQs",
      badge: "RSMSSB",
      badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      accent: "from-indigo-500/20 to-blue-600/10",
      borderColor: "border-indigo-500/30 hover:border-indigo-400/70",
      icon: <FileTextIcon className="w-6 h-6 text-indigo-400" />,
      type: "revenue",
    },
    {
      id: "si",
      name: "Sub Inspector (SI)",
      fullName: "RPSC Police Sub-Inspector",
      desc: "Paper 1 (General Hindi) & Paper 2 (General Knowledge & General Science) complete archives.",
      papers: "22+ Papers",
      questions: "3,400+ MCQs",
      badge: "Uniform Service",
      badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
      accent: "from-rose-500/20 to-amber-600/10",
      borderColor: "border-rose-500/30 hover:border-rose-400/70",
      icon: <ShieldIcon className="w-6 h-6 text-rose-400" />,
      type: "police",
    },
  ];

  return (
    <section id="exams" className="py-20 bg-[#060b18] relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wider uppercase">
            <GraduationCapIcon className="w-4 h-4" />
            <span>Target Your Rajasthan Exam</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Explore Dedicated <span className="bg-gradient-to-r from-rose-400 via-orange-300 to-indigo-300 bg-clip-text text-transparent">Exam Vaults</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base font-light">
            Every Rajasthan government exam has a distinct pattern. Select your target exam to access curated, verified question papers and solutions.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`relative rounded-3xl p-5 bg-[#0a1128]/90 backdrop-blur-xl border ${cat.borderColor} shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(0,0,0,0.8)] group`}
            >
              {/* Top Accent Gradient Bar */}
              <div className={`absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r ${cat.accent} rounded-full`} />

              <div>
                {/* Card Top: Icon & Badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${cat.badgeColor}`}>
                    {cat.badge}
                  </span>
                </div>

                {/* Exam Title & Full Name */}
                <h3 className="text-white text-lg font-black tracking-tight group-hover:text-blue-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-slate-400 text-xs font-medium mb-2.5">
                  {cat.fullName}
                </p>

                {/* Description */}
                <p className="text-slate-300/80 text-xs leading-relaxed font-light mb-4 line-clamp-2">
                  {cat.desc}
                </p>
              </div>

              <div>
                {/* Stats Chips */}
                <div className="grid grid-cols-2 gap-2 py-2.5 px-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-4 text-center">
                  <div>
                    <span className="text-white font-bold text-xs block">{cat.papers}</span>
                    <span className="text-[10px] text-slate-400">Total Solved</span>
                  </div>
                  <div className="border-l border-slate-800">
                    <span className="text-emerald-400 font-bold text-xs block">{cat.questions}</span>
                    <span className="text-[10px] text-slate-400">Questions</span>
                  </div>
                </div>

                {/* Explore Button */}
                <a
                  href="#pyq-collections"
                  onClick={() => onSelectCategory && onSelectCategory(cat.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-gradient-to-r hover:from-[#e62e3d] hover:to-[#4f46e5] text-slate-200 hover:text-white border border-slate-800 hover:border-transparent font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md group/btn"
                >
                  <span>Explore Vault</span>
                  <ChevronRightIcon className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
