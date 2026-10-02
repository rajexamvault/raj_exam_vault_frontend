"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SocialLogin from "@/components/auth/SocialLogin";
import { useAuth } from "@/context/AuthContext";
import authService from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();
  const { login, verifySignupOtp, user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auto-redirect if already logged in based on role
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && user) {
      if (["superadmin", "admin"].includes(user.role)) {
        router.push("/superadmin");
      } else {
        router.push("/");
      }
    }
  }, [isAuthenticated, isAuthLoading, user, router]);

  // Unverified account handling
  const [needsVerification, setNeedsVerification] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendCountdown, setResendCountdown] = useState(0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setServerError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setServerSuccess("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const data = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      const loggedUser = data.user;
      const isAdminOrSuperAdmin = loggedUser && ['superadmin', 'admin'].includes(loggedUser.role);

      setServerSuccess(`Welcome back, ${loggedUser?.name || 'User'}! Redirecting to ${isAdminOrSuperAdmin ? 'SuperAdmin Dashboard' : 'portal'}...`);
      
      setTimeout(() => {
        if (isAdminOrSuperAdmin) {
          router.push("/superadmin");
        } else {
          router.push("/");
        }
      }, 600);
    } catch (err) {
      // Check if backend returned unverified error (status 403)
      if (err.status === 403 && err.data?.isVerified === false) {
        setNeedsVerification(true);
        setServerError("Your account is not verified. Please verify using the OTP sent to your email.");
        // Trigger a fresh OTP
        authService.resendSignupOtp({ email: formData.email.trim() }).catch(() => {});
      } else {
        setServerError(err.message || "Invalid email or password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setServerError("");

    if (value && index < 5) {
      const nextInput = document.getElementById(`login-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`login-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setServerError("");
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setServerError("Please enter complete 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const data = await verifySignupOtp({
        email: formData.email.trim(),
        otp: otpValue,
      });

      const loggedUser = data.user;
      const isAdminOrSuperAdmin = loggedUser && ['superadmin', 'admin'].includes(loggedUser.role);

      setServerSuccess("Account verified and logged in! Redirecting...");
      setTimeout(() => {
        if (isAdminOrSuperAdmin) {
          router.push("/superadmin");
        } else {
          router.push("/");
        }
      }, 600);
    } catch (err) {
      setServerError(err.message || "Invalid or expired OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setServerError("");
    try {
      await authService.resendSignupOtp({ email: formData.email.trim() });
      setServerSuccess("New verification OTP sent to your email.");
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
      setServerError(err.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between">
      {!needsVerification ? (
        <>
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl xl:text-[26px] font-bold text-slate-900 flex items-center justify-center gap-1.5 leading-tight">
              Welcome Back! <span>👋</span>
            </h1>
            <p className="text-slate-500 mt-1 text-xs leading-relaxed">
              Login to your Raj Exam Vault account<br />
              and continue your preparation.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 mt-2 mb-3">
            <div className="flex-1 text-center pb-2 relative">
              <span className="text-blue-600 font-bold text-xs cursor-pointer">Login</span>
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600 rounded-full"></div>
            </div>
            <Link href="/signup" className="flex-1 text-center pb-2 group">
              <span className="text-slate-400 font-medium text-xs group-hover:text-slate-700 transition-colors">
                Register
              </span>
            </Link>
          </div>

          {/* Server Messages */}
          {serverError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          {serverSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{serverSuccess}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email */}
            <div>
              <div
                className={`flex items-center gap-2.5 px-3.5 py-2.5 border rounded-xl bg-white transition-all ${
                  errors.email
                    ? "border-red-400 ring-1 ring-red-200"
                    : "border-slate-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
                }`}
              >
                <svg
                  className="w-4 h-4 text-slate-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="flex-1 outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div
                className={`flex items-center gap-2.5 px-3.5 py-2.5 border rounded-xl bg-white transition-all ${
                  errors.password
                    ? "border-red-400 ring-1 ring-red-200"
                    : "border-slate-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
                }`}
              >
                <svg
                  className="w-4 h-4 text-slate-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
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
              {errors.password && (
                <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                />
                <span className="text-xs text-slate-600 font-medium">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Gradient Login Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#e62e3d] via-[#a8226a] to-[#4f46e5] hover:opacity-95 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Logging in...
                  </span>
                ) : (
                  <>
                    <span>Login</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Social Login */}
          <SocialLogin />
        </>
      ) : (
        /* Account Verification View for Unverified Users */
        <div className="w-full h-full flex flex-col justify-between py-2">
          <div>
            <button
              onClick={() => {
                setNeedsVerification(false);
                setServerError("");
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors mb-2 font-medium cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </button>

            <div className="text-center my-3">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-amber-100 shadow-xs">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-xl xl:text-2xl font-bold text-slate-900">Email Verification Required</h1>
              <p className="text-slate-500 mt-1 text-xs">
                Please enter the 6-digit OTP sent to{" "}
                <span className="font-semibold text-slate-800">{formData.email}</span>
              </p>
            </div>
          </div>

          {serverError && (
            <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center">
              {serverError}
            </div>
          )}

          {serverSuccess && (
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs text-center">
              {serverSuccess}
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-4 my-auto">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`login-otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`w-10 h-11 text-center text-base font-bold border-2 rounded-xl outline-none transition-all ${
                    digit
                      ? "border-blue-500 bg-blue-50/40 text-blue-700 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 focus-border-blue-500"
                  }`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#e62e3d] via-[#a8226a] to-[#4f46e5] hover:opacity-95 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70"
            >
              {isLoading ? "Verifying..." : "Verify & Login"}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2">
            Didn&apos;t receive code?{" "}
            {resendCountdown > 0 ? (
              <span className="text-slate-400">Resend in {resendCountdown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-blue-600 hover:underline font-bold cursor-pointer"
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
