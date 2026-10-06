"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import examService from "@/services/examService";

export default function ExamVaultsSection() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExams() {
      try {
        setLoading(true);
        const res = await examService.getExams({ limit: 12, status: "active" });
        const list = res?.data?.exams || res?.exams || (Array.isArray(res?.data) ? res.data : []);
        setExams(Array.isArray(list) ? list : []);
      } catch (e) {
        console.warn("Could not load destination exams from API:", e);
        setExams([]);
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, []);

  return (
    <section className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-[#6366F1] tracking-widest uppercase block">
              CHOOSE YOUR DESTINATION
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Your exam. Your dedicated vault.
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Explore officially listed exams and their complete study vaults.
            </p>
          </div>

          <Link
            href="/exams"
            className="self-start md:self-auto px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold text-xs border border-slate-200 shadow-xs flex items-center gap-1.5 transition-all"
          >
            <span>Browse all exams</span>
            <span>→</span>
          </Link>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-5 border border-slate-200 h-44 animate-pulse space-y-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : exams.length === 0 ? (
          /* Empty DB state */
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <span className="text-3xl block mb-2">🏛️</span>
            <h3 className="text-base font-bold text-slate-800">No active exams found in database</h3>
            <p className="text-xs text-slate-400 mt-1">Exams added by SuperAdmins will appear here immediately.</p>
          </div>
        ) : (
          /* Real Database Exams Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {exams.map((exam) => (
              <Link
                key={exam.id}
                href={`/exams/${exam.slug || exam.id}`}
                className="group bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-indigo-400/80 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Icon & Arrow */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                      {exam.icon || "🏛️"}
                    </div>
                    <span className="text-slate-300 group-hover:text-indigo-600 transition-colors text-lg">
                      ↗
                    </span>
                  </div>

                  {/* Exam Title & Organization */}
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {exam.title}
                  </h3>
                  {exam.shortName && (
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      {exam.shortName}
                    </p>
                  )}

                  {/* Category & Status */}
                  <div className="mt-3 text-[11px] font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span>{exam.category || "Competitive Exam"}</span>
                    {exam.stagesCount ? <span>{exam.stagesCount} Stages</span> : null}
                  </div>
                </div>

                {/* Bottom Action Link */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-indigo-600">
                  <span>Explore Vault</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
