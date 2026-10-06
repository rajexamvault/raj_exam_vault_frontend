"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import examService from "@/services/examService";
import syllabusService from "@/services/syllabusService";

export default function SyllabusExplorerSection() {
  const [activeExam, setActiveExam] = useState(null);
  const [hierarchy, setHierarchy] = useState(null);
  const [activeStageId, setActiveStageId] = useState(null);
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRealHierarchy() {
      try {
        setLoading(true);
        // 1. Get first active exam
        const examsRes = await examService.getExams({ limit: 1, status: "active" });
        const list = examsRes?.data?.exams || examsRes?.exams || (Array.isArray(examsRes?.data) ? examsRes.data : []);
        
        if (list && list.length > 0) {
          const exam = list[0];
          setActiveExam(exam);

          // 2. Fetch real database hierarchy tree
          const treeRes = await syllabusService.getExamHierarchy(exam.id);
          const treeData = treeRes?.data || treeRes;
          setHierarchy(treeData);

          if (treeData?.stages && treeData.stages.length > 0) {
            const firstStage = treeData.stages[0];
            setActiveStageId(firstStage.id);
            if (firstStage.subjects && firstStage.subjects.length > 0) {
              setActiveSubjectId(firstStage.subjects[0].id);
            }
          }
        }
      } catch (e) {
        console.warn("Could not load real syllabus hierarchy:", e);
      } finally {
        setLoading(false);
      }
    }
    loadRealHierarchy();
  }, []);

  const stages = hierarchy?.stages || [];
  const currentStage = stages.find((s) => s.id === activeStageId) || stages[0];
  const currentSubjects = currentStage?.subjects || [];
  const currentSubject = currentSubjects.find((s) => s.id === activeSubjectId) || currentSubjects[0];
  const currentTopics = currentSubject?.topics || [];

  return (
    <section className="py-20 bg-[#090D16] text-white border-b border-[#141F36] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-900/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Explanations & CTA */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-extrabold text-[#818CF8] tracking-widest uppercase block">
              LESS GUESSWORK. MORE DIRECTION.
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Every topic. Mapped to your preparation.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Navigate real syllabus stages and topics from our database without missing critical scoring areas.
            </p>

            {/* 3 Numbered Steps */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-extrabold text-xs flex items-center justify-center shrink-0 border border-indigo-500/30">
                  01
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Stages</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Prelims, Mains, and Interview paths clearly outlined.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 font-extrabold text-xs flex items-center justify-center shrink-0 border border-purple-500/30">
                  02
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Subjects</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Structured database subject modules.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 font-extrabold text-xs flex items-center justify-center shrink-0 border border-rose-500/30">
                  03
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Topics</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Linked directly to study resources and questions.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={`/exams/${activeExam?.slug || activeExam?.id || "ras-rts"}?tab=syllabus`}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#e62e3d] via-[#a8226a] to-[#8b5cf6] hover:opacity-95 text-white font-bold text-xs shadow-md inline-flex items-center gap-2 transition-all"
              >
                <span>Explore {activeExam?.shortName || activeExam?.title || "Exam"} syllabus</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Real Hierarchy Explorer Widget */}
          <div className="lg:col-span-7 bg-[#111B33]/90 rounded-3xl p-5 sm:p-7 border border-slate-700/80 shadow-2xl space-y-5">
            
            {loading ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400 animate-pulse">
                Loading database syllabus hierarchy...
              </div>
            ) : stages.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <span className="text-3xl block">📑</span>
                <p className="text-sm font-bold text-slate-200">Syllabus hierarchy not yet populated for this exam</p>
                <p className="text-xs">Add stages, subjects and topics in the Admin Panel to display here.</p>
              </div>
            ) : (
              <>
                {/* Stage Tabs Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
                  <div className="flex items-center gap-2 flex-wrap">
                    {stages.map((stage) => (
                      <button
                        key={stage.id}
                        onClick={() => {
                          setActiveStageId(stage.id);
                          const firstSub = stage.subjects && stage.subjects[0];
                          if (firstSub) setActiveSubjectId(firstSub.id);
                        }}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          (activeStageId === stage.id || (!activeStageId && stage === stages[0]))
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {stage.name}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline truncate max-w-[150px]">
                    {activeExam?.shortName || activeExam?.title}
                  </span>
                </div>

                {/* Split View: Real Subjects Sidebar & Real Topics Panel */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[260px]">
                  
                  {/* Subjects List */}
                  <div className="md:col-span-5 space-y-1.5 border-b md:border-b-0 md:border-r border-slate-700/60 pb-3 md:pb-0 md:pr-3">
                    {currentSubjects.length === 0 ? (
                      <div className="p-3 text-xs text-slate-500">No subjects in this stage</div>
                    ) : (
                      currentSubjects.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setActiveSubjectId(sub.id)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                            (activeSubjectId === sub.id || (!activeSubjectId && sub === currentSubjects[0]))
                              ? "bg-slate-800 text-white border border-slate-600"
                              : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                          }`}
                        >
                          <span className="truncate mr-2">{sub.name}</span>
                          {sub.topics && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 shrink-0">
                              {sub.topics.length}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Topics Panel */}
                  <div className="md:col-span-7 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {currentTopics.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No topics listed under this subject yet.
                      </div>
                    ) : (
                      currentTopics.map((top) => (
                        <div
                          key={top.id}
                          className="p-3 rounded-xl bg-[#0A101D] border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-2"
                        >
                          <span className="text-xs font-semibold text-slate-200 truncate">
                            {top.name}
                          </span>
                          <Link
                            href="/materials"
                            className="text-[10px] font-bold text-rose-400 hover:underline shrink-0"
                          >
                            Study →
                          </Link>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              </>
            )}

          </div>

        </div>
      </div>
    </section>
  );
}
