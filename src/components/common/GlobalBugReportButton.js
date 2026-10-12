"use client";

import { useState, useRef, useEffect } from "react";
import reportService from "@/services/reportService";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES = [
  { value: "auth_account", label: "🔐 Login / Signup / OTP Issue" },
  { value: "ui_ux", label: "🎨 UI & Layout Glitch" },
  { value: "question_error", label: "❓ Question or Answer Error" },
  { value: "test_issue", label: "🏆 Mock Test / Timer Problem" },
  { value: "materials_download", label: "📚 Notes / PYQ PDF Issue" },
  { value: "payment_subscription", label: "💳 Payment / Subscription" },
  { value: "performance", label: "⚡ Slow Loading / Lag" },
  { value: "other", label: "🛠️ Other Feedback / Bug" }
];

export default function GlobalBugReportButton() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("auth_account");
  const [priority, setPriority] = useState("medium");
  const [contactEmail, setContactEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const fileInputRef = useRef(null);

  // Auto configure category and contact info when opening
  useEffect(() => {
    if (isOpen) {
      if (typeof window !== "undefined") {
        const path = window.location.pathname.toLowerCase();
        if (path.includes("login") || path.includes("signup") || path.includes("forgot") || path.includes("auth")) {
          setCategory("auth_account");
        }
      }
      if (isAuthenticated && user) {
        setContactEmail(user.email || "");
        setContactName(user.name || "");
      }
    }
  }, [isOpen, isAuthenticated, user]);

  // Paste screenshot support
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setScreenshotFile(file);
            setScreenshotPreview(URL.createObjectURL(file));
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setStatusMessage({ type: "error", text: "Please upload an image (PNG, JPG, WEBP)" });
        return;
      }
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
      setStatusMessage({ type: "", text: "" });
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setStatusMessage({ type: "error", text: "Please fill in problem title and description" });
      return;
    }

    if (!isAuthenticated) {
      if (!contactEmail.trim()) {
        setStatusMessage({
          type: "error",
          text: "Please enter your email so we can notify you once the problem is resolved!"
        });
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactEmail.trim())) {
        setStatusMessage({
          type: "error",
          text: "Please enter a valid email address."
        });
        return;
      }
    }

    setIsSubmitting(true);
    setStatusMessage({ type: "", text: "" });

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
      if (typeof window !== "undefined") {
        formData.append("pageUrl", window.location.href);
        formData.append("deviceInfo", `${navigator.userAgent} | Screen: ${window.innerWidth}x${window.innerHeight}`);
      }
      if (screenshotFile) {
        formData.append("screenshot", screenshotFile);
      }

      const res = await reportService.submitReport(formData);
      setStatusMessage({
        type: "success",
        text: res.message || "Report submitted! Superadmin will inspect and email you once resolved."
      });

      // Clear form
      setTitle("");
      setDescription("");
      setScreenshotFile(null);
      setScreenshotPreview(null);

      // Auto close after 3 seconds
      setTimeout(() => {
        setIsOpen(false);
        setStatusMessage({ type: "", text: "" });
      }, 3000);
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to submit report. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <aside aria-label="Quick bug reporting assistance" className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-linear-to-r from-red-600 via-rose-600 to-indigo-700 hover:from-red-700 hover:to-indigo-800 text-white font-bold text-xs shadow-xl shadow-red-950/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20"
          title="Report Bug or Login/Signup Problem"
        >
          <span className="text-base group-hover:rotate-12 transition-transform">🐞</span>
          <span className="hidden sm:inline font-extrabold tracking-wide">Report Bug / Problem</span>
        </button>
      </aside>

      {/* Floating Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 text-slate-800 my-8">
            {/* Header */}
            <div className="px-6 py-4 bg-linear-to-r from-[#090D16] to-[#1e1b4b] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-600/30 text-red-400 border border-red-500/30 flex items-center justify-center text-base">
                  🐞
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Report a Bug / Platform Issue</h3>
                  <p className="text-[11px] text-slate-300">
                    {!isAuthenticated ? "Facing Login or Signup issues? We will fix and email you!" : "Superadmin will inspect and email you once resolved"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Guest / Non-logged in student banner */}
              {!isAuthenticated && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <span>💡</span>
                    <span>Student Support Desk (Without Login)</span>
                  </div>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Facing issues with <strong>Login, Registration, OTP, or Password Reset</strong>? Attach a screenshot and enter your email below. Our team will resolve it and email you: <em>&quot;Your bug is fixed now, please check&quot;</em>.
                  </p>
                </div>
              )}

              {statusMessage.text && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    statusMessage.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  <span>{statusMessage.type === "success" ? "✅" : "⚠️"}</span>
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Guest Student Info fields (if not logged in) */}
              {!isAuthenticated && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                      Your Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com (for resolution email)"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs"
                      required
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      We will notify you at this email address when the fix is live.
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                      Phone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                  Problem Summary / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. OTP not arriving on Gmail / Login button not responding on Mobile"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs"
                  required
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                    Severity
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                  Problem Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what error appears or what happens when you try to login/signup..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs"
                  required
                />
              </div>

              {/* Screenshot Upload & Paste */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Screenshot (Highly Recommended)
                  </label>
                  <span className="text-[10px] text-rose-600 font-semibold">
                    Tip: Press Ctrl+V to paste
                  </span>
                </div>

                {screenshotPreview ? (
                  <div className="p-2 rounded-xl border border-emerald-300 bg-emerald-50/40 flex items-center justify-between gap-3">
                    <img
                      src={screenshotPreview}
                      alt="Preview"
                      className="w-16 h-12 rounded-lg object-cover border border-slate-200"
                    />
                    <div className="flex-1 truncate text-[11px] text-slate-600 font-medium">
                      {screenshotFile ? screenshotFile.name : 'Screenshot pasted'}
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveScreenshot}
                      className="text-rose-600 hover:text-rose-800 text-xs font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 border-2 border-dashed border-slate-200 hover:border-rose-400 rounded-xl text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-rose-50/20"
                  >
                    <p className="font-bold text-slate-700 text-[11px]">
                      Click to choose screenshot or press Ctrl+V
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, WEBP</p>
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

              {/* Current URL reminder */}
              {typeof window !== "undefined" && (
                <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-500 truncate">
                  <span className="font-bold text-slate-700">Location: </span>
                  <span className="font-mono text-[10px]">{window.location.pathname}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-linear-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs shadow-md shadow-red-900/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Submit Bug Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
