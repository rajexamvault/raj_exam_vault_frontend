"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import currentAffairService from "@/services/currentAffairService";

export default function CurrentAffairsSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticles() {
      try {
        setLoading(true);
        const res = await currentAffairService.getAllCurrentAffairs({
          limit: 6,
          status: "published"
        });
        const list = res?.data?.currentAffairs || res?.currentAffairs || (Array.isArray(res?.data) ? res.data : []);
        setArticles(Array.isArray(list) ? list : []);
      } catch (e) {
        console.warn("Could not load real current affairs in landing section:", e);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }
    loadArticles();
  }, []);

  const featured = articles.find((a) => a.isFeatured) || articles[0];
  const listItems = articles.filter((a) => a.id !== featured?.id).slice(0, 4);

  return (
    <section className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-[#6366F1] tracking-widest uppercase block">
              STAY CURRENT. REVISE REGULARLY.
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              A month of news. Ready for revision.
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Current affairs and GK updates filtered directly from the database.
            </p>
          </div>

          <Link
            href="/current-affairs"
            className="self-start md:self-auto px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-xs flex items-center gap-1.5 transition-all"
          >
            <span>All current affairs</span>
            <span>→</span>
          </Link>
        </div>

        {/* Real Articles View */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-7 border border-slate-200 h-64 animate-pulse" />
            <div className="bg-white rounded-3xl p-7 border border-slate-200 h-64 animate-pulse" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <span className="text-3xl block mb-2">📰</span>
            <h3 className="text-base font-bold text-slate-800">No current affairs articles published yet</h3>
            <p className="text-xs text-slate-400 mt-1">Articles published in the Admin Panel will be shown here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Featured Article (Left) */}
            {featured && (
              <div className="lg:col-span-6 bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 uppercase tracking-wider">
                      {featured.category || "STATE SPECIAL"}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {featured.date ? new Date(featured.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                    {featured.title}
                  </h3>
                  {featured.summary && (
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">
                      {featured.summary}
                    </p>
                  )}

                  {featured.tags && Array.isArray(featured.tags) && featured.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-5">
                      {featured.tags.slice(0, 4).map((tag, tIdx) => (
                        <span key={tIdx} className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-semibold text-slate-600">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600">
                    ✓ Verified GK Content
                  </span>
                  <Link
                    href={`/current-affairs/${featured.slug || featured.id}`}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-600 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <span>Read Article</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            )}

            {/* List Archive (Right) */}
            <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
              {listItems.length > 0 ? (
                listItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/current-affairs/${item.slug || item.id}`}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                        <span className="text-indigo-600 font-bold">{item.category || "General"}</span>
                        <span>•</span>
                        <span>{item.date ? new Date(item.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Recent"}</span>
                      </div>
                    </div>

                    <div className="w-9 h-9 rounded-xl bg-slate-50 group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600 flex items-center justify-center font-bold text-base transition-colors shrink-0">
                      →
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-400">
                  More articles will appear as they are published.
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
