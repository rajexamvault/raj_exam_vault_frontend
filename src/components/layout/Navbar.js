"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  SearchIcon, 
  MenuIcon, 
  XIcon 
} from "@/components/common/Icons";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config/apiConfig";

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(2);
  const [activeDropdown, setActiveDropdown] = useState(null);
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
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 py-2.5 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          {/* Shield Emblem */}
          <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
            <svg className="w-9 h-9 drop-shadow-xs" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 4L7 11V22C7 33.2 14.3 43.4 24 46C33.7 43.4 41 33.2 41 22V11L24 4Z"
                fill="#0f224a"
                stroke="#c62828"
                strokeWidth="2.5"
              />
              <path
                d="M24 8L11 13.5V22.5C11 31.8 16.5 40 24 42.2C31.5 40 37 31.8 37 22.5V13.5L24 8Z"
                fill="#162c5b"
                stroke="#ef4444"
                strokeWidth="1"
              />
            </svg>
            <span className="absolute text-white font-black text-base tracking-tight drop-shadow">
              R
            </span>
          </div>

          {/* Text */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1 leading-none">
              <span className="text-[#0f224a] font-black text-base tracking-wider">
                RAJ EXAM
              </span>
            </div>
            <span className="text-[#d32f2f] font-black text-sm tracking-wider leading-none mt-0.5">
              VAULT
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links with Dropdowns */}
        <nav className="hidden xl:flex items-center gap-6 text-xs font-semibold text-slate-700">
          
          {/* Home */}
          <Link href="/" className="hover:text-[#0f224a] transition-colors">
            Home
          </Link>

          {/* Rajasthan Exams Hub */}
          <Link href="/exams" className="hover:text-[#0f224a] transition-colors flex items-center gap-1 font-bold text-slate-800">
            <span>🏛️ Exams</span>
          </Link>

          {/* Study Materials & PYQ Vault */}
          <Link href="/materials" className="hover:text-[#0f224a] transition-colors flex items-center gap-1">
            <span>📚 Materials & PYQs</span>
          </Link>

          {/* Mock Test Engine */}
          <Link href="/tests" className="hover:text-[#0f224a] transition-colors flex items-center gap-1">
            <span>⏱️ Mock Tests</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-50 text-purple-700 border border-purple-200">
              LIVE
            </span>
          </Link>

          {/* Current Affairs */}
          <Link href="/current-affairs" className="hover:text-[#0f224a] transition-colors flex items-center gap-1">
            <span>📰 Current Affairs</span>
          </Link>

          {/* Free PYQs */}
          <Link href="/materials?isFree=true" className="hover:text-[#0f224a] transition-colors flex items-center gap-1">
            <span>Free Vault</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-50 text-[#d32f2f] border border-rose-200">
              FREE
            </span>
          </Link>
        </nav>

        {/* Right: Search, Cart, Login/Register */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Search Bar with Live Suggestions Dropdown */}
          <div className="relative hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search exam, notes, mock test..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                className="w-48 lg:w-64 xl:w-72 bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0f224a] focus:bg-white transition-all shadow-2xs"
              />
              <button type="submit" className="absolute right-2.5 text-slate-400 hover:text-slate-700 cursor-pointer">
                <SearchIcon className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Auto-Complete Suggestions Dropdown Overlay */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 mt-1.5 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in-up">
                <div className="p-1.5 border-b border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Vault Matches</span>
                  <span>Press ↵ to view all</span>
                </div>
                <div className="space-y-1 mt-1">
                  {suggestions.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.url}
                      onClick={() => {
                        setShowSuggestions(false);
                        setSearchQuery("");
                      }}
                      className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs text-slate-700 hover:text-[#0f224a] transition-colors group"
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
                <div className="pt-2 border-t border-slate-100 text-center">
                  <Link
                    href={`/search?q=${encodeURIComponent(searchQuery)}`}
                    onClick={() => setShowSuggestions(false)}
                    className="text-[11px] font-bold text-rose-600 hover:underline block py-0.5"
                  >
                    View all results in Universal Vault Search →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Cart Icon with badge */}
          <button 
            onClick={() => alert("Cart: 2 PYQ Collections in cart.")}
            className="relative p-2 text-slate-700 hover:text-[#0f224a] transition-colors cursor-pointer"
            title="Cart"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#d32f2f] text-white text-[9px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          </button>

          {/* Login / Register Button or User Profile */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              {['superadmin', 'admin'].includes(user.role) && (
                <Link
                  href="/superadmin"
                  className="px-2.5 py-1 rounded-lg bg-linear-to-r from-red-600 to-[#0f224a] text-white font-bold text-xs shadow-xs flex items-center gap-1 hover:brightness-110 transition-all"
                  title="SuperAdmin Portal"
                >
                  <span>🛡️</span>
                  <span className="hidden sm:inline">Admin Panel</span>
                </Link>
              )}
              <Link
                href="/profile"
                className="hidden sm:flex items-center gap-2 pl-1.5 pr-3 py-1 bg-slate-100/90 hover:bg-slate-200/80 rounded-full border border-slate-200 transition-all group"
                title="View Profile"
              >
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-slate-300 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#0f224a] text-white flex items-center justify-center font-bold text-xs uppercase group-hover:scale-105 transition-transform">
                    {user.name ? user.name.charAt(0) : "U"}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate">
                  {user.name || "Account"}
                </span>
              </Link>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs border border-red-200 transition-all cursor-pointer"
                title="Logout"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 sm:px-5 py-2 rounded-lg bg-[#0f224a] hover:bg-[#162c5b] text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>Login / Register</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 xl:hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 shadow-lg animate-fade-in-up">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              placeholder="Search exam, subject or year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none"
            />
            <button type="submit" className="absolute right-2.5 top-2.5 text-slate-400">
              <SearchIcon className="w-4 h-4" />
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-lg bg-slate-50 text-[#d32f2f] font-bold">
              Home
            </Link>
            <Link href="/exams" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-lg hover:bg-slate-50 font-bold text-slate-900">
              🏛️ Rajasthan Exams
            </Link>
            <Link href="/materials" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-lg hover:bg-slate-50">
              📚 Materials & PYQs
            </Link>
            <Link href="/tests" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-lg hover:bg-slate-50 text-purple-700 font-bold">
              ⏱️ Mock Tests
            </Link>
            <Link href="/current-affairs" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-lg hover:bg-slate-50 text-amber-700 font-bold">
              📰 Current Affairs
            </Link>
            <Link href="/materials?isFree=true" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-lg hover:bg-slate-50 text-emerald-700 font-bold">
              🎁 Free Vault
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500">Cart: 2 items</span>
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                {['superadmin', 'admin'].includes(user.role) && (
                  <Link
                    href="/superadmin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-linear-to-r from-red-600 to-[#0f224a] text-white text-xs font-bold flex items-center gap-1"
                  >
                    🛡️ Admin Panel
                  </Link>
                )}
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#0f224a] text-white text-xs font-bold"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
