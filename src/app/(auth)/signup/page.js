"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SocialLogin from "@/components/auth/SocialLogin";
import authService from "@/services/authService";
import { useAuth } from "@/context/AuthContext";

const EXAM_OPTIONS = [
  "RPSC RAS / RTS",
  "RSMSSB CET (Graduation Level)",
  "RSMSSB CET (12th Level)",
  "REET (Level 1 & Level 2)",
  "Rajasthan Police (SI & Constable)",
  "Rajasthan Patwari & VDO",
  "Rajasthan High Court & RSMSSB LDC",
  "RPSC Assistant Professor / Lecturer",
  "Junior Accountant / Informatics Assistant"
];

const QUALIFICATION_OPTIONS = [
  "12th Pass / Senior Secondary",
  "Graduate (BA / BSc / BCom / BTech / BCA)",
  "Post Graduate (MA / MSc / MCom / MCA / MBA)",
  "Teaching Degree (B.Ed / BSTC / D.El.Ed)",
  "Diploma / ITI",
  "Final Year Student",
  "Other"
];

const CATEGORY_OPTIONS = [
  "General / UR",
  "OBC (Non-Creamy Layer)",
  "OBC (Creamy Layer)",
  "EWS (Economically Weaker Section)",
  "MBC (Most Backward Classes)",
  "SC (Scheduled Caste)",
  "ST (Scheduled Tribe)",
  "PwD / Divyangjan",
  "Ex-Servicemen"
];

const STATE_OPTIONS = [
  "Rajasthan",
  "Haryana",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Delhi (NCR)",
  "Punjab",
  "Bihar",
  "Gujarat",
  "Other State"
];

export default function SignupPage() {
  const router = useRouter();
  const { verifySignupOtp: verifyOtpContext, updateUserProfile } = useAuth();

  // 1 = Signup Form, 2 = OTP Verification, 3 = Aspirant Details Onboarding
  const [step, setStep] = useState(1);

  // Step 1 Form Data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Step 3 Onboarding Form Data
  const [onboardingData, setOnboardingData] = useState({
    username: "",
    category: "General / UR",
    targetExam: "RPSC RAS / RTS",
    whatsappNumber: "",
    dob: "",
    higherQualification: "Graduate (BA / BSc / BCom / BTech / BCA)",
    age: "",
    state: "Rajasthan",
  });
  const [onboardingErrors, setOnboardingErrors] = useState({});
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: "" });

  // Debounced live username availability check
  useEffect(() => {
    const rawUser = onboardingData.username.trim();
    if (!rawUser) {
      setUsernameStatus({ checking: false, available: null, message: "" });
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(rawUser)) {
      setUsernameStatus({
        checking: false,
        available: false,
        message: "3-30 characters (letters, numbers, _ only)"
      });
      return;
    }

    setUsernameStatus({ checking: true, available: null, message: "Checking availability..." });
    const timer = setTimeout(async () => {
      try {
        const res = await authService.checkUsername(rawUser);
        setUsernameStatus({
          checking: false,
          available: res.available,
          message: res.available ? "✓ Username is available" : "✗ Username already taken"
        });
      } catch (err) {
        setUsernameStatus({
          checking: false,
          available: false,
          message: err.message || "Failed to check username"
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [onboardingData.username]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer;
    if (step === 2 && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    } else if (resendCountdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

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

  const handleOnboardingChange = (e) => {
    const { name, value } = e.target;
    setOnboardingData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto compute age when dob changes
      if (name === "dob" && value) {
        const birthDate = new Date(value);
        if (!isNaN(birthDate.getTime())) {
          const diffMs = Date.now() - birthDate.getTime();
          const ageDate = new Date(diffMs);
          const computedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
          if (computedAge > 0 && computedAge < 100) {
            updated.age = computedAge.toString();
          }
        }
      }
      return updated;
    });

    if (onboardingErrors[name]) {
      setOnboardingErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setServerError("");
  };

  const validateSignupForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "Please agree to terms and privacy policy";
    }
    return newErrors;
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setServerSuccess("");

    const validationErrors = validateSignupForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.signup({
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setServerSuccess(response.message || "OTP sent to your email!");
      setStep(2);
      setResendCountdown(60);
      setCanResend(false);
    } catch (err) {
      setServerError(err.message || "Signup failed. Please try again.");
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
      const nextInput = document.getElementById(`signup-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`signup-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setServerError("Please enter complete 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtpContext({
        email: formData.email.trim(),
        otp: otpValue,
      });

      // Verification successful! Transition to Onboarding Step (Step 3) instead of direct redirect
      setServerSuccess("Email verified! Please fill the required aspirant details.");
      setStep(3);
    } catch (err) {
      setServerError(err.message || "Invalid or expired OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || isLoading) return;
    setIsLoading(true);
    setServerError("");
    setServerSuccess("");

    try {
      const res = await authService.resendSignupOtp({ email: formData.email.trim() });
      setServerSuccess(res.message || "New OTP has been sent to your email.");
      setResendCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      const firstInput = document.getElementById("signup-otp-0");
      if (firstInput) firstInput.focus();
    } catch (err) {
      setServerError(err.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Handle Onboarding Form Submit with Required: username, category, targetExam, whatsappNumber, dob
  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setServerSuccess("");

    const newErrors = {};

    // Unique Username Validation
    const cleanUsername = onboardingData.username.trim().toLowerCase();
    if (!cleanUsername) {
      newErrors.username = "Unique username is required";
    } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
      newErrors.username = "Username must be 3-30 chars (letters, numbers & _ only)";
    } else if (usernameStatus.available === false) {
      newErrors.username = "This username is already taken. Please choose another.";
    }

    if (!onboardingData.category) {
      newErrors.category = "Please select your category";
    }

    if (!onboardingData.targetExam) {
      newErrors.targetExam = "Target exam is required";
    }

    if (!onboardingData.whatsappNumber.trim()) {
      newErrors.whatsappNumber = "WhatsApp number is required";
    } else if (!/^[0-9+ ]{8,15}$/.test(onboardingData.whatsappNumber.trim())) {
      newErrors.whatsappNumber = "Enter a valid mobile/WhatsApp number";
    }

    if (!onboardingData.dob) {
      newErrors.dob = "Date of birth (DOB) is required";
    } else {
      const birthDate = new Date(onboardingData.dob);
      const today = new Date();
      if (isNaN(birthDate.getTime()) || birthDate >= today) {
        newErrors.dob = "Please select a valid date of birth";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setOnboardingErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await updateUserProfile({
        name: formData.fullName.trim(),
        username: cleanUsername,
        category: onboardingData.category,
        targetExam: onboardingData.targetExam,
        whatsappNumber: onboardingData.whatsappNumber.trim(),
        phone: onboardingData.whatsappNumber.trim(),
        dob: onboardingData.dob,
        higherQualification: onboardingData.higherQualification,
        age: onboardingData.age ? Number(onboardingData.age) : null,
        state: onboardingData.state,
      });

      setServerSuccess("Profile completed successfully! Welcome to Raj Exam Vault 🚀");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err) {
      setServerError(err.message || "Failed to save details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between">
      {/* STEP 1: Registration Form */}
      {step === 1 && (
        <>
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl xl:text-[26px] font-bold text-slate-900 flex items-center justify-center gap-1.5 leading-tight">
              Create Account <span>🚀</span>
            </h1>
            <p className="text-slate-500 mt-1 text-xs leading-relaxed">
              Join Raj Exam Vault and start your<br />
              preparation journey today.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 mt-1 mb-2.5">
            <Link href="/login" className="flex-1 text-center pb-2 group">
              <span className="text-slate-400 font-medium text-xs group-hover:text-slate-700 transition-colors">
                Login
              </span>
            </Link>
            <div className="flex-1 text-center pb-2 relative">
              <span className="text-blue-600 font-bold text-xs cursor-pointer">Register</span>
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600 rounded-full"></div>
            </div>
          </div>

          {/* Server Error / Success Alert */}
          {serverError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignupSubmit} className="space-y-2">
            {/* Full Name */}
            <div>
              <div
                className={`flex items-center gap-2.5 px-3.5 py-2 border rounded-xl bg-white transition-all ${
                  errors.fullName
                    ? "border-red-400 ring-1 ring-red-200"
                    : "border-slate-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
                }`}
              >
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="flex-1 outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent"
                />
              </div>
              {errors.fullName && <p className="text-red-500 text-[10px] mt-0.5 ml-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <div
                className={`flex items-center gap-2.5 px-3.5 py-2 border rounded-xl bg-white transition-all ${
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
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="flex-1 outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent"
                />
              </div>
              {errors.email && <p className="text-red-500 text-[10px] mt-0.5 ml-1">{errors.email}</p>}
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div
                  className={`flex items-center gap-2 px-3 py-2 border rounded-xl bg-white transition-all ${
                    errors.password
                      ? "border-red-400 ring-1 ring-red-200"
                      : "border-slate-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="flex-1 outline-none text-xs text-slate-800 placeholder-slate-400 bg-transparent w-full min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-0.5 shrink-0"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <div
                  className={`flex items-center gap-2 px-3 py-2 border rounded-xl bg-white transition-all ${
                    errors.confirmPassword
                      ? "border-red-400 ring-1 ring-red-200"
                      : "border-slate-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
                  }`}
                >
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="flex-1 outline-none text-xs text-slate-800 placeholder-slate-400 bg-transparent w-full min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-0.5 shrink-0"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
            {(errors.password || errors.confirmPassword) && (
              <p className="text-red-500 text-[10px] ml-1">
                {errors.password || errors.confirmPassword}
              </p>
            )}

            {/* Terms */}
            <div className="pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 shrink-0"
                />
                <span className="text-[11px] text-slate-600 leading-tight">
                  I agree to the{" "}
                  <a href="#" className="text-blue-600 hover:underline font-medium">Terms</a>
                  {" "}and{" "}
                  <a href="#" className="text-blue-600 hover:underline font-medium">Privacy</a>
                </span>
              </label>
              {errors.agreeTerms && <p className="text-red-500 text-[10px] mt-0.5 ml-1">{errors.agreeTerms}</p>}
            </div>

            {/* Create Account Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#e62e3d] via-[#a8226a] to-[#4f46e5] hover:opacity-95 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Creating Account...
                  </span>
                ) : (
                  <>
                    <span>Create Account</span>
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
      )}

      {/* STEP 2: OTP Verification Screen */}
      {step === 2 && (
        <div className="w-full h-full flex flex-col justify-between py-2">
          <div>
            <button
              onClick={() => {
                setStep(1);
                setServerError("");
                setServerSuccess("");
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors mb-2 font-medium cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to registration
            </button>

            <div className="text-center my-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-blue-100 shadow-xs">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl xl:text-2xl font-bold text-slate-900">Verify Your Email</h1>
              <p className="text-slate-500 mt-1 text-xs">
                Enter the 6-digit OTP sent to{" "}
                <span className="font-semibold text-slate-800">{formData.email}</span>
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
                  id={`signup-otp-${index}`}
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
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Verifying OTP...
                </span>
              ) : (
                "Verify & Continue"
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2">
            Didn&apos;t receive code?{" "}
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-blue-600 hover:underline font-bold cursor-pointer"
              >
                Resend OTP
              </button>
            ) : (
              <span className="text-slate-400 font-medium">
                Resend in <span className="text-blue-600 font-bold">{resendCountdown}s</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: Candidate Onboarding Details */}
      {step === 3 && (
        <div className="w-full h-full flex flex-col justify-between py-1 animate-fade-in-up">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-bold mb-1">
              ✨ Step 2 of 2: Aspirant Profile
            </div>
            <h1 className="text-xl xl:text-2xl font-bold text-slate-900 leading-tight">
              Aspirant Details
            </h1>
            <p className="text-slate-500 mt-0.5 text-xs">
              Complete your unique handle and exam preferences.
            </p>
          </div>

          {serverError && (
            <div className="my-1.5 p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center">
              {serverError}
            </div>
          )}

          {serverSuccess && (
            <div className="my-1.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs text-center">
              {serverSuccess}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleOnboardingSubmit} className="space-y-2.5 my-auto">
            {/* Username & Category (2 Column Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Unique Username */}
              <div>
                <label htmlFor="username" className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Unique Username <span className="text-red-500">*</span></span>
                  {usernameStatus.checking ? (
                    <span className="text-[10px] text-slate-400 font-medium animate-pulse">Checking...</span>
                  ) : usernameStatus.available === true ? (
                    <span className="text-[10px] text-emerald-600 font-bold">✓ Available</span>
                  ) : usernameStatus.available === false ? (
                    <span className="text-[10px] text-red-500 font-semibold">{usernameStatus.message}</span>
                  ) : (
                    <span className="text-[10px] text-blue-600 font-semibold">Unique</span>
                  )}
                </label>
                <div
                  className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl bg-white transition-all ${
                    onboardingErrors.username || usernameStatus.available === false
                      ? "border-red-400 ring-1 ring-red-200"
                      : usernameStatus.available === true
                      ? "border-emerald-400 ring-1 ring-emerald-100"
                      : "border-slate-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
                  }`}
                >
                  <span className="text-xs text-slate-400 font-bold select-none">@</span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="e.g. rahul_sharma"
                    value={onboardingData.username}
                    onChange={handleOnboardingChange}
                    className="flex-1 outline-none text-xs text-slate-800 placeholder-slate-400 bg-transparent font-medium lowercase"
                  />
                </div>
                {onboardingErrors.username && (
                  <p className="text-red-500 text-[10px] mt-0.5 ml-1">{onboardingErrors.username}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Category / Quota <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-medium">Cutoff info</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={onboardingData.category}
                  onChange={handleOnboardingChange}
                  className="w-full px-2.5 py-2 border rounded-xl bg-white text-xs text-slate-800 outline-none border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {onboardingErrors.category && (
                  <p className="text-red-500 text-[10px] mt-0.5 ml-1">{onboardingErrors.category}</p>
                )}
              </div>
            </div>

            {/* Target Exam & WhatsApp Number (2 Column Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Target Exam */}
              <div>
                <label htmlFor="targetExam" className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Target Exam <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-blue-600 font-semibold">Required</span>
                </label>
                <select
                  id="targetExam"
                  name="targetExam"
                  value={onboardingData.targetExam}
                  onChange={handleOnboardingChange}
                  className="w-full px-2.5 py-2 border rounded-xl bg-white text-xs text-slate-800 outline-none border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                >
                  {EXAM_OPTIONS.map((exam) => (
                    <option key={exam} value={exam}>{exam}</option>
                  ))}
                </select>
                {onboardingErrors.targetExam && (
                  <p className="text-red-500 text-[10px] mt-0.5 ml-1">{onboardingErrors.targetExam}</p>
                )}
              </div>

              {/* WhatsApp Number */}
              <div>
                <label htmlFor="whatsappNumber" className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>WhatsApp Number <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-emerald-600 font-semibold">For PYQs</span>
                </label>
                <div
                  className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl bg-white transition-all ${
                    onboardingErrors.whatsappNumber
                      ? "border-red-400 ring-1 ring-red-200"
                      : "border-slate-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
                  }`}
                >
                  <span className="text-xs text-slate-400 font-semibold">+91</span>
                  <input
                    id="whatsappNumber"
                    name="whatsappNumber"
                    type="tel"
                    placeholder="10-digit Number"
                    value={onboardingData.whatsappNumber}
                    onChange={handleOnboardingChange}
                    className="flex-1 outline-none text-xs text-slate-800 placeholder-slate-400 bg-transparent"
                  />
                </div>
                {onboardingErrors.whatsappNumber && (
                  <p className="text-red-500 text-[10px] mt-0.5 ml-1">{onboardingErrors.whatsappNumber}</p>
                )}
              </div>
            </div>

            {/* Date of Birth & Highest Qualification (2 Column Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Date of Birth (DOB) */}
              <div>
                <label htmlFor="dob" className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Date of Birth (DOB) <span className="text-red-500">*</span></span>
                  {onboardingData.age && (
                    <span className="text-[10px] text-slate-500 font-medium">{onboardingData.age} Yrs</span>
                  )}
                </label>
                <div
                  className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl bg-white transition-all ${
                    onboardingErrors.dob
                      ? "border-red-400 ring-1 ring-red-200"
                      : "border-slate-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input
                    id="dob"
                    name="dob"
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={onboardingData.dob}
                    onChange={handleOnboardingChange}
                    className="flex-1 outline-none text-xs text-slate-800 placeholder-slate-400 bg-transparent cursor-pointer"
                  />
                </div>
                {onboardingErrors.dob && (
                  <p className="text-red-500 text-[10px] mt-0.5 ml-1">{onboardingErrors.dob}</p>
                )}
              </div>

              {/* Higher Qualification */}
              <div>
                <label htmlFor="higherQualification" className="block text-[11px] font-bold text-slate-700 mb-1">
                  Qualification
                </label>
                <select
                  id="higherQualification"
                  name="higherQualification"
                  value={onboardingData.higherQualification}
                  onChange={handleOnboardingChange}
                  className="w-full px-2.5 py-2 border rounded-xl bg-white text-xs text-slate-800 outline-none border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                >
                  {QUALIFICATION_OPTIONS.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* State */}
            <div>
              <label htmlFor="state" className="block text-[11px] font-bold text-slate-700 mb-1">
                Home State / Domicile
              </label>
              <select
                id="state"
                name="state"
                value={onboardingData.state}
                onChange={handleOnboardingChange}
                className="w-full px-2.5 py-2 border rounded-xl bg-white text-xs text-slate-800 outline-none border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
              >
                {STATE_OPTIONS.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-1.5">
              <button
                type="submit"
                disabled={isLoading || usernameStatus.available === false}
                className="w-full bg-gradient-to-r from-[#e62e3d] via-[#a8226a] to-[#4f46e5] hover:opacity-95 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving Profile...
                  </span>
                ) : (
                  <>
                    <span>Complete Profile & Go to Home</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
