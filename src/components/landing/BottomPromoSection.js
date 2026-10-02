"use client";

import { useState } from "react";
import Link from "next/link";
import { StarIcon, GraduationCapIcon, BookOpenIcon, ArrowRightIcon } from "@/components/common/Icons";

export default function BottomPromoSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  const testimonials = [
    {
      quote: "Raj Exam Vault se mujhe sabhi exams ke PYQs ek jagah mil gaye. Quality best hai aur price bhi affordable!",
      name: "Priya Sharma",
      role: "REET Qualified",
      rating: 5,
    },
    {
      quote: "RPSC RAS ke previous 10 saal ke papers with verified keys ne meri revision speed 2x kar di.",
      name: "Rameshwar Gurjar",
      role: "RAS Aspirant",
      rating: 5,
    },
    {
      quote: "Police Constable shift papers bohot acche format mein hain. Mobile pe padhna bohot aasan hai.",
      name: "Amit Choudhary",
      role: "Police Selected",
      rating: 5,
    },
  ];

  return (
    <section className="py-6 bg-[#f8fafc]">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Card: What Students Say (4 cols on lg) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
            <div>
              {/* Header with quote mark */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl font-serif text-[#0f224a] leading-none">“</span>
                <span className="text-xs font-bold text-slate-800">What Students Say</span>
              </div>

              {/* Review Text */}
              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-normal mb-4">
                {testimonials[activeSlide].quote}
              </p>

              {/* 5 Stars */}
              <div className="flex text-amber-400 mb-2">
                {[...Array(testimonials[activeSlide].rating)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>

              {/* Author */}
              <p className="text-xs text-slate-500 font-medium">
                – <strong className="text-slate-800">{testimonials[activeSlide].name}</strong>, {testimonials[activeSlide].role}
              </p>
            </div>

            {/* Slide Indicator Dots */}
            <div className="flex items-center gap-1.5 pt-4 mt-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    activeSlide === i ? "w-5 bg-[#0f224a]" : "bg-slate-300"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Wide Banner: Ready to Crack Your Dream Exam? (8 cols on lg) */}
          <div className="lg:col-span-8 rounded-2xl bg-[#0a235c] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
            
            {/* Background Light Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Left Content */}
            <div className="space-y-2 text-center sm:text-left z-10">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                Ready to Crack Your Dream Exam?
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm font-normal max-w-md">
                Download high-quality PYQs and boost your preparation.
              </p>
              <div className="pt-2">
                <Link
                  href="/materials"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <span>Browse PYQs Now</span>
                </Link>
              </div>
            </div>

            {/* Right Graphic: 3D Graduation Cap & Stacked Books */}
            <div className="relative shrink-0 flex items-center justify-center">
              <div className="w-36 sm:w-44 h-28 sm:h-32 relative flex items-center justify-center">
                {/* 3D Cap & Books SVG Composite */}
                <div className="relative flex flex-col items-center">
                  {/* Cap */}
                  <div className="w-20 h-10 bg-slate-900 border-2 border-slate-700 rounded-sm shadow-xl relative -mb-2 z-10 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="absolute top-4 right-1 w-0.5 h-6 bg-amber-400" />
                  </div>
                  {/* Stacked Hardcover Books */}
                  <div className="w-32 h-6 bg-red-700 rounded-md border border-red-500 shadow-md -mb-1 flex items-center px-2">
                    <div className="w-full h-1 bg-white/30 rounded-full" />
                  </div>
                  <div className="w-36 h-7 bg-blue-700 rounded-md border border-blue-500 shadow-lg -mb-1 flex items-center px-2">
                    <div className="w-full h-1 bg-white/30 rounded-full" />
                  </div>
                  <div className="w-40 h-8 bg-slate-800 rounded-md border border-slate-600 shadow-xl flex items-center px-2">
                    <div className="w-full h-1 bg-white/30 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
