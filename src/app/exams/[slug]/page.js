"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FlashTicker from "@/components/layout/FlashTicker";
import examService from "@/services/examService";
import syllabusService from "@/services/syllabusService";
import mockTestService from "@/services/mockTestService";

export default function DynamicExamHubPage({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [exam, setExam] = useState(null);
  const [syllabusTree, setSyllabusTree] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("syllabus"); // 'syllabus' | 'materials' | 'tests' | 'overview'

  // Expanded accordion stages in syllabus
  const [expandedStages, setExpandedStages] = useState({});

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Exam details
        const examRes = await examService.getExamBySlug(slug);
        const examData = examRes?.data?.exam || examRes?.exam || examRes?.data;
        if (examData) {
          setExam(examData);

          // 2. Parallel fetch: Syllabus Hierarchy, Materials, Mock Tests
          const [treeRes, matRes, testRes] = await Promise.all([
            syllabusService.getExamHierarchy(examData.id).catch(() => ({ data: null })),
            examService.getMaterials({ examId: examData.id, limit: 30 }).catch(() => ({ data: { materials: [] } })),
            mockTestService.getAllTests({ examId: examData.id, limit: 10 }).catch(() => ({ data: { mockTests: [] } }))
          ]);

          const treeData = treeRes?.data?.stages ? treeRes.data : (treeRes?.data?.data?.stages ? treeRes.data.data : (treeRes?.data || null));
          if (treeData) {
            setSyllabusTree(treeData);
            if (treeData.stages && treeData.stages.length > 0) {
              setExpandedStages({ [treeData.stages[0].id]: true });
            }
          }
          const mats = matRes?.data?.materials || matRes?.materials || (Array.isArray(matRes?.data) ? matRes.data : []);
          setMaterials(mats);
          const tests = testRes?.data?.mockTests || testRes?.mockTests || (Array.isArray(testRes?.data) ? testRes.data : []);
          setMockTests(tests);
        }
      } catch (err) {
        console.error("Failed to load exam data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchExamData();
  }, [slug]);

  const toggleStage = (stageId) => {
    setExpandedStages(prev => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="py-24 text-center">
          <div className="inline-block animate-spin text-4xl mb-3">🔄</div>
          <p className="text-sm font-semibold text-slate-600">Loading Exam Vault...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="py-24 text-center max-w-md mx-auto px-4">
          <span className="text-4xl">🏛️</span>
          <h2 className="text-xl font-bold text-slate-800 mt-3">Exam Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            The requested exam does not exist or may have been archived.
          </p>
          <Link href="/exams" className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold">
            ← Browse All Exams
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const stages = syllabusTree?.stages || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <FlashTicker />
        <Navbar />

        {/* Exam Header Hero */}
        <section className="bg-slate-900 text-white py-10 px-4 sm:px-8 border-b border-slate-800">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl shadow-inner shrink-0">
                  {exam.icon || "🏛️"}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-600/30 text-red-300 border border-red-500/40 text-[10px] font-bold uppercase tracking-wider">
                      {exam.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {exam.department || "RPSC / RSMSSB"}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mt-1">
                    {exam.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                    {exam.description || "Comprehensive preparation hub including multi-tier stages, syllabus breakdown, PYQs, and test series."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {exam.syllabusUrl && (
                  <a
                    href={exam.syllabusUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
                  >
                    <span>📄 Official Syllabus PDF</span>
                  </a>
                )}
                {exam.officialWebsite && (
                  <a
                    href={exam.officialWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
                  >
                    <span>🌐 Official Portal</span>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Stages / Tiers</span>
                <div className="text-lg font-black text-white mt-0.5">{stages.length} Stages</div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Vacancies</span>
                <div className="text-lg font-black text-emerald-400 mt-0.5">{exam.totalVacancies || "Not announced"}</div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">PYQs & Notes</span>
                <div className="text-lg font-black text-blue-400 mt-0.5">{materials.length} Documents</div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Mock Test Series</span>
                <div className="text-lg font-black text-purple-400 mt-0.5">{mockTests.length} Tests</div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="bg-white border-b border-slate-200 sticky top-[57px] z-30 shadow-2xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center gap-4 sm:gap-8 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("syllabus")}
              className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === "syllabus"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              📑 Stages & Syllabus Hierarchy ({stages.length})
            </button>
            <button
              onClick={() => setActiveTab("materials")}
              className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === "materials"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              📚 PYQs & Notes Vault ({materials.length})
            </button>
            <button
              onClick={() => setActiveTab("tests")}
              className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === "tests"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              🏆 Practice Mock Tests ({mockTests.length})
            </button>
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === "overview"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              📋 Scheme & Guidelines
            </button>
          </div>
        </section>

        {/* Main Content Viewport */}
        <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
          
          {/* TAB 1: SYLLABUS HIERARCHY */}
          {activeTab === "syllabus" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>🏛️</span>
                  <span>Exam Stage & Subject Scheme</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Official structure detailing each examination tier, subject distribution, weightage, and units.
                </p>
              </div>

              {stages.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <span className="text-3xl">📋</span>
                  <p className="text-sm font-semibold text-slate-700 mt-2">Syllabus breakdown is being compiled.</p>
                  <p className="text-xs text-slate-400 mt-1">Please check back soon or download the official notification PDF above.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stages.map((stage) => {
                    const isExpanded = expandedStages[stage.id];
                    const subjects = stage.subjects || [];

                    return (
                      <div key={stage.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Stage Header */}
                        <div
                          onClick={() => toggleStage(stage.id)}
                          className="p-4 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between cursor-pointer transition border-b border-slate-100"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                              {stage.stageOrder || 1}
                            </span>
                            <div>
                              <h3 className="text-base font-bold text-slate-900">{stage.name}</h3>
                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                <span>⏱️ {stage.durationMinutes || "180"} Mins</span>
                                <span>🎯 {stage.totalMarks || 200} Marks</span>
                                <span>⚠️ Penalty: {stage.negativeMarking || 0.33}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-slate-400 text-sm font-bold">{isExpanded ? "▲" : "▼"}</span>
                        </div>

                        {/* Stage Subjects */}
                        {isExpanded && (
                          <div className="p-4 space-y-4 bg-slate-50/30">
                            {subjects.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">No subject modules mapped for this stage yet.</p>
                            ) : (
                              subjects.map((sub) => {
                                const topics = sub.topics || [];
                                const syllabusItems = sub.syllabusItems || [];

                                return (
                                  <div key={sub.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-bold text-slate-800">{sub.name}</h4>
                                        {sub.code && (
                                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono font-semibold">
                                            {sub.code}
                                          </span>
                                        )}
                                      </div>
                                      {sub.totalMarks && (
                                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                          {sub.totalMarks} Marks
                                        </span>
                                      )}
                                    </div>

                                    {/* Topics Chips */}
                                    {topics.length > 0 && (
                                      <div className="space-y-1.5 pt-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                          Key Chapters & Units:
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                          {topics.map((t) => (
                                            <span key={t.id} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                                              • {t.name}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Key Syllabus Bullet Items */}
                                    {syllabusItems.length > 0 && (
                                      <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                                        {syllabusItems.map((item) => (
                                          <div key={item.id} className="text-xs text-slate-600 flex items-start gap-1.5">
                                            <span className="text-red-500 font-bold">✓</span>
                                            <span>{item.title}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PYQS & NOTES VAULT */}
          {activeTab === "materials" && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>📚</span>
                  <span>Previous Year Papers & Study Materials</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Download question papers with official answer keys, notes, and free PDFs for {exam.title}.
                </p>
              </div>

              {materials.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <span className="text-3xl">📂</span>
                  <p className="text-sm font-semibold text-slate-700 mt-2">No study materials uploaded for this exam yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {materials.map((mat) => (
                    <div key={mat.id} className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-red-400 hover:shadow-md transition flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold uppercase border border-amber-200">
                          {mat.materialType?.toUpperCase() || "PYQ"} • {mat.year}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{mat.title}</h4>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span>{mat.subject || "General Paper"}</span>
                          <span>•</span>
                          <span>💾 {mat.fileSize || "3.5 MB"}</span>
                          <span>•</span>
                          <span>⬇️ {mat.totalDownloads || 0} downloads</span>
                        </div>
                      </div>

                      <a
                        href={mat.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition shrink-0"
                      >
                        Download 📄
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MOCK TESTS */}
          {activeTab === "tests" && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>🏆</span>
                  <span>Online Mock Tests & Test Series</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Take full-length timed mock tests with instant score evaluation and negative marking.
                </p>
              </div>

              {mockTests.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <span className="text-3xl">🏆</span>
                  <p className="text-sm font-semibold text-slate-700 mt-2">Mock test papers for this exam are being scheduled.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockTests.map((t) => (
                    <div key={t.id} className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold uppercase border border-purple-200">
                            {t.testType?.replace("_", " ") || "Full Length"}
                          </span>
                          <span className="text-xs font-bold text-emerald-700">Free Practice</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-2">{t.title}</h4>
                        <div className="grid grid-cols-3 gap-2 mt-3 p-2 bg-slate-50 rounded-xl text-center text-xs">
                          <div>
                            <span className="font-bold text-slate-800">{t.durationMinutes}m</span>
                            <div className="text-[10px] text-slate-400">Duration</div>
                          </div>
                          <div>
                            <span className="font-bold text-slate-800">{t.totalMarks}</span>
                            <div className="text-[10px] text-slate-400">Marks</div>
                          </div>
                          <div>
                            <span className="font-bold text-slate-800">{t.totalQuestions || 0}</span>
                            <div className="text-[10px] text-slate-400">Questions</div>
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/tests/${t.slug || t.id}`}
                        className="mt-4 w-full py-2.5 text-center bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                      >
                        Start Mock Test 🚀
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SCHEME & OVERVIEW */}
          {activeTab === "overview" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">About {exam.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                  {exam.description || "The examination is conducted by the Rajasthan state selection commission to recruit eligible candidates for state government cadres."}
                </p>
              </div>

              {exam.eligibility && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900">Eligibility & Qualification</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
                    {exam.eligibility}
                  </p>
                </div>
              )}

              {exam.applicationInfo && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900">Application & Selection Procedure</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
                    {exam.applicationInfo}
                  </p>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      <Footer />
    </div>
  );
}
