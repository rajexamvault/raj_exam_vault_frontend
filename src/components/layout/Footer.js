"use client";

import Link from "next/link";
import { ShieldIcon } from "@/components/common/Icons";

export default function Footer() {
  const examsList = [
    "RPSC",
    "RSSB / RSMSSB",
    "REET",
    "CET",
    "Rajasthan Police",
    "Patwari",
    "LDC",
    "VDO",
    "All Exams",
  ];

  const quickLinks = [
    "PYQ Centre",
    "Free PYQs",
    "Subjects",
    "About Us",
    "Contact Us",
    "FAQs",
  ];

  const subjectsList = [
    "Rajasthan GK",
    "History",
    "Geography",
    "Polity",
    "Hindi",
    "English",
    "Maths",
    "Science",
    "Reasoning",
  ];

  const policiesList = [
    "Privacy Policy",
    "Terms & Conditions",
    "Refund Policy",
    "Cancellation Policy",
  ];

  return (
    <footer className="bg-[#0a1a3a] text-slate-300 pt-12 pb-8 border-t border-[#122b5e]">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14">
        
        {/* Main 6-Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 pb-10 border-b border-slate-700/60">
          
          {/* Column 1: Brand & Socials */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 inline-flex">
              {/* Shield Emblem */}
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
                  <path
                    d="M24 4L7 11V22C7 33.2 14.3 43.4 24 46C33.7 43.4 41 33.2 41 22V11L24 4Z"
                    fill="#0f224a"
                    stroke="#ef4444"
                    strokeWidth="2"
                  />
                  <path
                    d="M24 8L11 13.5V22.5C11 31.8 16.5 40 24 42.2C31.5 40 37 31.8 37 22.5V13.5L24 8Z"
                    fill="#1e3a8a"
                    stroke="#f87171"
                    strokeWidth="1"
                  />
                </svg>
                <span className="absolute text-white font-black text-sm tracking-tight">
                  R
                </span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1 leading-none">
                  <span className="text-white font-black text-base tracking-wider">
                    RAJ EXAM
                  </span>
                </div>
                <span className="text-[#ef4444] font-black text-xs tracking-wider leading-none mt-0.5">
                  VAULT
                </span>
              </div>
            </Link>

            <p className="text-slate-400 text-xs leading-relaxed max-w-xs font-normal">
              Rajasthan Exams Ki PYQ Preparation, Ab Ek Jagah.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-1">
              {["fb", "insta", "tg", "tw", "yt"].map((social) => (
                <button
                  key={social}
                  className="w-7 h-7 rounded-full bg-slate-800 hover:bg-[#d32f2f] text-slate-300 hover:text-white flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer"
                  title={social}
                >
                  {social === "fb" && "f"}
                  {social === "insta" && "📷"}
                  {social === "tg" && "✈"}
                  {social === "tw" && "𝕏"}
                  {social === "yt" && "▶"}
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Exams */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white tracking-wider">
              Exams
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {examsList.map((exam) => (
                <li key={exam}>
                  <Link href="/exams" className="hover:text-white transition-colors">
                    {exam}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><Link href="/materials" className="hover:text-white transition-colors">PYQ Centre</Link></li>
              <li><Link href="/materials?isFree=true" className="hover:text-white transition-colors">Free PYQs</Link></li>
              <li><Link href="/tests" className="hover:text-white transition-colors">Mock Tests</Link></li>
              <li><Link href="/current-affairs" className="hover:text-white transition-colors">Current Affairs</Link></li>
              <li><Link href="/search" className="hover:text-white transition-colors">Vault Search</Link></li>
              <li><Link href="/exams" className="hover:text-white transition-colors">Exam Directory</Link></li>
            </ul>
          </div>

          {/* Column 4: Subjects */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white tracking-wider">
              Subjects
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {subjectsList.map((sub) => (
                <li key={sub}>
                  <Link href={`/search?q=${encodeURIComponent(sub)}`} className="hover:text-white transition-colors">
                    {sub}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Policies & Contact */}
          <div className="col-span-2 md:col-span-1 space-y-5">
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-white tracking-wider">
                Policies
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {policiesList.map((policy) => (
                  <li key={policy}>
                    <a href="#" className="hover:text-white transition-colors">
                      {policy}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-700/50">
              <h4 className="text-xs font-bold text-white tracking-wider">
                Contact Us
              </h4>
              <div className="text-[11px] text-slate-400 space-y-1">
                <p>📞 +91 1234567890</p>
                <p>✉️ support@rajexamvault.in</p>
                <p>🕒 Mon - Sat: 9AM - 7PM</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2024 Raj Exam Vault. All Rights Reserved.</p>
          
          {/* Payment Method Badges */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white text-slate-900 font-bold text-[10px] tracking-wider">
              UPI
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-black text-[10px] tracking-wider">
              VISA
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-black text-[10px] tracking-wider">
              Mastercard
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-700 text-white font-black text-[10px] tracking-wider">
              RuPay
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
