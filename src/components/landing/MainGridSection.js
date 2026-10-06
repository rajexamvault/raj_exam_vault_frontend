"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import examService from "@/services/examService";
import { StarIcon, DownloadIcon, FileTextIcon, EyeIcon } from "@/components/common/Icons";

const THEMES = [
  { coverTheme: "from-[#0f382c] to-[#08221a]", accentBorder: "border-[#156049]" },
  { coverTheme: "from-[#4a121a] to-[#2b080d]", accentBorder: "border-[#822432]" },
  { coverTheme: "from-[#0e3347] to-[#071c28]", accentBorder: "border-[#185575]" },
  { coverTheme: "from-[#522019] to-[#30110c]", accentBorder: "border-[#8a382c]" },
];

const EXAM_COLORS = [
  "bg-rose-50 text-rose-600 border-rose-200",
  "bg-emerald-50 text-emerald-600 border-emerald-200",
  "bg-amber-50 text-amber-600 border-amber-200",
  "bg-blue-50 text-blue-600 border-blue-200",
  "bg-red-50 text-red-600 border-red-200",
  "bg-orange-50 text-orange-600 border-orange-200",
  "bg-cyan-50 text-cyan-600 border-cyan-200",
  "bg-indigo-50 text-indigo-600 border-indigo-200"
];

export default function MainGridSection({ onOpenPreview }) {
  const [liveExams, setLiveExams] = useState([]);
  const [liveMaterials, setLiveMaterials] = useState([]);
  const [liveFreeMaterials, setLiveFreeMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRealData() {
      try {
        setLoading(true);
        const [examsRes, materialsRes, freeRes] = await Promise.all([
          examService.getExams({ limit: 8, status: "active" }).catch(() => null),
          examService.getMaterials({ limit: 4, status: "published" }).catch(() => null),
          examService.getMaterials({ isFree: "true", limit: 4, status: "published" }).catch(() => null)
        ]);

        const examsList = examsRes?.data?.exams || examsRes?.exams || (Array.isArray(examsRes?.data) ? examsRes.data : []);
        setLiveExams(Array.isArray(examsList) ? examsList : []);

        const materialsList = materialsRes?.data?.materials || materialsRes?.materials || (Array.isArray(materialsRes?.data) ? materialsRes.data : []);
        setLiveMaterials(Array.isArray(materialsList) ? materialsList : []);

        const freeList = freeRes?.data?.materials || freeRes?.materials || (Array.isArray(freeRes?.data) ? freeRes.data : []);
        setLiveFreeMaterials(Array.isArray(freeList) ? freeList : []);
      } catch (err) {
        console.error("Failed to load live database data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRealData();
  }, []);

  const handleDownloadMaterial = (mat) => {
    if (!mat?.fileUrl) return;
    const link = document.createElement("a");
    link.href = mat.fileUrl;
    link.target = "_blank";
    link.download = mat.title || "document";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="pyq-centre" className="py-10 bg-[#f8fafc]">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Column 1: Popular Rajasthan Exams from DB */}
          <div className="lg:col-span-12 xl:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="text-[#0f224a] font-bold text-sm">Popular Exams</h3>
                  <Link href="/exams" className="text-xs font-bold text-[#0f224a] hover:text-[#d32f2f]">
                    View All
                  </Link>
                </div>

                {loading ? (
                  <div className="py-12 text-center text-xs text-slate-400">Loading exams...</div>
                ) : liveExams.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-100 p-4">
                    <span className="text-2xl">🏛️</span>
                    <p className="text-xs text-slate-600 font-semibold mt-1">No active exams found</p>
                    <Link href="/exams" className="text-[11px] text-[#0f224a] font-bold hover:underline mt-1 block">
                      Explore directory →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-2.5 sm:gap-3">
                    {liveExams.map((exam, idx) => {
                      const color = EXAM_COLORS[idx % EXAM_COLORS.length];
                      const displayName = (exam.shortName && exam.shortName.trim().toUpperCase() !== 'EXAM')
                        ? exam.shortName.trim()
                        : (exam.title || "Exam");

                      return (
                        <Link
                          key={exam.id || idx}
                          href={`/exams/${exam.slug || exam.id}`}
                          className="p-2.5 sm:p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-xs bg-slate-50/60 hover:bg-white transition-all flex flex-col items-center text-center cursor-pointer group"
                        >
                          <div className={`w-9 sm:w-10 h-9 sm:h-10 rounded-xl border flex items-center justify-center text-base sm:text-lg mb-1.5 sm:mb-2 ${color} transition-transform group-hover:scale-105`}>
                            {exam.icon || "🏛️"}
                          </div>
                          <h4 className="text-slate-900 font-bold text-[11.5px] sm:text-xs leading-tight group-hover:text-[#0f224a] truncate w-full">
                            {displayName}
                          </h4>
                          <span className="text-[9.5px] sm:text-[10px] text-slate-500 font-medium mt-0.5 truncate w-full">
                            {exam.stats?.totalMaterials ? `${exam.stats.totalMaterials} Materials` : (exam.category || "Rajasthan Exam")}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Real Study Materials & PYQs from DB */}
          <div className="lg:col-span-12 xl:col-span-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="text-[#0f224a] font-bold text-sm">
                    Popular PYQs & Study Notes <span className="text-[#d32f2f]">(Verified)</span>
                  </h3>
                  <Link href="/materials" className="text-xs font-bold text-[#0f224a] hover:text-[#d32f2f]">
                    View All
                  </Link>
                </div>

                {loading ? (
                  <div className="py-16 text-center text-xs text-slate-400">Loading study materials...</div>
                ) : liveMaterials.length === 0 ? (
                  <div className="py-12 text-center bg-slate-50 rounded-xl border border-slate-100 p-6">
                    <span className="text-3xl">📚</span>
                    <p className="text-xs text-slate-700 font-bold mt-2">No study materials in database yet</p>
                    <p className="text-[11px] text-slate-500 mt-1">Upload materials via Admin Panel or check back soon.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-3.5">
                    {liveMaterials.map((mat, idx) => {
                      const theme = THEMES[idx % THEMES.length];
                      const price = Number(mat.price) || 0;
                      const isFree = mat.isFree || price === 0;

                      return (
                        <div
                          key={mat.id || idx}
                          className="flex flex-col justify-between bg-white rounded-xl border border-slate-200/90 p-2.5 shadow-2xs hover:shadow-md transition-all group"
                        >
                          {/* Hardcover Book Cover with Real Title */}
                          <div className={`w-full aspect-[3/4] max-w-[200px] mx-auto rounded-lg bg-gradient-to-b ${theme.coverTheme} border ${theme.accentBorder} p-3 flex flex-col justify-between text-white text-center shadow-inner relative overflow-hidden mb-2.5`}>
                            <div className="absolute top-0 bottom-0 left-1.5 w-1 bg-white/10 rounded-full" />
                            
                            <div className="pt-1">
                              <span className="text-[8px] tracking-widest text-slate-300 font-extrabold uppercase block">
                                {mat.exam?.shortName || "RAJASTHAN"}
                              </span>
                              <h4 className="font-black text-xs sm:text-sm tracking-tight leading-tight mt-1 line-clamp-2">
                                {mat.title}
                              </h4>
                              <span className="text-[9px] font-black tracking-wider text-amber-300 block mt-1 uppercase">
                                {(mat.materialType || "pyq").replace("_", " ")}
                              </span>
                            </div>

                            <div className="pb-1">
                              <span className="text-[8px] font-mono text-slate-300 block">
                                {mat.year ? `Year ${mat.year}` : (mat.subject || "Official Paper")}
                              </span>
                              <div className="w-6 h-0.5 bg-amber-400 mx-auto mt-1 rounded-full" />
                            </div>
                          </div>

                          {/* Info & Price */}
                          <div className="space-y-1 text-center">
                            <h5 className="font-bold text-slate-900 text-xs truncate" title={mat.title}>
                              {mat.title}
                            </h5>
                            <p className="text-[10px] text-slate-500 font-medium truncate">
                              {mat.exam?.title || mat.subject || "Rajasthan Exam"}
                            </p>
                            <span className="text-[9.5px] text-slate-500 block">
                              {mat.fileSize || "PDF Material"}
                            </span>

                            {/* Price / Free Indicator */}
                            <div className="pt-1 flex items-baseline justify-center gap-1.5">
                              {isFree ? (
                                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">FREE</span>
                              ) : (
                                <span className="text-sm font-black text-[#d32f2f]">₹{price}</span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                            <button
                              onClick={() => {
                                if (onOpenPreview) {
                                  onOpenPreview({
                                    id: mat.id,
                                    title: mat.title,
                                    category: mat.exam?.title || mat.subject || "Rajasthan Prep",
                                    price: mat.price,
                                    fileUrl: mat.fileUrl,
                                    isFree: mat.isFree
                                  });
                                } else if (mat.fileUrl) {
                                  window.open(mat.fileUrl, "_blank");
                                }
                              }}
                              className="py-1.5 px-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] transition-colors cursor-pointer text-center"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => handleDownloadMaterial(mat)}
                              className="py-1.5 px-1 rounded-md bg-[#0f224a] hover:bg-[#162c5b] text-white font-bold text-[10px] transition-colors cursor-pointer text-center"
                            >
                              {isFree ? "Download" : "Get PDF"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 3: Real Free Resources from DB */}
          <div className="lg:col-span-12 xl:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 h-full flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="text-[#0f224a] font-bold text-sm">Start Preparing For Free</h3>
                  <Link href="/materials?isFree=true" className="text-xs font-bold text-[#0f224a] hover:text-[#d32f2f]">
                    View All
                  </Link>
                </div>

                {loading ? (
                  <div className="py-12 text-center text-xs text-slate-400">Loading free materials...</div>
                ) : liveFreeMaterials.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-100 p-4">
                    <span className="text-2xl">🎁</span>
                    <p className="text-xs text-slate-700 font-bold mt-1">No free materials listed</p>
                    <Link href="/materials" className="text-[11px] text-[#0f224a] font-bold hover:underline mt-1 block">
                      Browse all materials →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2.5 sm:space-y-3">
                    {liveFreeMaterials.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 sm:p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between gap-2.5 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-1.5 py-0.5 rounded text-[8.5px] sm:text-[9px] font-black bg-[#d32f2f] text-white shrink-0">
                            FREE
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-slate-900 font-bold text-[11.5px] sm:text-xs truncate" title={item.title}>
                              {item.title}
                            </h4>
                            <p className="text-[9.5px] sm:text-[10px] text-slate-500 truncate">
                              {item.exam?.shortName || item.subject || "Free PDF"}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDownloadMaterial(item)}
                          className="py-1.5 px-2 sm:px-2.5 rounded-lg border border-[#0f224a] text-[#0f224a] hover:bg-[#0f224a] hover:text-white font-bold text-[9.5px] sm:text-[10px] transition-colors shrink-0 cursor-pointer text-center"
                        >
                          Download PDF
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* View All Free PYQs Link */}
              <div className="pt-3 border-t border-slate-100 text-center">
                <Link
                  href="/materials?isFree=true"
                  className="text-xs font-bold text-[#0f224a] hover:text-[#d32f2f] inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>View All Free PYQs</span>
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
