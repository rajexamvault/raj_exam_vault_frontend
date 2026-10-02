"use client";

import { StarIcon, ShieldIcon, CheckCircleIcon, SparklesIcon } from "@/components/common/Icons";

export default function TestimonialsSection() {
  const testimonials = [
    {
      id: "1",
      name: "Rameshwar Gurjar",
      location: "Jaipur, Rajasthan",
      exam: "Cleared RPSC RAS Prelims (Rank 48)",
      avatar: "RG",
      avatarGradient: "from-rose-500 to-indigo-600",
      rating: 5,
      date: "2 months ago",
      text: "Raj Exam Vault saved me at least 50 hours of searching for verified RPSC question papers. The fact that deleted questions are clearly flagged with revised keys is a game-changer for serious aspirants.",
    },
    {
      id: "2",
      name: "Pooja Sharma",
      location: "Jodhpur, Rajasthan",
      exam: "Selected in REET Level-2 (134/150)",
      avatar: "PS",
      avatarGradient: "from-blue-500 to-cyan-500",
      rating: 5,
      date: "1 month ago",
      text: "The REET Pedagogy and Subject archives are brilliantly organized. The PDFs print so cleanly without annoying dark watermarks. Best ₹99 I ever spent on my teaching exam preparation!",
    },
    {
      id: "3",
      name: "Amit Choudhary",
      location: "Bikaner, Rajasthan",
      exam: "Cleared Rajasthan Police SI",
      avatar: "AC",
      avatarGradient: "from-amber-500 to-rose-500",
      rating: 5,
      date: "3 weeks ago",
      text: "For Sub-Inspector exam, solving shift-wise Hindi & GK papers gives 70% of the actual exam confidence. Instant download and zero spam. Highly recommended for every Rajasthan youth.",
    },
    {
      id: "4",
      name: "Sunita Meena",
      location: "Udaipur, Rajasthan",
      exam: "RSMSSB CET & Patwari Qualified",
      avatar: "SM",
      avatarGradient: "from-emerald-500 to-teal-500",
      rating: 5,
      date: "Just now",
      text: "I was confused by contradictory answer keys found on random websites. Raj Exam Vault provided 100% board-verified solutions that helped me pinpoint the exact exam trap questions.",
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-[#070d1e] relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-1/2 left-10 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase">
            <StarIcon className="w-4 h-4 fill-amber-400" />
            <span>Success Stories from Rajasthan</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Trusted by Over <span className="bg-gradient-to-r from-rose-400 via-orange-300 to-indigo-300 bg-clip-text text-transparent">50,000+ Aspirants</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base font-light">
            Read how authentic previous year papers from Raj Exam Vault helped students qualify in top state exams.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-[#0a122a]/95 border border-blue-500/20 hover:border-blue-400/50 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between group"
            >
              <div>
                {/* Rating Stars & Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {item.date}
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light mb-6 italic">
                  &ldquo;{item.text}&rdquo;
                </p>
              </div>

              {/* Author Profile */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${item.avatarGradient} flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0`}>
                  {item.avatar}
                </div>
                <div className="min-w-0">
                  <h4 className="text-white font-bold text-xs truncate">
                    {item.name}
                  </h4>
                  <p className="text-slate-400 text-[10px] truncate">
                    {item.location}
                  </p>
                  <span className="text-emerald-400 text-[9.5px] font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircleIcon className="w-3 h-3 shrink-0" />
                    <span className="truncate">{item.exam}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
