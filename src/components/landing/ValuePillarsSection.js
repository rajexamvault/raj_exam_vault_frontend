"use client";

export default function ValuePillarsSection() {
  const pillars = [
    {
      icon: "🗂️",
      title: "Exam-first organization",
      desc: "Every resource tagged by exam, stage and year. No generic bundles or cluttered directories."
    },
    {
      icon: "🌐",
      title: "Learn in your language",
      desc: "Full bilingual support. Access question papers, notes, and interfaces in both Hindi and English."
    },
    {
      icon: "👁️",
      title: "Know before you choose",
      desc: "Instant PDF previews, questions breakdown, and verified answer keys before downloading."
    },
    {
      icon: "🔖",
      title: "Your personal study shelf",
      desc: "Save papers to your vault, bookmark tough questions, and track your revision timeline seamlessly."
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-extrabold text-[#6366F1] tracking-widest uppercase block">
            MADE FOR THE WAY YOU PREPARE
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything in its place. Nothing you don&apos;t need.
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Built from the ground up for Rajasthan competitive exam aspirants.
          </p>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#F8FAFC] rounded-3xl p-6 border border-slate-200/80 hover:border-indigo-300 hover:bg-white hover:shadow-lg transition-all space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-2xl">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
