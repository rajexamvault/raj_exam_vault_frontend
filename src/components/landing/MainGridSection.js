"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import examService from "@/services/examService";
import { 
  StarIcon, 
  DownloadIcon, 
  ChevronRightIcon, 
  CheckCircleIcon, 
  FileTextIcon, 
  EyeIcon 
} from "@/components/common/Icons";

export default function MainGridSection({ onOpenPreview }) {
  const [cartSuccess, setCartSuccess] = useState("");
  const [liveExams, setLiveExams] = useState([]);
  const [liveMaterials, setLiveMaterials] = useState([]);

  useEffect(() => {
    async function loadLiveData() {
      try {
        const [examsRes, materialsRes] = await Promise.all([
          examService.getExams({ limit: 8, status: "active" }).catch(() => null),
          examService.getMaterials({ limit: 4, status: "published" }).catch(() => null)
        ]);

        const examsList = examsRes?.data?.exams || examsRes?.exams || (Array.isArray(examsRes?.data) ? examsRes.data : []);
        if (examsList.length > 0) {
          setLiveExams(examsList);
        }
        const materialsList = materialsRes?.data?.materials || materialsRes?.materials || (Array.isArray(materialsRes?.data) ? materialsRes.data : []);
        if (materialsList.length > 0) {
          setLiveMaterials(materialsList);
        }
      } catch (err) {
        console.warn("Home grid live data notice:", err.message);
      }
    }
    loadLiveData();
  }, []);

  const defaultPopularExams = [
    { name: "RPSC", count: "12,450+ PYQs", bg: "bg-rose-50 text-rose-600 border-rose-200", icon: "🏛️", slug: "rpsc-ras" },
    { name: "RSSB / RSMSSB", count: "18,230+ PYQs", bg: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: "📋", slug: "rsmssb-patwari" },
    { name: "REET", count: "8,750+ PYQs", bg: "bg-amber-50 text-amber-600 border-amber-200", icon: "🎓", slug: "reet-level-2" },
    { name: "CET (12th & Grad)", count: "9,680+ PYQs", bg: "bg-blue-50 text-blue-600 border-blue-200", icon: "📝", slug: "cet-graduation" },
    { name: "Rajasthan Police", count: "6,540+ PYQs", bg: "bg-red-50 text-red-600 border-red-200", icon: "👮", slug: "raj-police-constable" },
    { name: "Patwari", count: "7,890+ PYQs", bg: "bg-orange-50 text-orange-600 border-orange-200", icon: "🗺️", slug: "rsmssb-patwari" },
    { name: "LDC", count: "4,320+ PYQs", bg: "bg-cyan-50 text-cyan-600 border-cyan-200", icon: "📂", slug: "rsmssb-ldc" },
    { name: "VDO", count: "3,210+ PYQs", bg: "bg-indigo-50 text-indigo-600 border-indigo-200", icon: "🏡", slug: "rsmssb-vdo" },
  ];

  const popularExams = liveExams.length > 0
    ? liveExams.map((ex, idx) => {
        const colors = [
          "bg-rose-50 text-rose-600 border-rose-200",
          "bg-emerald-50 text-emerald-600 border-emerald-200",
          "bg-amber-50 text-amber-600 border-amber-200",
          "bg-blue-50 text-blue-600 border-blue-200",
          "bg-red-50 text-red-600 border-red-200",
          "bg-orange-50 text-orange-600 border-orange-200",
          "bg-cyan-50 text-cyan-600 border-cyan-200",
          "bg-indigo-50 text-indigo-600 border-indigo-200"
        ];
        return {
          name: ex.shortName || ex.title || ex.name,
          count: `${ex.stats?.totalMaterials || 0} Materials`,
          bg: colors[idx % colors.length],
          icon: ex.icon || "🏛️",
          slug: ex.slug
        };
      })
    : defaultPopularExams;

  const bestSellerBooks = [
    {
      id: "raj-gk",
      title: "Rajasthan GK",
      subtitle: "PYQ (2020-2026)",
      coverTheme: "from-[#0f382c] to-[#08221a]",
      accentBorder: "border-[#156049]",
      questions: "500+ Questions",
      rating: 5,
      reviews: 256,
      price: 49,
      originalPrice: 99,
      category: "Rajasthan GK",
    },
    {
      id: "raj-history",
      title: "Raj. History",
      subtitle: "PYQ (2019-2026)",
      coverTheme: "from-[#4a121a] to-[#2b080d]",
      accentBorder: "border-[#822432]",
      questions: "450+ Questions",
      rating: 5,
      reviews: 189,
      price: 49,
      originalPrice: 99,
      category: "Rajasthan History",
    },
    {
      id: "maths",
      title: "Maths",
      subtitle: "PYQ (2020-2026)",
      coverTheme: "from-[#0e3347] to-[#071c28]",
      accentBorder: "border-[#185575]",
      questions: "600+ Questions",
      rating: 5,
      reviews: 312,
      price: 59,
      originalPrice: 129,
      category: "Mathematics",
    },
    {
      id: "reasoning",
      title: "Reasoning",
      subtitle: "PYQ (2020-2026)",
      coverTheme: "from-[#522019] to-[#30110c]",
      accentBorder: "border-[#8a382c]",
      questions: "500+ Questions",
      rating: 5,
      reviews: 201,
      price: 49,
      originalPrice: 99,
      category: "Reasoning & Mental Ability",
    },
  ];

  const freeResources = [
    {
      id: "free-1",
      title: "Rajasthan GK",
      subtitle: "50 Free PYQs",
      category: "Free GK Mock",
    },
    {
      id: "free-2",
      title: "REET Hindi",
      subtitle: "25 Free PYQs",
      category: "Free REET Mock",
    },
    {
      id: "free-3",
      title: "CET Maths",
      subtitle: "50 Free PYQs",
      category: "Free CET Mock",
    },
  ];

  const handleAddToCart = (book) => {
    setCartSuccess(`Added "${book.title} PYQ" to cart!`);
    setTimeout(() => setCartSuccess(""), 3000);
  };

  return (
    <section id="pyq-centre" className="py-10 bg-[#f8fafc]">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14">
        
        {cartSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in-up">
            <span>✓ {cartSuccess}</span>
            <span className="text-[10px] text-emerald-600">Checkout in top navbar</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Column 1: Popular Exams (Left Card) */}
          <div className="lg:col-span-12 xl:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="text-[#0f224a] font-bold text-sm">Popular Exams</h3>
                  <Link href="/exams" className="text-xs font-bold text-[#0f224a] hover:text-[#d32f2f]">
                    View All
                  </Link>
                </div>

                {/* 4x2 Grid of Exam Badges on mobile/tablet */}
                <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-2.5 sm:gap-3">
                  {popularExams.map((exam) => (
                    <Link
                      key={exam.name}
                      href={exam.slug ? `/exams/${exam.slug}` : "/exams"}
                      className="p-2.5 sm:p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-xs bg-slate-50/60 hover:bg-white transition-all flex flex-col items-center text-center cursor-pointer group"
                    >
                      <div className={`w-9 sm:w-10 h-9 sm:h-10 rounded-xl border flex items-center justify-center text-base sm:text-lg mb-1.5 sm:mb-2 ${exam.bg} transition-transform group-hover:scale-105`}>
                        {exam.icon}
                      </div>
                      <h4 className="text-slate-900 font-bold text-[11.5px] sm:text-xs leading-tight group-hover:text-[#0f224a] truncate w-full">
                        {exam.name}
                      </h4>
                      <span className="text-[9.5px] sm:text-[10px] text-slate-500 font-medium mt-0.5 truncate w-full">
                        {exam.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Popular PYQs (Best Sellers) (Center Card) */}
          <div className="lg:col-span-12 xl:col-span-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="text-[#0f224a] font-bold text-sm">
                    Popular PYQs <span className="text-[#d32f2f]">(Best Sellers)</span>
                  </h3>
                  <Link href="/materials" className="text-xs font-bold text-[#0f224a] hover:text-[#d32f2f]">
                    View All
                  </Link>
                </div>

                {/* Book Mockups Grid: 1 col on xs, 2 on sm, 4 on xl */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-3.5">
                  {bestSellerBooks.map((book) => (
                    <div
                      key={book.id}
                      className="flex flex-col justify-between bg-white rounded-xl border border-slate-200/90 p-2.5 shadow-2xs hover:shadow-md transition-all group"
                    >
                      {/* Realistic Hardcover Book Spine Mockup */}
                      <div className={`w-full aspect-[3/4] max-w-[200px] mx-auto rounded-lg bg-gradient-to-b ${book.coverTheme} border ${book.accentBorder} p-3 flex flex-col justify-between text-white text-center shadow-inner relative overflow-hidden mb-2.5`}>
                        
                        {/* Book Spine Line */}
                        <div className="absolute top-0 bottom-0 left-1.5 w-1 bg-white/10 rounded-full" />
                        
                        <div className="pt-2">
                          <span className="text-[8.5px] tracking-widest text-slate-300 font-extrabold uppercase block">
                            RAJASTHAN
                          </span>
                          <h4 className="font-black text-xs sm:text-sm tracking-tight leading-tight mt-0.5">
                            {book.title}
                          </h4>
                          <span className="text-[10px] font-black tracking-wider text-amber-300 block mt-1">
                            PYQ
                          </span>
                        </div>

                        <div className="pb-1">
                          <span className="text-[8px] font-mono text-slate-300 block">
                            {book.subtitle.replace("PYQ ", "")}
                          </span>
                          <div className="w-6 h-0.5 bg-amber-400 mx-auto mt-1 rounded-full" />
                        </div>
                      </div>

                      {/* Info & Price */}
                      <div className="space-y-1 text-center">
                        <h5 className="font-bold text-slate-900 text-xs truncate">
                          {book.title}
                        </h5>
                        <p className="text-[10px] text-slate-500 font-medium truncate">
                          {book.subtitle}
                        </p>
                        <span className="text-[9.5px] text-slate-500 block">
                          {book.questions}
                        </span>

                        {/* Star Rating */}
                        <div className="flex items-center justify-center gap-1 text-amber-400 text-[10px] font-bold">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon key={i} className="w-3 h-3 fill-amber-400" />
                            ))}
                          </div>
                          <span className="text-slate-400">({book.reviews})</span>
                        </div>

                        {/* Price */}
                        <div className="pt-1 flex items-baseline justify-center gap-1.5">
                          <span className="text-sm font-black text-[#d32f2f]">₹{book.price}</span>
                          <span className="text-[10px] text-slate-400 line-through">₹{book.originalPrice}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleAddToCart(book)}
                          className="py-1.5 px-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] transition-colors cursor-pointer text-center"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => {
                            if (onOpenPreview) {
                              onOpenPreview({
                                title: `${book.title} ${book.subtitle}`,
                                category: book.category,
                                price: book.price,
                                originalPrice: book.originalPrice,
                                questions: book.questions,
                                papers: "10-Year Solved Shift Papers",
                              });
                            }
                          }}
                          className="py-1.5 px-1 rounded-md bg-[#0f224a] hover:bg-[#162c5b] text-white font-bold text-[10px] transition-colors cursor-pointer text-center"
                        >
                          Buy Now
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Start Preparing For Free (Right Card) */}
          <div className="lg:col-span-12 xl:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 h-full flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="text-[#0f224a] font-bold text-sm">Start Preparing For Free</h3>
                  <Link href="/materials?isFree=true" className="text-xs font-bold text-[#0f224a] hover:text-[#d32f2f]">
                    View All
                  </Link>
                </div>

                {/* Free Resource Rows */}
                <div className="space-y-2.5 sm:space-y-3">
                  {freeResources.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 sm:p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between gap-2.5 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-1.5 py-0.5 rounded text-[8.5px] sm:text-[9px] font-black bg-[#d32f2f] text-white shrink-0">
                          FREE
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-slate-900 font-bold text-[11.5px] sm:text-xs truncate">
                            {item.title}
                          </h4>
                          <p className="text-[9.5px] sm:text-[10px] text-slate-500 truncate">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/materials?isFree=true"
                        className="py-1.5 px-2 sm:px-2.5 rounded-lg border border-[#0f224a] text-[#0f224a] hover:bg-[#0f224a] hover:text-white font-bold text-[9.5px] sm:text-[10px] transition-colors shrink-0 cursor-pointer text-center"
                      >
                        Download PDF
                      </Link>
                    </div>
                  ))}
                </div>
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
