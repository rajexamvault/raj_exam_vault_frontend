"use client";

import { useState } from "react";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "What exams are covered in the Raj Exam Vault?",
      a: "Raj Exam Vault comprehensively covers RPSC RAS (Prelims & Mains), REET (Level 1 & Level 2), Rajasthan CET (Graduate & 12th Level), Rajasthan Police (Sub Inspector & Constable), Patwar, VDO (Gram Vikas Adhikari), 1st Grade & 2nd Grade School Teachers, and upcoming competitive state examinations."
    },
    {
      q: "Are the PYQs and question papers authentic?",
      a: "Yes, 100%. All Previous Year Question Papers (PYQs) are curated directly from official RPSC and RSSB/RSMSSB examination archives, accompanied by verified official master answer keys."
    },
    {
      q: "Are the study materials free to access and download?",
      a: "We believe quality preparation must be accessible. A vast repository of previous-year papers, syllabus breakdowns, and fundamental notes are completely free to view and download. Specialized handwritten topper compendiums and live mock series are also available."
    },
    {
      q: "Is the platform available in both Hindi and English?",
      a: "Yes. Given the state's examination demographics, our mock test simulators, question banks, and notes support full bilingual (Hindi + English) learning."
    },
    {
      q: "How does the Mock Test series work?",
      a: "Our CBT (Computer-Based Test) simulator mimics actual exam timings, negative marking schemes, and question palettes. Once completed, you receive instant scorecards, state-level rank estimates, and question-by-question explanations."
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          <span className="text-xs font-extrabold text-[#6366F1] tracking-widest uppercase block">
            A LITTLE CLARITY BEFORE YOU START
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Everything you need to know about our vault and study materials.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className={`text-lg text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180 text-indigo-600" : ""}`}>
                    ▾
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
