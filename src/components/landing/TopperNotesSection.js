"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import examService from "@/services/examService";

export default function TopperNotesSection({ onOpenPreview }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotes() {
      try {
        setLoading(true);
        const res = await examService.getMaterials({
          materialType: "notes",
          limit: 6
        });
        const list = res?.data?.materials || res?.materials || (Array.isArray(res?.data) ? res.data : []);
        setNotes(Array.isArray(list) ? list : []);
      } catch (e) {
        console.warn("Could not load real notes in landing section:", e);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    }
    loadNotes();
  }, []);

  return (
    <section className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-[#6366F1] tracking-widest uppercase block">
              THE NOTEBOOK COLLECTION
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              A topper’s perspective. Your revision edge.
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Handwritten notes and study compendiums from the database.
            </p>
          </div>

          <Link
            href="/materials?materialType=notes"
            className="self-start md:self-auto px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-xs flex items-center gap-1.5 transition-all"
          >
            <span>View all notes</span>
            <span>→</span>
          </Link>
        </div>

        {/* Real Notes Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-6 border border-slate-200 h-64 animate-pulse" />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <span className="text-3xl block mb-2">📝</span>
            <h3 className="text-base font-bold text-slate-800">No study notes found in database</h3>
            <p className="text-xs text-slate-400 mt-1">Uploaded topper notes and study materials will be listed here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badge & Exam */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-slate-900 text-white uppercase tracking-wider">
                      {note.isFree ? "FREE NOTES" : "PRO NOTES"}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {note.Exam?.shortName || note.Exam?.title || "Exam Notes"}
                    </span>
                  </div>

                  {/* Thumbnail cover or icon card */}
                  <div className="w-full h-36 rounded-2xl bg-gradient-to-br from-indigo-50 to-rose-50 border border-slate-100 flex flex-col items-center justify-center p-4 text-center mb-5 group-hover:scale-[1.02] transition-transform">
                    <span className="text-3xl mb-1">📝</span>
                    <span className="text-xs font-bold text-slate-700 truncate max-w-full">
                      {note.Subject?.name || note.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium mt-1">
                      {note.pageCount ? `${note.pageCount} Pages` : "PDF Notes"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {note.title}
                  </h3>
                  {note.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {note.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onOpenPreview && onOpenPreview(note)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    Preview Notes →
                  </button>

                  {note.fileUrl ? (
                    <a
                      href={note.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 font-bold text-xs transition-all"
                    >
                      Download
                    </a>
                  ) : (
                    <button
                      onClick={() => onOpenPreview && onOpenPreview(note)}
                      className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 font-bold text-xs transition-all cursor-pointer"
                    >
                      View
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
