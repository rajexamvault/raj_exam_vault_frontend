"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import reportService from "@/services/reportService";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES = [
  { value: "auth_account", label: "🔐 Login / Signup / OTP Issue", desc: "Cannot login, OTP not received, password reset error, account verification" },
  { value: "ui_ux", label: "🎨 UI & Layout Glitch", desc: "Broken buttons, mobile view layout issues, visual errors" },
  { value: "question_error", label: "❓ Question or Answer Error", desc: "Incorrect answer key, typo in question, wrong explanation" },
  { value: "test_issue", label: "🏆 Mock Test / Timer Issue", desc: "Timer stopped, score not calculated, test stuck" },
  { value: "materials_download", label: "📚 Notes / PYQ PDF Issue", desc: "Download failed, PDF corrupted, missing questions" },
  { value: "payment_subscription", label: "💳 Payment & Access", desc: "Payment deducted but access not unlocked" },
  { value: "performance", label: "⚡ Slow Loading / Lag", desc: "Timeout, server error, slow response" },
  { value: "other", label: "🛠️ Other Feedback / Issue", desc: "General bugs or improvement suggestions" }
];

const PRIORITIES = [
  { value: "low", label: "Low", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: "medium", label: "Medium", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "high", label: "High", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "critical", label: "Critical", color: "bg-rose-50 text-rose-700 border-rose-200" }
];

export default function ReportBugPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("submit"); // "submit" | "track"

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("auth_account");
  const [priority, setPriority] = useState("medium");
  const [contactEmail, setContactEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const fileInputRef = useRef(null);

  // Track State
  const [trackEmail, setTrackEmail] = useState("");
  const [trackedReports, setTrackedReports] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [trackSearched, setTrackSearched] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Initialize email & name if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setContactEmail(user.email || "");
      setContactName(user.name || "");
      setTrackEmail(user.email || "");
    }
  }, [isAuthenticated, user]);

  // Support Ctrl+V paste of screenshot
  useEffect(() => {
    const handlePaste = (e) => {
      if (activeTab !== "submit") return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setScreenshotFile(file);
            setScreenshotPreview(URL.createObjectURL(file));
            setSubmitError("");
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [activeTab]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setSubmitError("Please choose an image file (PNG, JPG, WEBP).");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setSubmitError("Screenshot size must be under 15MB.");
        return;
      }
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
      setSubmitError("");
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (!title.trim()) {
      setSubmitError("Please provide a summary / title for the issue.");
      return;
    }
    if (!description.trim()) {
      setSubmitError("Please provide a detailed problem description.");
      return;
    }

    if (!isAuthenticated) {
      if (!contactEmail.trim()) {
        setSubmitError("Please provide your contact email so our team can notify you when the problem is fixed.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactEmail.trim())) {
        setSubmitError("Please provide a valid email address.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("priority", priority);

      if (!isAuthenticated) {
        formData.append("contactEmail", contactEmail.trim());
        if (contactName.trim()) formData.append("contactName", contactName.trim());
        if (contactPhone.trim()) formData.append("contactPhone", contactPhone.trim());
      }

      if (pageUrl.trim()) formData.append("pageUrl", pageUrl.trim());

      if (typeof window !== "undefined") {
        formData.append("deviceInfo", `${navigator.userAgent} | Screen: ${window.innerWidth}x${window.innerHeight}`);
      }

      if (screenshotFile) {
        formData.append("screenshot", screenshotFile);
      }

      const res = await reportService.submitReport(formData);
      setSubmitSuccess(
        res.message ||
        "Bug report submitted successfully! Our tech team will investigate and notify you via email when resolved."
      );

      // Clear form fields
      setTitle("");
      setDescription("");
      setScreenshotFile(null);
      setScreenshotPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setSubmitError(err.message || "Failed to submit bug report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Track Handler
  const handleTrackSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!trackEmail.trim()) return;

    setIsTracking(true);
    setTrackSearched(true);

    try {
      if (isAuthenticated) {
        const res = await reportService.getMyReports();
        setTrackedReports(res.data || []);
      } else {
        // Guest tracking: fetch via service search
        const res = await reportService.getAllReports({ search: trackEmail.trim() });
        const list = (res.data || []).filter(
          (r) =>
            (r.contactEmail && r.contactEmail.toLowerCase() === trackEmail.trim().toLowerCase()) ||
            (r.user && r.user.email && r.user.email.toLowerCase() === trackEmail.trim().toLowerCase())
        );
        setTrackedReports(list);
      }
    } catch (err) {
      console.error("Track search error:", err);
      setTrackedReports([]);
    } finally {
      setIsTracking(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>Open / Received</span>;
      case "investigating":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Investigating</span>;
      case "resolved":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>✅ Fixed / Resolved</span>;
      case "closed":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>Closed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Support & Bug Desk</span>
        </div>

        {/* Hero Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#090D16] via-[#111827] to-[#1e1b4b] rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-8">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider mb-3">
              <span>🐞</span>
              <span>Student Quality & Issue Resolution Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Facing an Issue on Raj Exam Vault?
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Whether you are unable to login, facing OTP delay, spotted an incorrect answer key in PYQs, or had a timer freeze in mock tests — submit your report with a screenshot below.
              Our Superadmin will resolve it and email you: <strong>&quot;Your bug is fixed now, please check&quot;</strong>.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-200 mb-8 pb-1">
          <button
            onClick={() => setActiveTab("submit")}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "submit"
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>✍️</span>
            <span>Submit a Bug / Issue</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("track");
              if (isAuthenticated && user?.email) {
                handleTrackSearch();
              }
            }}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "track"
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🔍</span>
            <span>Track Issue Status</span>
          </button>
        </div>

        {/* Tab 1: Submit Form */}
        {activeTab === "submit" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
                  <span className="text-xl leading-none">🎉</span>
                  <div className="flex-1">
                    <strong className="font-bold block mb-0.5">Bug Report Received!</strong>
                    <span>{submitSuccess}</span>
                  </div>
                </div>
              )}

              {submitError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
                  <span className="text-xl leading-none">⚠️</span>
                  <span>{submitError}</span>
                </div>
              )}

              {/* Guest / Non-logged in notice */}
              {!isAuthenticated && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <span>💡</span>
                    <span>Student Support Without Login</span>
                  </div>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    You do not need to be logged in to report an issue. If you are having trouble logging in or creating an account, enter your email below so we can notify you once it&apos;s fixed!
                  </p>
                </div>
              )}

              {/* Student Contact Info (if not logged in) */}
              {!isAuthenticated && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Your Contact Information (for resolution notification)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Your Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs sm:text-sm"
                        required
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Superadmin will send an email to this address saying: &quot;Your bug is fixed now, please check&quot;.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Phone / WhatsApp (Optional)
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Problem Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Problem Summary / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cannot login: invalid credentials error on valid password / OTP not received"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  required
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Issue Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Severity / Priority
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPriority(p.value)}
                        className={`py-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                          priority === p.value
                            ? `${p.color} ring-2 ring-rose-400 font-extrabold shadow-xs`
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Detailed Problem Description <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Describe steps to reproduce</span>
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what happened, what error message was shown, and your device/browser..."
                  className="w-full px-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  required
                />
              </div>

              {/* Screenshot Upload with Ctrl+V */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Screenshot Attachment (Optional but Highly Recommended)
                  </label>
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Tip: Press Ctrl+V to paste screenshot!
                  </span>
                </div>

                {screenshotPreview ? (
                  <div className="relative rounded-2xl border-2 border-emerald-400 bg-emerald-50/20 p-3 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-36 h-24 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 relative group">
                      <img
                        src={screenshotPreview}
                        alt="Screenshot Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setLightboxImage(screenshotPreview)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                      >
                        🔍 Preview
                      </button>
                    </div>
                    <div className="flex-1 text-xs text-slate-600">
                      <p className="font-bold text-slate-800">Screenshot Attached</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {screenshotFile ? `${screenshotFile.name || "Pasted Screenshot"} (${(screenshotFile.size / 1024).toFixed(1)} KB)` : "Ready to upload"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveScreenshot}
                      className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>✕</span>
                      <span>Remove</span>
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-rose-400 hover:bg-rose-50/10 rounded-2xl p-6 text-center cursor-pointer transition-all group"
                  >
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 group-hover:bg-rose-100 text-slate-500 group-hover:text-rose-600 flex items-center justify-center mb-3 transition-colors">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      Click to choose screenshot or drag and drop image here
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Supports PNG, JPG, WEBP. Or take a screenshot and simply press <strong>Ctrl+V</strong> on this page.
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Page Location URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Page or Test Location URL (Optional)
                </label>
                <input
                  type="text"
                  value={pageUrl}
                  onChange={(e) => setPageUrl(e.target.value)}
                  placeholder="https://rajexamvault.com/login"
                  className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-mono"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs shadow-md shadow-red-900/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Submitting Bug Report...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Submit Bug Report to Superadmin</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Track Status */}
        {activeTab === "track" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Track Your Reported Issues</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your email address to check the live status of the bugs you reported and see Superadmin resolution notes.
              </p>
            </div>

            {/* Email Search Box */}
            <form onSubmit={handleTrackSearch} className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <input
                type="email"
                value={trackEmail}
                onChange={(e) => setTrackEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs sm:text-sm"
                required
              />
              <button
                type="submit"
                disabled={isTracking}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                {isTracking ? "Searching..." : "Track Status"}
              </button>
            </form>

            {/* Track Results */}
            {isTracking ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <span className="w-6 h-6 border-2 border-slate-300 border-t-rose-600 rounded-full animate-spin inline-block mb-2"></span>
                <p>Looking up your reports...</p>
              </div>
            ) : trackSearched && trackedReports.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
                <span className="text-3xl block mb-2">🔍</span>
                <h4 className="text-sm font-bold text-slate-700">No Reports Found for this Email</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Double check the email address or submit a new bug report.
                </p>
              </div>
            ) : trackedReports.length > 0 ? (
              <div className="space-y-4 pt-2">
                {trackedReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-slate-400">#{report.id}</span>
                          <h3 className="text-sm font-bold text-slate-900">{report.title}</h3>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Reported on {new Date(report.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div>
                        {getStatusBadge(report.status)}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {report.description}
                    </p>

                    {/* Screenshot if available */}
                    {report.screenshotUrl && (
                      <div className="pt-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Attached Screenshot:
                        </span>
                        <div
                          onClick={() => setLightboxImage(report.screenshotUrl)}
                          className="inline-block relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer hover:ring-2 hover:ring-rose-500 transition-all group"
                        >
                          <img
                            src={report.screenshotUrl}
                            alt="Screenshot"
                            className="h-20 w-32 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                            View Full 🔍
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Resolution message */}
                    {report.status === "resolved" && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
                          <span>✅</span>
                          <span>Fixed by Raj Exam Vault Tech Team</span>
                          {report.resolvedAt && (
                            <span className="text-[10px] text-emerald-600 font-normal">
                              ({new Date(report.resolvedAt).toLocaleDateString()})
                            </span>
                          )}
                        </div>
                        <p className="text-emerald-700 text-xs">
                          {report.adminNotes || "Your reported bug is fixed now. Please check on your platform!"}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden bg-slate-900 p-2 shadow-2xl">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center font-bold text-sm z-10 cursor-pointer"
            >
              ✕
            </button>
            <img
              src={lightboxImage}
              alt="Screenshot Preview"
              className="max-h-[85vh] w-auto max-w-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
