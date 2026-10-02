"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import adminService from "@/services/adminService";
import { useAuth } from "@/context/AuthContext";

function SetupPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { saveAuthSession } = useAuth();

  const tokenParam = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [token, setToken] = useState(tokenParam);
  const [email, setEmail] = useState(emailParam);

  const [isLoadingVerification, setIsLoadingVerification] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null); // { valid, expired, used, message, name }
  
  // Password form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Request new link state
  const [isRequestingNewLink, setIsRequestingNewLink] = useState(false);
  const [requestNewLinkMessage, setRequestNewLinkMessage] = useState("");
  const [requestNewLinkError, setRequestNewLinkError] = useState("");

  // Verify token on mount
  useEffect(() => {
    if (!tokenParam || !emailParam) {
      setIsLoadingVerification(false);
      setVerificationResult({
        valid: false,
        message: "Invalid setup link. Missing token or email parameter."
      });
      return;
    }

    setToken(tokenParam);
    setEmail(emailParam);

    const checkToken = async () => {
      try {
        setIsLoadingVerification(true);
        const res = await adminService.verifyInviteToken(tokenParam, emailParam);
        setVerificationResult(res);
      } catch (err) {
        setVerificationResult({
          valid: false,
          expired: err.data?.expired || false,
          used: err.data?.used || false,
          message: err.message || "Failed to verify setup link."
        });
      } finally {
        setIsLoadingVerification(false);
      }
    };

    checkToken();
  }, [tokenParam, emailParam]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!newPassword || newPassword.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await adminService.setupPassword({
        token,
        email,
        newPassword
      });

      setIsSuccess(true);
      if (res.token && res.user) {
        saveAuthSession(res.token, res.user);
      }
    } catch (err) {
      setFormError(err.message || "Failed to configure password. Link may have expired.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestNewLink = async () => {
    if (!email) {
      setRequestNewLinkError("Email address is required.");
      return;
    }

    try {
      setIsRequestingNewLink(true);
      setRequestNewLinkError("");
      setRequestNewLinkMessage("");
      const res = await adminService.requestNewInviteLink(email);
      setRequestNewLinkMessage(res.message || "A new 24-hour setup link has been sent to your email!");
    } catch (err) {
      setRequestNewLinkError(err.message || "Failed to request a new link.");
    } finally {
      setIsRequestingNewLink(false);
    }
  };

  // Calculate password strength
  const getPasswordStrength = () => {
    if (!newPassword) return { score: 0, text: "", color: "" };
    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 2) return { score, text: "Weak", color: "bg-red-500 text-red-700" };
    if (score <= 3) return { score, text: "Medium", color: "bg-amber-500 text-amber-700" };
    return { score, text: "Strong", color: "bg-emerald-500 text-emerald-700" };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-[#0f224a] to-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative overflow-hidden font-sans">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 relative z-10 animate-fade-in">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-[#0f224a] to-[#1e3a8a] text-white shadow-lg shadow-blue-900/30 mb-4 ring-4 ring-blue-50">
            <svg className="w-7 h-7 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Raj Exam <span className="text-[#d32f2f]">Vault</span>
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
            Admin Account Setup
          </p>
        </div>

        {/* Loading State */}
        {isLoadingVerification && (
          <div className="py-12 text-center">
            <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-[#0f224a] rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-600">Verifying your 24-hour activation link...</p>
          </div>
        )}

        {/* Success State */}
        {!isLoadingVerification && isSuccess && (
          <div className="text-center py-6 animate-scale-up">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Password Configured!</h2>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Your new password has been securely saved and the 24-hour activation link is now permanently deactivated.
            </p>
            <div className="space-y-3">
              <Link
                href="/superadmin"
                className="block w-full py-3 px-4 rounded-xl bg-linear-to-r from-[#0f224a] to-[#1e3a8a] hover:from-[#162c5b] hover:to-[#1e40af] text-white font-bold text-sm text-center shadow-md shadow-blue-900/20 transition-all cursor-pointer"
              >
                Go to Admin Dashboard 🚀
              </Link>
              <Link
                href="/"
                className="block w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs text-center transition-all"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* Valid Token -> Password Setup Form */}
        {!isLoadingVerification && !isSuccess && verificationResult?.valid && (
          <div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0f224a] text-white flex items-center justify-center font-bold text-sm uppercase shrink-0">
                  {verificationResult.name ? verificationResult.name.charAt(0) : "A"}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {verificationResult.name || "Administrator"}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 truncate">{email}</div>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 flex items-center gap-1 font-medium">
                  ⏱️ Link Active (24h validity)
                </span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified
                </span>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-900 focus:outline-none focus:border-[#0f224a] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {newPassword && (
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex gap-1 flex-1 max-w-[120px]">
                      <div className={`h-1.5 flex-1 rounded-full ${strength.score >= 1 ? "bg-amber-400" : "bg-slate-200"}`} />
                      <div className={`h-1.5 flex-1 rounded-full ${strength.score >= 3 ? "bg-amber-500" : "bg-slate-200"}`} />
                      <div className={`h-1.5 flex-1 rounded-full ${strength.score >= 4 ? "bg-emerald-500" : "bg-slate-200"}`} />
                    </div>
                    <span className={`text-[10px] font-bold ${strength.color}`}>
                      {strength.text}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#0f224a] focus:bg-white transition-all"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-800 leading-relaxed font-medium">
                🔒 <strong>Security Policy:</strong> Upon saving, this 24-hour setup link is immediately deactivated and cannot be reused.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-[#0f224a] to-[#1e3a8a] hover:from-[#162c5b] hover:to-[#1e40af] text-white font-bold text-sm shadow-md shadow-blue-900/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Activating & Saving..." : "Activate & Save Password 🛡️"}
              </button>
            </form>
          </div>
        )}

        {/* Expired or Invalid Link State */}
        {!isLoadingVerification && !isSuccess && !verificationResult?.valid && (
          <div className="animate-fade-in">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-4 ring-red-50">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h2 className="text-lg font-bold text-slate-900 text-center mb-1">
              {verificationResult?.expired ? "Activation Link Expired" : "Link Invalid or Used"}
            </h2>
            <p className="text-xs text-slate-600 text-center mb-6 leading-relaxed">
              {verificationResult?.message || "This password setup link is no longer valid (links are active for 24 hours). You can request a new link below."}
            </p>

            {requestNewLinkMessage && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                ✅ {requestNewLinkMessage}
              </div>
            )}

            {requestNewLinkError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                ❌ {requestNewLinkError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#0f224a] focus:bg-white transition-all"
                />
              </div>

              <button
                type="button"
                onClick={handleRequestNewLink}
                disabled={isRequestingNewLink || !email}
                className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-sm shadow-md shadow-red-900/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isRequestingNewLink ? "Dispatching New Link..." : "📨 Request New 24-Hour Link"}
              </button>

              <div className="text-center pt-2">
                <Link href="/login" className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                  Return to Login
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AdminSetupPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <SetupPasswordContent />
    </Suspense>
  );
}
