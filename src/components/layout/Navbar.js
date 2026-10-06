"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { SearchIcon, MenuIcon, XIcon } from "@/components/common/Icons";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config/apiConfig";

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      try {
        const res = await fetch(`${API_BASE_URL}/search/suggest?q=${encodeURIComponent(val.trim())}`);
        const json = await res.json();
        if (json.success) {
          setSuggestions(json.data || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Suggestions fetch error:", err);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    setMobileMenuOpen(false);
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#090D16]/95 backdrop-blur-md border-b border-[#141F36] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          {/* Emblem */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 via-red-600 to-indigo-700 flex items-center justify-center p-0.5 shadow-lg shadow-red-900/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center">
              <span className="text-white font-black text-lg tracking-tighter bg-gradient-to-r from-red-400 to-rose-200 bg-clip-text text-transparent">
                R
              </span>
            </div>
          </div>

          {/* Titles */}
          <div className="flex flex-col">
            <span className="text-white font-extrabold text-base tracking-wide leading-none group-hover:text-rose-400 transition-colors">
              Raj Exam Vault
            </span>
            <span className="text-slate-400 font-bold text-[9px] tracking-widest uppercase leading-none mt-1">
              YOUR RAJASTHAN EXAM COMPANION
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-300">
          <Link href="/exams" className="hover:text-white transition-colors">
            Exams
          </Link>
          <Link href="/materials?materialType=pyq" className="hover:text-white transition-colors">
            PYQ Vault
          </Link>
          <Link href="/materials?materialType=notes" className="hover:text-white transition-colors">
            Notes
          </Link>
          <Link href="/tests" className="hover:text-white transition-colors flex items-center gap-1.5">
            <span>Mock Tests</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-purple-900/60 text-purple-300 border border-purple-700/50">
              Live
            </span>
          </Link>
          <Link href="/current-affairs" className="hover:text-white transition-colors">
            Current Affairs
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          
          {/* Quick Search */}
          <div className="relative hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                className="w-40 xl:w-48 bg-[#0F172A] border border-slate-700/70 rounded-full pl-3 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-all"
              />
              <button type="submit" className="absolute right-2.5 text-slate-400 hover:text-white cursor-pointer">
                <SearchIcon className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Suggestions Overlay */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl p-2 z-50">
                <div className="space-y-1">
                  {suggestions.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.url}
                      onClick={() => {
                        setShowSuggestions(false);
                        setSearchQuery("");
                      }}
                      className="p-2 rounded-xl hover:bg-slate-800 flex items-center justify-between text-xs text-slate-200 hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span>{item.icon}</span>
                        <span className="font-semibold truncate">{item.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium ml-2">
                        {item.type}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Logged In State vs Log In CTA */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              {['root', 'superadmin', 'admin'].includes(user.role) && (
                <Link
                  href="/superadmin"
                  className="px-2.5 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-[#4f46e5] text-white font-bold text-xs shadow-sm flex items-center gap-1 hover:brightness-110 transition-all"
                  title="SuperAdmin Portal"
                >
                  <span>🛡️</span>
                  <span className="hidden sm:inline">Admin Panel</span>
                </Link>
              )}
              <Link
                href="/profile"
                className="flex items-center gap-2 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 rounded-full border border-slate-700 transition-all"
                title="View Profile"
              >
                <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-[10px] uppercase">
                  {user.name ? user.name.charAt(0) : "U"}
                </div>
                <span className="text-xs font-semibold text-slate-200 hidden sm:inline max-w-[90px] truncate">
                  {user.name}
                </span>
              </Link>
              <button
                onClick={logout}
                className="px-2.5 py-1 rounded-full bg-red-900/40 hover:bg-red-900/70 text-red-300 font-semibold text-xs border border-red-800/60 transition-all cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 rounded-full bg-gradient-to-r from-[#e62e3d] via-[#a8226a] to-[#8b5cf6] hover:opacity-95 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>Start preparing</span>
                <span>→</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white lg:hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#090D16] border-t border-[#141F36] px-4 py-5 space-y-4 shadow-2xl">
          <form onSubmit={handleSearchSubmit} className="relative mb-2">
            <input
              type="text"
              placeholder="Search exam, subject, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-xl pl-3 pr-8 py-2 text-xs text-slate-200 placeholder-slate-400 outline-none"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-slate-400">
              <SearchIcon className="w-4 h-4" />
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-300">
            <Link href="/exams" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800">
              🏛️ Exams
            </Link>
            <Link href="/materials?materialType=pyq" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800">
              📄 PYQ Vault
            </Link>
            <Link href="/materials?materialType=notes" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800">
              📝 Notes
            </Link>
            <Link href="/tests" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-purple-300">
              ⏱️ Mock Tests
            </Link>
            <Link href="/current-affairs" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-300">
              📰 Current Affairs
            </Link>
            <Link href="/materials?isFree=true" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-emerald-300">
              🎁 Free Vault
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
