"use client";

import { useState } from "react";
import { 
  FileTextIcon, 
  DownloadIcon, 
  EyeIcon, 
  SparklesIcon, 
  CheckCircleIcon, 
  StarIcon,
  ShieldIcon,
  ZapIcon
} from "@/components/common/Icons";

export default function PopularPYQSection({ onOpenPreview, activeCategoryFilter }) {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "All Collections" },
    { id: "rpsc", label: "RPSC RAS" },
    { id: "reet", label: "REET Teaching" },
    { id: "police", label: "Police & SI" },
    { id: "cet", label: "CET 12th & Grad" },
    { id: "patwari", label: "Patwari & VDO" },
  ];

  const collections = [
    {
      id: "ras-pre-mega",
      title: "RPSC RAS Prelims (2013 - 2024) Solved Mega Vault",
      category: "rpsc",
      categoryName: "RPSC RAS",
      year: "2013-2024 (11 Years)",
      papers: "14 Full Papers",
      questions: "2,100+ MCQs",
      price: 149,
      originalPrice: 399,
      rating: 4.9,
      reviewsCount: 840,
      downloads: "12,400+ Downloads",
      badge: "Bestseller",
      badgeColor: "bg-rose-500 text-white",
      highlight: "Official RPSC Final Answer Keys + Explanation",
    },
    {
      id: "reet-l2-sst",
      title: "REET Level-2 Social Studies & Child Pedagogy Vault",
      category: "reet",
      categoryName: "REET Teaching",
      year: "2015 - 2023",
      papers: "10 Full Papers",
      questions: "1,500+ MCQs",
      price: 99,
      originalPrice: 249,
      rating: 4.8,
      reviewsCount: 620,
      downloads: "8,900+ Downloads",
      badge: "Top Rated",
      badgeColor: "bg-blue-600 text-white",
      highlight: "RBSE Pedagogy & Rajasthan History Solved",
    },
    {
      id: "reet-l2-sci",
      title: "REET Level-2 Science & Mathematics 10-Year Archive",
      category: "reet",
      categoryName: "REET Teaching",
      year: "2015 - 2023",
      papers: "10 Full Papers",
      questions: "1,500+ MCQs",
      price: 99,
      originalPrice: 249,
      rating: 4.9,
      reviewsCount: 510,
      downloads: "7,300+ Downloads",
      badge: "High Demand",
      badgeColor: "bg-indigo-600 text-white",
      highlight: "Step-by-step Maths calculation keys",
    },
    {
      id: "police-constable",
      title: "Rajasthan Police Constable All Shifts (2018 - 2024)",
      category: "police",
      categoryName: "Police & SI",
      year: "2018 - 2024",
      papers: "28 Shift Papers",
      questions: "4,200+ MCQs",
      price: 129,
      originalPrice: 349,
      rating: 4.9,
      reviewsCount: 1200,
      downloads: "16,500+ Downloads",
      badge: "Mega Pack",
      badgeColor: "bg-amber-600 text-white",
      highlight: "Includes Women & Child Crime special sections",
    },
    {
      id: "police-si",
      title: "RPSC Sub-Inspector (SI) Hindi & GK Solved Papers",
      category: "police",
      categoryName: "Police & SI",
      year: "2016 - 2021",
      papers: "8 Shift Papers",
      questions: "1,600+ MCQs",
      price: 119,
      originalPrice: 299,
      rating: 4.8,
      reviewsCount: 430,
      downloads: "6,200+ Downloads",
      badge: "Standard",
      badgeColor: "bg-purple-600 text-white",
      highlight: "General Hindi 100-Question Mastery Solutions",
    },
    {
      id: "cet-12th-grad",
      title: "Rajasthan CET (12th Level + Graduation) Master Combo",
      category: "cet",
      categoryName: "CET 12th & Grad",
      year: "2022 - 2024",
      papers: "16 Shift Papers",
      questions: "2,400+ MCQs",
      price: 139,
      originalPrice: 399,
      rating: 4.9,
      reviewsCount: 950,
      downloads: "14,800+ Downloads",
      badge: "Trending",
      badgeColor: "bg-emerald-600 text-white",
      highlight: "RSMSSB official revised answer key verified",
    },
    {
      id: "patwari-vdo",
      title: "Rajasthan Patwari & VDO Solved Papers Archive",
      category: "patwari",
      categoryName: "Patwari & VDO",
      year: "2015 - 2022",
      papers: "12 Full Papers",
      questions: "1,800+ MCQs",
      price: 99,
      originalPrice: 249,
      rating: 4.7,
      reviewsCount: 380,
      downloads: "5,400+ Downloads",
      badge: "Value Pack",
      badgeColor: "bg-cyan-600 text-white",
      highlight: "Rajasthan Geography, Art & Culture with keys",
    },
    {
      id: "ldc-highcourt",
      title: "Rajasthan High Court & RSMSSB LDC Solved Papers",
      category: "patwari",
      categoryName: "Patwari & VDO",
      year: "2016 - 2023",
      papers: "14 Full Papers",
      questions: "2,100+ MCQs",
      price: 89,
      originalPrice: 219,
      rating: 4.8,
      reviewsCount: 490,
      downloads: "7,100+ Downloads",
      badge: "Popular",
      badgeColor: "bg-rose-600 text-white",
      highlight: "Complete Hindi & English Grammar Solutions",
    },
  ];

  const currentFilter = activeCategoryFilter && activeCategoryFilter !== "all" 
    ? activeCategoryFilter 
    : activeTab;

  const filteredCollections = currentFilter === "all"
    ? collections
    : collections.filter((c) => c.category === currentFilter);

  return (
    <section id="pyq-collections" className="py-20 bg-[#070d1e] relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-rose-500/30 text-rose-400 text-xs font-bold tracking-wider uppercase mb-3">
              <SparklesIcon className="w-4 h-4" />
              <span>Verified Solved Archives</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Popular <span className="bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#818cf8] bg-clip-text text-transparent">PYQ Collections</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-light mt-2 max-w-2xl">
              Carefully organized year-wise and shift-wise previous question papers with official board keys for instant PDF download.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="hidden lg:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#0a1128] border border-blue-500/20 text-xs text-slate-300 shadow-md">
            <ShieldIcon className="w-4 h-4 text-emerald-400" />
            <span>Over <strong>280+ Solved Papers</strong> Available in Vault</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#e62e3d] to-[#4f46e5] text-white shadow-lg shadow-rose-950/40"
                  : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCollections.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-[#0a122a]/95 border border-blue-500/20 hover:border-blue-400/50 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.75)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group backdrop-blur-xl"
            >
              <div>
                {/* Card Top: Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  
                  {/* PDF Badge */}
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/60 text-[10px] text-slate-300 font-semibold">
                    <FileTextIcon className="w-3 h-3 text-rose-400" />
                    <span>PDF</span>
                  </div>
                </div>

                {/* Exam Title */}
                <h3 className="text-white font-bold text-base leading-snug group-hover:text-blue-300 transition-colors line-clamp-2 mb-2">
                  {item.title}
                </h3>

                {/* Highlight text */}
                <p className="text-emerald-400 text-xs font-medium flex items-center gap-1.5 mb-3 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/30">
                  <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.highlight}</span>
                </p>

                {/* Paper Specs Grid */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-4 text-center">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Year Span</span>
                    <span className="text-white text-xs font-bold">{item.year}</span>
                  </div>
                  <div className="border-l border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Questions</span>
                    <span className="text-indigo-300 text-xs font-bold">{item.questions}</span>
                  </div>
                </div>

                {/* Rating & Social Proof */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <StarIcon className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{item.rating}</span>
                    <span className="text-slate-500 font-normal">({item.reviewsCount})</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">{item.downloads}</span>
                </div>
              </div>

              {/* Price & Action Buttons */}
              <div>
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-2xl font-black text-white">₹{item.price}</span>
                    <span className="text-xs text-slate-500 line-through ml-2">₹{item.originalPrice}</span>
                  </div>
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                    {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onOpenPreview && onOpenPreview(item)}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <EyeIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Details</span>
                  </button>

                  <button
                    onClick={() => {
                      alert(`Proceeding to instant checkout for ${item.title} at ₹${item.price}. Vault download will unlock immediately.`);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#e62e3d] to-[#4f46e5] hover:opacity-95 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <ZapIcon className="w-3.5 h-3.5" />
                    <span>Buy Now</span>
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
