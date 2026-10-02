"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import authService from "@/services/authService";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP, 3 = New Password, 4 = Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Step 1: Request Password Reset OTP
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setServerSuccess("");

    if (!email.trim()) {
      setErrors({ email: "Email address is required" });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const res = await authService.forgotPassword({ email: email.trim() });
      setServerSuccess(res.message || "Password reset OTP sent to your email!");
      setStep(2);
      setResendCountdown(60);
      const timer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setServerError(err.message || "No account found with this email");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP inputs handling
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setServerError("");

    if (value && index < 5) {
      const nextInput = document.getElementById(`reset-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`reset-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setServerError("Please enter complete 6-digit reset code");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.verifyResetOtp({
        email: email.trim(),
        otp: otpValue,
      });

      setServerSuccess(res.message || "Code verified! Please set a new password.");
      setStep(3);
    } catch (err) {
      setServerError(err.message || "Invalid or expired reset code");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend Reset OTP
  const handleResendOtp = async () => {
    setIsLoading(true);
    setServerError("");
    try {
      await authService.forgotPassword({ email: email.trim() });
      setServerSuccess("New password reset code sent to your email.");
      setResendCountdown(60);
      const timer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setServerError(err.message || "Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setServerSuccess("");

    const newErrors = {};
    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const otpValue = otp.join("");
      const res = await authService.resetPassword({
        email: email.trim(),
        otp: otpValue,
        newPassword,
      });

      setServerSuccess(res.message || "Password reset successfully!");
      setStep(4);
    } catch (err) {
      setServerError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between">
      {/* Step 1: Enter Email */}
      {step === 1 && (
        <>
          <div>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors mb-2 font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </Link>

            <div className="text-center my-3">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-red-100 shadow-xs">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="text-xl xl:text-2xl font-bold text-slate-900">Forgot Password?</h1>
              <p className="text-slate-500 mt-1 text-xs leading-relaxed">
                Enter your registered email address and<br />
                we&apos;ll send you a password reset OTP.
              </p>
            </div>
          </div>

          {serverError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center">
              {serverError}
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-3 my-auto">
            <div>
              <div
                className={`flex items-center gap-2.5 px-3.5 py-2.5 border rounded-xl bg-white transition-all ${
                  errors.email
                    ? "border-red-400 ring-1 ring-red-200"
                    : "border-slate-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
                }`}
              >
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter Registered Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({});
                  }}
                  className="flex-1 outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#e62e3d] via-[#a8226a] to-[#4f46e5] hover:opacity-95 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Sending OTP...
                </span>
              ) : (
                <>
                  <span>Send Reset OTP</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-2">
            Remember your password?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-semibold">
              Login
            </Link>
          </p>
        </>
      )}

      {/* Step 2: OTP Verification */}
      {step === 2 && (
        <>
          <div>
            <button
              onClick={() => {
                setStep(1);
                setServerError("");
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors mb-2 font-medium cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Change email
            </button>

            <div className="text-center my-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-blue-100">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl xl:text-2xl font-bold text-slate-900">Enter Reset OTP</h1>
              <p className="text-slate-500 mt-1 text-xs">
                Code sent to <span className="font-semibold text-slate-800">{email}</span>
              </p>
            </div>
          </div>

          {serverSuccess && (
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs text-center">
              {serverSuccess}
            </div>
          )}

          {serverError && (
            <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center">
              {serverError}
            </div>
          )}

          <form onSubmit={handleOtpSubmit} className="space-y-4 my-auto">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`reset-otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`w-10 h-11 text-center text-base font-bold border-2 rounded-xl outline-none transition-all ${
                    digit
                      ? "border-blue-500 bg-blue-50/40 text-blue-700 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 focus:border-blue-500"
                  }`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#e62e3d] via-[#a8226a] to-[#4f46e5] hover:opacity-95 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70"
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2">
            Didn&apos;t receive?{" "}
            {resendCountdown > 0 ? (
              <span className="text-slate-400">Resend in {resendCountdown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                Resend Code
              </button>
            )}
          </div>
        </>
      )}

      {/* Step 3: Set New Password */}
      {step === 3 && (
        <>
          <div>
            <div className="text-center my-3">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-purple-100">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-xl xl:text-2xl font-bold text-slate-900">Set New Password</h1>
              <p className="text-slate-500 mt-1 text-xs">
                Create a strong password for <span className="font-semibold text-slate-800">{email}</span>
              </p>
            </div>
          </div>

          {serverError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center">
              {serverError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-3 my-auto">
            <div>
              <div
                className={`flex items-center gap-2.5 px-3.5 py-2.5 border rounded-xl bg-white transition-all ${
                  errors.newPassword
                    ? "border-red-400 ring-1 ring-red-200"
                    : "border-slate-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
                }`}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex-1 outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-0.5"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-slate-400 hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <div
                className={`flex items-center gap-2.5 px-3.5 py-2.5 border rounded-xl bg-white transition-all ${
                  errors.confirmPassword
                    ? "border-red-400 ring-1 ring-red-200"
                    : "border-slate-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
                }`}
              >
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="flex-1 outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-0.5"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-slate-400 hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#e62e3d] via-[#a8226a] to-[#4f46e5] hover:opacity-95 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70"
            >
              {isLoading ? "Saving Password..." : "Update Password"}
            </button>
          </form>
        </>
      )}

      {/* Step 4: Success Screen */}
      {step === 4 && (
        <div className="text-center my-auto">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-100 shadow-xs">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Password Reset! 🎉</h1>
          <p className="text-slate-500 text-xs mb-6 leading-relaxed">
            Your password has been reset successfully.<br />You can now log in with your new password.
          </p>
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#e62e3d] via-[#a8226a] to-[#4f46e5] text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md"
          >
            Go to Login
          </Link>
        </div>
      )}
    </div>
  );
}
