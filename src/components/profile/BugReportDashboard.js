"use client";

import { useState, useEffect, useRef } from "react";
import reportService from "@/services/reportService";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES = [
  { value: "auth_account", label: "🔐 Account / Login / OTP Issue", desc: "Cannot login, OTP delayed, password reset, account verification" },
  { value: "ui_ux", label: "🎨 UI & Layout Issue", desc: "Design glitch, broken button, mobile display" },
  { value: "question_error", label: "❓ Question or Answer Error", desc: "Incorrect option, spelling error, wrong key" },
  { value: "test_issue", label: "🏆 Mock Test / Timer Problem", desc: "Timer freeze, test submission error, score calculation" },
  { value: "materials_download", label: "📚 Notes / PYQ PDF Issue", desc: "Download link broken, corrupted file, missing pages" },
  { value: "payment_subscription", label: "💳 Payment / Subscription", desc: "Transaction failed, access not unlocked" },
  { value: "performance", label: "⚡ Slow Loading / Lag", desc: "Page hangs, timeout, network error" },
  { value: "other", label: "🛠️ Other Feedback / Bug", desc: "General issue or improvement suggestion" }
];

const PRIORITIES = [
  { value: "low", label: "Low", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: "medium", label: "Medium", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "high", label: "High", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "critical", label: "Critical", color: "bg-rose-50 text-rose-700 border-rose-200" }
];

export default function BugReportDashboard({ defaultTab = "form" }) {
  const { user, isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState(defaultTab); // "form" | "history"
  
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

  // Sync user info if available
  useEffect(() => {
    if (isAuthenticated && user) {
      setContactEmail(user.email || "");
      setContactName(user.name || "");
    }
  }, [isAuthenticated, user]);


  // History State
  const [reports, setReports] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyStatusFilter, setHistoryStatusFilter] = useState("all");
  const [lightboxImage, setLightboxImage] = useState(null);

  // Auto-detect current page URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageUrl(window.location.href);
    }
  }, []);

  // Handle Ctrl+V paste of screenshot anywhere on the tab
  useEffect(() => {
    const handlePaste = (e) => {
      if (viewMode !== "form") return;
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
  }, [viewMode]);

  // Load user's past reports
  const fetchMyReports = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await reportService.getMyReports({ status: historyStatusFilter });
      setReports(res.data || []);
    } catch (err) {
      console.error("Failed to load reports history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (viewMode === "history") {
      fetchMyReports();
    }
  }, [viewMode, historyStatusFilter]);

  // Handle File Select
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

  // Remove Selected File
  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
        setSubmitError("Please provide your contact email so our team can notify you when the problem is resolved.");
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
      if (pageUrl) formData.append("pageUrl", pageUrl.trim());
      if (typeof window !== "undefined") {
        formData.append("deviceInfo", `${navigator.userAgent} | Screen: ${window.innerWidth}x${window.innerHeight}`);
      }
      if (screenshotFile) {
        formData.append("screenshot", screenshotFile);
      }


      const res = await reportService.submitReport(formData);
      setSubmitSuccess(res.message || "Bug report submitted successfully! Our tech team will investigate and notify you via email when resolved.");
      
      // Reset form
      setTitle("");
      setDescription("");
      setScreenshotFile(null);
      setScreenshotPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      // Auto-refresh history if switching
      setTimeout(() => {
        fetchMyReports();
      }, 500);
    } catch (err) {
      setSubmitError(err.message || "Failed to submit bug report. Please try again.");
    } finally {
      setIsSubmitting(false);
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
    <div className="space-y-6">
      {/* Header & Sub-navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🐞</span>
              <h2 className="text-lg font-bold text-slate-900">Report & Bug Resolution Desk</h2>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Encountered a problem, question error, or glitch? Attach a screenshot and submit. Superadmin will inspect and email you once fixed!
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => { setViewMode("form"); setSubmitSuccess(""); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "form"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>✍️</span>
              <span>Submit Issue</span>
            </button>
            <button
              onClick={() => setViewMode("history")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "history"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>📋</span>
              <span>My Reports</span>
              {reports.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-700 font-extrabold">
                  {reports.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* View 1: Submission Form */}
        {viewMode === "form" && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-6 max-w-3xl">
            {submitSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
                <span className="text-lg leading-none">🎉</span>
                <div className="flex-1">
                  <strong className="font-bold block mb-0.5">Report Submitted Successfully!</strong>
                  <span>{submitSuccess}</span>
                </div>
              </div>
            )}

            {submitError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
                <span className="text-lg leading-none">⚠️</span>
                <span>{submitError}</span>
              </div>
            )}

            {/* Guest / Non-logged in student contact inputs */}
            {!isAuthenticated && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Your Contact Details (for email resolution notification)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Your Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="yourname@gmail.com (where we will notify you)"
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Row 1: Problem Title */}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Problem Summary / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Question #14 option B has typo / PDF download failed on RAS notes"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Row 2: Category & Priority */}
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

            {/* Row 3: Problem Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Be as specific as possible</span>
              </div>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what happened, what you expected, and steps to reproduce..."
                className="w-full px-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Row 4: Screenshot Upload & Paste zone */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Screenshot Attachment (Optional but Highly Recommended)
                </label>
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  Tip: Press Ctrl+V to paste screenshot directly!
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
                      {screenshotFile ? `${screenshotFile.name || 'Pasted Screenshot'} (${(screenshotFile.size / 1024).toFixed(1)} KB)` : 'Ready to upload'}
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
                    Click to browse screenshot or drag and drop image here
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Supports PNG, JPG, WEBP up to 15MB. Or take a screenshot and simply press <strong>Ctrl+V</strong>.
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

            {/* Row 5: Page URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Problem Location / URL
              </label>
              <input
                type="text"
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                placeholder="https://rajexamvault.com/tests/ras-mock-1"
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
                    <span>Submitting Issue...</span>
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
        )}

        {/* View 2: User Report History */}
        {viewMode === "history" && (
          <div className="mt-6 space-y-4">
            {/* Filter pills */}
            <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {["all", "open", "investigating", "resolved", "closed"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setHistoryStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                      historyStatusFilter === st
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <button
                onClick={fetchMyReports}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
            </div>

            {isLoadingHistory ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <span className="w-6 h-6 border-2 border-slate-300 border-t-rose-600 rounded-full animate-spin inline-block mb-2"></span>
                <p>Loading your reported issues...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
                <span className="text-3xl block mb-2">🎉</span>
                <h4 className="text-sm font-bold text-slate-700">No issues reported yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                  Everything looks clean! If you spot any typo, question bug, or platform issue, click "Submit Issue" above.
                </p>
                <button
                  onClick={() => setViewMode("form")}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer"
                >
                  Report a Problem
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
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

                      <div className="flex items-center gap-2">
                        {getStatusBadge(report.status)}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {report.description}
                    </p>

                    {/* Screenshot thumbnail if available */}
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

                    {/* Admin Resolution Section if resolved */}
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
                          {report.adminNotes || "Your reported bug is fixed now. Please check on your dashboard!"}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

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
              alt="Full Resolution Screenshot"
              className="max-h-[85vh] w-auto max-w-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
