"use client";

import Image from "next/image";

export default function AuthHero() {
  return (
    <div className="relative w-full h-full min-h-0 flex flex-col justify-between overflow-hidden pr-2 select-none">
      {/* Background subtle ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 right-10 w-[380px] h-[380px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Top: Logo & Platform Identity */}
      <div className="flex items-center gap-3 pt-1">
        {/* Shield Logo with R */}
        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
          <svg className="w-12 h-12 drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]" viewBox="0 0 48 48" fill="none">
            <path
              d="M24 4L7 11V22C7 33.2 14.3 43.4 24 46C33.7 43.4 41 33.2 41 22V11L24 4Z"
              fill="url(#shieldGrad)"
              stroke="#e11d48"
              strokeWidth="1.8"
            />
            <path
              d="M24 7.5L10.5 13.5V22.5C10.5 31.8 16.3 40.2 24 42.5C31.7 40.2 37.5 31.8 37.5 22.5V13.5L24 7.5Z"
              stroke="#fb7185"
              strokeWidth="1"
              opacity="0.7"
            />
            <defs>
              <linearGradient id="shieldGrad" x1="7" y1="4" x2="41" y2="46" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4c0519" />
                <stop offset="0.5" stopColor="#2e1065" />
                <stop offset="1" stopColor="#0f172a" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute text-white font-black text-xl tracking-tight drop-shadow">
            R
          </span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-white font-black text-lg tracking-wider leading-tight">
              RAJ EXAM
            </span>
          </div>
          <span className="text-[#f97316] font-black text-lg tracking-wider leading-tight -mt-1">
            VAULT
          </span>
          <p className="text-slate-400 text-[11px] font-medium leading-tight mt-0.5">
            Your PYQ Vault for Rajasthan Exams
          </p>
        </div>
      </div>

      {/* Main Headline & Description */}
      <div className="mt-1 xl:mt-2">
        <h2 className="text-white text-[28px] xl:text-[34px] font-black leading-[1.18] tracking-tight">
          Smart Preparation<br />
          Starts with<br />
          <span className="bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#818cf8] bg-clip-text text-transparent">
            Right Resources.
          </span>
        </h2>
        <p className="text-slate-300/90 text-xs leading-relaxed max-w-sm font-normal mt-2">
          Access Previous Year Question Papers, Study Material &amp; Free PDFs for
          Rajasthan Government Exams – All in One Place.
        </p>
      </div>

      {/* 3D Hero Illustration */}
      <div className="flex-1 min-h-0 flex items-center justify-center my-1">
        <div className="relative w-full max-w-[380px] xl:max-w-[420px] h-full max-h-[250px] xl:max-h-[280px] flex items-center justify-center">
          <Image
            src="/hero-illustration.jpg"
            alt="Raj Exam Vault 3D PYQ Vault & Study Material"
            width={500}
            height={500}
            className="w-auto h-full max-h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] rounded-2xl"
            priority
          />
        </div>
      </div>

      {/* Bottom: 4 Translucent Feature Badges */}
      <div className="grid grid-cols-4 gap-2 xl:gap-2.5 pb-1">
        {/* Badge 1: 100% Authentic */}
        <div className="bg-[#0b142c]/90 border border-blue-500/25 backdrop-blur-md rounded-2xl p-2 xl:p-2.5 flex flex-col items-center text-center justify-center gap-1 shadow-lg hover:border-blue-400/50 transition-all">
          <div className="w-7 h-7 rounded-xl bg-blue-950/90 border border-blue-500/40 flex items-center justify-center shadow-inner">
            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-white text-[10.5px] font-bold leading-tight">
            100% Authentic
          </p>
          <p className="text-slate-400 text-[9px] leading-tight">
            Original PYQs
          </p>
        </div>

        {/* Badge 2: Instant Access */}
        <div className="bg-[#0b142c]/90 border border-blue-500/25 backdrop-blur-md rounded-2xl p-2 xl:p-2.5 flex flex-col items-center text-center justify-center gap-1 shadow-lg hover:border-cyan-400/50 transition-all">
          <div className="w-7 h-7 rounded-xl bg-cyan-950/90 border border-cyan-500/40 flex items-center justify-center shadow-inner">
            <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <p className="text-white text-[10.5px] font-bold leading-tight">
            Instant Access
          </p>
          <p className="text-slate-400 text-[9px] leading-tight">
            After Purchase
          </p>
        </div>

        {/* Badge 3: Affordable Prices */}
        <div className="bg-[#0b142c]/90 border border-blue-500/25 backdrop-blur-md rounded-2xl p-2 xl:p-2.5 flex flex-col items-center text-center justify-center gap-1 shadow-lg hover:border-amber-400/50 transition-all">
          <div className="w-7 h-7 rounded-xl bg-amber-950/90 border border-amber-500/40 flex items-center justify-center shadow-inner">
            <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <p className="text-white text-[10.5px] font-bold leading-tight">
            Affordable Prices
          </p>
          <p className="text-slate-400 text-[9px] leading-tight">
            Best Value
          </p>
        </div>

        {/* Badge 4: Trusted by */}
        <div className="bg-[#0b142c]/90 border border-blue-500/25 backdrop-blur-md rounded-2xl p-2 xl:p-2.5 flex flex-col items-center text-center justify-center gap-1 shadow-lg hover:border-emerald-400/50 transition-all">
          <div className="w-7 h-7 rounded-xl bg-emerald-950/90 border border-emerald-500/40 flex items-center justify-center shadow-inner">
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-white text-[10.5px] font-bold leading-tight">
            Trusted by
          </p>
          <p className="text-slate-400 text-[9px] leading-tight">
            Thousands of Students
          </p>
        </div>
      </div>
    </div>
  );
}

