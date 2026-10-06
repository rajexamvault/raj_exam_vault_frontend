"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import examService from "@/services/examService";

export default function PyqVaultSection({ onOpenPreview }) {
  const [activeExamFilter, setActiveExamFilter] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [pyqItems, setPyqItems] = useState([]);
  const [availableExams, setAvailableExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPyqs() {
      try {
        setLoading(true);
        const res = await examService.getMaterials({
          materialType: "pyq",
          limit: 12
        });
        const list = res?.data?.materials || res?.materials || (Array.isArray(res?.data) ? res.data : []);
        setPyqItems(Array.isArray(list) ? list : []);

        // Also fetch active exams to build filter tabs dynamically from DB
        const examsRes = await examService.getExams({ limit: 8, status: "active" });
        const exList = examsRes?.data?.exams || examsRes?.exams || (Array.isArray(examsRes?.data) ? examsRes.data : []);
        setAvailableExams(Array.isArray(exList) ? exList : []);
      } catch (e) {
        console.warn("Could not load real PYQs in landing section:", e);
        setPyqItems([]);
      } finally {
        setLoading(false);
      }
    }
    loadPyqs();
  }, []);

  // Filter based on active exam filter and year
  const activeItems = pyqItems.filter((item) => {
    if (activeExamFilter !== "all") {
      const matchExam = String(item.examId) === String(activeExamFilter) ||
        (item.Exam && String(item.Exam.id) === String(activeExamFilter)) ||
        (item.Exam?.title && item.Exam.title.toLowerCase().includes(activeExamFilter.toLowerCase()));
      if (!matchExam) return false;
    }

    if (selectedYear !== "all" && String(item.year || item.examYear) !== selectedYear) {
      return false;
    }

    return true;
  });

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-[#6366F1] tracking-widest uppercase block">
              THE PYQ VAULT
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Understand the paper before you take it.
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Real question papers and verified solutions from the database.
            </p>
          </div>

          <Link
            href="/materials?materialType=pyq"
            className="self-start md:self-auto px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
          >
            <span>Explore all PYQs</span>
            <span>→</span>
          </Link>
        </div>

        {/* Dynamic Filter Pills from DB */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-10 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveExamFilter("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeExamFilter === "all"
                  ? "bg-[#6366F1] text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              All Exams
            </button>
            {availableExams.map((ex) => (
              <button
                key={ex.id}
                onClick={() => setActiveExamFilter(String(ex.id))}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeExamFilter === String(ex.id)
                    ? "bg-[#6366F1] text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {ex.shortName || ex.title}
              </button>
            ))}
          </div>

          {/* Year Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
            </select>
          </div>
        </div>

        {/* Real PYQ Cards Grid or Loading/Empty State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200 h-48 animate-pulse" />
            ))}
          </div>
        ) : activeItems.length === 0 ? (
          <div className="text-center py-12 bg-[#F8FAFC] rounded-2xl border border-slate-200 p-8">
            <span className="text-3xl block mb-2">📄</span>
            <h3 className="text-base font-bold text-slate-800">No PYQ papers found</h3>
            <p className="text-xs text-slate-400 mt-1">Upload question papers in the Admin Panel to display them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200/80 hover:border-indigo-300 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Badge & Year */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                      {item.isFree ? "FREE PYQ" : "PRO PYQ"}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {item.year || item.examYear || "Archive"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Exam & Subject */}
                  <div className="mt-2 text-xs font-semibold text-slate-500">
                    {item.Exam?.title || item.Subject?.name || "Official Paper"}
                  </div>

                  {/* Meta Details */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
                    {item.pageCount && <span>{item.pageCount} Pages</span>}
                    {item.fileSize && <span>• {item.fileSize}</span>}
                    {item.downloadCount !== undefined && <span>• {item.downloadCount} Downloads</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <button
                    onClick={() => onOpenPreview && onOpenPreview(item)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    View Details →
                  </button>

                  {item.fileUrl ? (
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-[#e62e3d] text-white font-bold text-xs shadow-xs transition-all"
                    >
                      Download PDF
                    </a>
                  ) : (
                    <button
                      onClick={() => onOpenPreview && onOpenPreview(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-[#e62e3d] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                    >
                      Get PDF
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
