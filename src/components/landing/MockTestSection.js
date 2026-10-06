"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import mockTestService from "@/services/mockTestService";

export default function MockTestSection() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTests() {
      try {
        setLoading(true);
        const res = await mockTestService.getAllTests({
          limit: 6,
          status: "published"
        });
        const list = res?.data?.mockTests || res?.mockTests || (Array.isArray(res?.data) ? res.data : []);
        setTests(Array.isArray(list) ? list : []);
      } catch (e) {
        console.warn("Could not load real mock tests in landing section:", e);
        setTests([]);
      } finally {
        setLoading(false);
      }
    }
    loadTests();
  }, []);

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-[#6366F1] tracking-widest uppercase block">
              PRACTICE LIKE IT’S EXAM DAY
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Turn preparation into practice.
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Timed mock tests and question series from the active test bank.
            </p>
          </div>

          <Link
            href="/tests"
            className="self-start md:self-auto px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
          >
            <span>Explore all tests</span>
            <span>→</span>
          </Link>
        </div>

        {/* Real Test Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-[#F8FAFC] rounded-3xl p-6 border border-slate-200 h-64 animate-pulse" />
            ))}
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-12 bg-[#F8FAFC] rounded-2xl border border-slate-200 p-8">
            <span className="text-3xl block mb-2">⏱️</span>
            <h3 className="text-base font-bold text-slate-800">No mock tests currently published</h3>
            <p className="text-xs text-slate-400 mt-1">Mock tests created in the Admin Panel will be listed here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tests.map((test) => (
              <div
                key={test.id}
                className="bg-[#F8FAFC] rounded-3xl p-6 border border-slate-200/90 hover:border-indigo-300 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Badge & Timing */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {test.isFree ? "FREE MOCK" : "PRO TEST"}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      ⏱️ {test.durationMinutes || 60} Mins
                    </span>
                  </div>

                  {/* Titles */}
                  <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                    {test.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-1">
                    {test.Exam?.title || test.testType || "Practice Series"}
                  </p>

                  {/* Meta details bar */}
                  <div className="mt-4 flex items-center gap-3 text-xs font-bold text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200/70">
                    <span>{test.totalQuestions || 0} Questions</span>
                    <span>•</span>
                    <span>{test.totalMarks || 100} Marks</span>
                  </div>

                  {/* Negative marking info */}
                  <div className="mt-4 text-xs text-slate-600 flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Negative Marking: {test.negativeMarking ? `-${test.negativeMarkingRatio || '1/3'}` : 'No negative marking'}</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6 pt-4 border-t border-slate-200/60">
                  <Link
                    href={`/tests/${test.id}`}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-gradient-to-r hover:from-rose-600 hover:to-indigo-600 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Start Mock Test</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
