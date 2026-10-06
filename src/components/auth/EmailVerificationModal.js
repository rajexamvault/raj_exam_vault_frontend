"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import authService from "@/services/authService";

export default function EmailVerificationModal() {
  const { user, verifySignupOtp, logout, saveAuthSession } = useAuth();

  // If there's no user or the user is already verified (or is root), do not show modal
  const needsVerification = !!(user && user.isVerified === false && user.role !== "root");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  if (!needsVerification) {
    return null;
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      const nextInput = document.getElementById(`modal-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`modal-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setSuccess("");

    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit OTP code");
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifySignupOtp({
        email: user.email,
        otp: otpValue
      });

      setSuccess("Email successfully verified! Welcome to Raj Exam Vault 🎉");
      // Update session to verified
      if (res && res.user) {
        saveAuthSession(res.token || localStorage.getItem("raj_auth_token"), {
          ...res.user,
          isVerified: true
        });
      }
    } catch (err) {
      setError(err.message || "Invalid or expired OTP. Please try again or request a new one.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      await authService.resendSignupOtp({ email: user.email });
      setSuccess("A fresh 6-digit verification code has been sent to your email.");
      setResendCountdown(60);
    } catch (err) {
      setError(err.message || "Failed to resend OTP. Please try again shortly.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative p-6 sm:p-8 animate-scale-up">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-rose-500 to-indigo-600"></div>

        {/* Icon & Title */}
        <div className="text-center pt-2">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-3 border border-amber-200/70 shadow-sm animate-bounce-subtle">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Email Verification Required
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
            To protect your account and use the Raj Exam Vault portal, please verify your email address:
          </p>
          <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-800 border border-slate-200">
            {user.email}
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-shake">
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* 6-Digit OTP Form */}
        <form onSubmit={handleVerifyOtp} className="mt-6 space-y-5">
          <div className="flex justify-center gap-2 sm:gap-2.5">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`modal-otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className={`w-11 h-13 text-center text-lg font-bold border-2 rounded-2xl outline-none transition-all ${
                  digit
                    ? "border-blue-600 bg-blue-50/50 text-blue-800 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                }`}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#e62e3d] via-[#a8226a] to-[#4f46e5] hover:opacity-95 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Verifying OTP...
              </span>
            ) : (
              <>
                <span>Verify & Unlock Portal</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Resend & Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <div>
            {resendCountdown > 0 ? (
              <span className="text-slate-400 font-medium">
                Resend code in <strong className="text-slate-600">{resendCountdown}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 font-bold transition-colors cursor-pointer"
              >
                Resend OTP Code
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={logout}
            className="text-slate-400 hover:text-red-600 font-medium transition-colors cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
