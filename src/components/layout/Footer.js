"use client";

import Link from "next/link";

export default function Footer() {
  const coursesList = [
    { name: "PSI Courses", href: "/exams/rajasthan-police-si" },
    { name: "RAS Courses", href: "/exams/ras-rts" },
    { name: "EO/RO Courses", href: "/exams" },
    { name: "1st Grade School Lecturer", href: "/exams" },
    { name: "2nd Grade Senior Teacher", href: "/exams" },
    { name: "Rajasthan GK Special", href: "/materials?search=Rajasthan+GK" },
    { name: "CET (Graduation & 12th)", href: "/exams/cet-graduation-level" },
    { name: "Patwar & VDO", href: "/exams" },
  ];

  const studyMaterialList = [
    { name: "Topper's Copy", href: "/materials" },
    { name: "Monthly Magazine", href: "/current-affairs" },
    { name: "Subjective Q&A", href: "/materials" },
    { name: "Current Affairs", href: "/current-affairs" },
    { name: "Notes & Free PDFs", href: "/materials?isFree=true" },
    { name: "Previous Year Papers (PYQs)", href: "/materials?materialType=pyq" },
    { name: "Mock Test Series", href: "/tests" },
  ];

  const primaryLinks = [
    { name: "Courses", href: "/exams" },
    { name: "Contact Us", href: "/search" },
    { name: "Our PYQ Vault", href: "/materials" },
    { name: "Test Series", href: "/tests" },
    { name: "RAS Special", href: "/exams/ras-rts" },
    { name: "Study Materials", href: "/materials" },
  ];

  return (
    <footer className="bg-[#070d1e] text-slate-300 pt-14 pb-8 border-t border-[#132347] relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-slate-800/80">
          
          {/* Column 1: Brand Info & Primary Links */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-2.5 inline-flex group">
              {/* Logo Emblem */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 via-red-600 to-indigo-700 flex items-center justify-center p-0.5 shadow-lg shadow-red-900/30 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#070d1e] rounded-[10px] flex items-center justify-center">
                  <span className="text-white font-black text-lg tracking-tighter bg-gradient-to-r from-red-400 to-rose-200 bg-clip-text text-transparent">
                    R
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-white font-black text-lg tracking-wider leading-none">
                  RAJ EXAM
                </span>
                <span className="text-rose-500 font-extrabold text-[11px] tracking-widest leading-none mt-1">
                  VAULT
                </span>
              </div>
            </Link>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Rajasthan&apos;s most trusted platform for RAS, UPSC, PSI, REET, CET, EO-RO &amp; competitive exam preparation.
            </p>

            {/* Quick Links List */}
            <ul className="space-y-2.5 pt-2">
              {primaryLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="text-xs text-slate-300 hover:text-white hover:translate-x-1 inline-block transition-all font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Courses */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white tracking-wider">
              Courses
            </h3>
            <ul className="space-y-3">
              {coursesList.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="text-xs text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all font-normal"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Study Material */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white tracking-wider">
              Study Material
            </h3>
            <ul className="space-y-3">
              {studyMaterialList.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="text-xs text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all font-normal"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white tracking-wider">
              Contact Us
            </h3>
            <div className="space-y-3.5 text-xs text-slate-300">
              {/* Location */}
              <div className="flex items-start gap-2.5">
                <span className="text-rose-500 shrink-0 text-sm">📍</span>
                <a
                  href="https://maps.google.com/?q=Jaipur,+Rajasthan"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-300 hover:text-white transition-colors leading-snug"
                >
                  Jaipur, Rajasthan, India
                </a>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2.5">
                <span className="text-rose-500 shrink-0 text-sm">📞</span>
                <a
                  href="tel:+919929580615"
                  className="text-slate-300 hover:text-rose-400 font-semibold transition-colors"
                >
                  +91 9929580615
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2.5">
                <span className="text-rose-500 shrink-0 text-sm">✉️</span>
                <a
                  href="mailto:rajexamvault@gmail.com"
                  className="text-slate-300 hover:text-rose-400 font-medium transition-colors break-all"
                >
                  rajexamvault@gmail.com
                </a>
              </div>
            </div>

            {/* Social Channels */}
            <div className="pt-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Join Community
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://t.me/raj_examvault"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-[#229ED9] text-slate-200 hover:text-white flex items-center gap-1.5 text-xs font-semibold shadow-xs transition-all hover:scale-105"
                  title="Telegram: @raj_examvault"
                >
                  <span>✈</span>
                  <span>Telegram</span>
                </a>
                <a
                  href="https://www.instagram.com/raj_examvault"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-amber-500 text-slate-200 hover:text-white flex items-center gap-1.5 text-xs font-semibold shadow-xs transition-all hover:scale-105"
                  title="Instagram: @raj_examvault"
                >
                  <span>📷</span>
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Policies */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-center sm:text-left">
            © 2026 Raj Exam Vault. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[11px] text-slate-400">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/disclaimer" className="hover:text-white transition-colors">
              Disclaimer
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
