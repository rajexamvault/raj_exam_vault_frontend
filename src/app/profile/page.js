"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import authService from "@/services/authService";
import PersonalVaultDashboard from "@/components/profile/PersonalVaultDashboard";

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

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateUserProfile, uploadProfileImage, deleteProfileImage, logout } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "security" | "vault"
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageNotice, setImageNotice] = useState({ type: "", message: "" });

  // Circular Adjustment Modal State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustImageSrc, setAdjustImageSrc] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 240, height: 240, naturalWidth: 240, naturalHeight: 240 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const viewportRef = useRef(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: "",
    username: "",
    category: "General / UR",
    email: "",
    phone: "",
    whatsappNumber: "",
    dob: "",
    targetExam: "RPSC RAS / RTS",
    higherQualification: "Graduate (BA / BSc / BCom / BTech / BCA)",
    age: "",
    state: "Rajasthan",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSuccess, setProfileSuccess] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: "" });

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Sync user data to form
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        username: user.username || "",
        category: user.category || "General / UR",
        email: user.email || "",
        phone: user.phone || "",
        whatsappNumber: user.whatsappNumber || user.phone || "",
        dob: user.dob || "",
        targetExam: user.targetExam || "RPSC RAS / RTS",
        higherQualification: user.higherQualification || "Graduate (BA / BSc / BCom / BTech / BCA)",
        age: user.age ? user.age.toString() : "",
        state: user.state || "Rajasthan",
      });
    }
  }, [user]);

  // Debounced live username check when edited
  useEffect(() => {
    const rawUser = profileForm.username.trim().toLowerCase();
    if (!rawUser) {
      setUsernameStatus({ checking: false, available: null, message: "" });
      return;
    }

    // If matches user's current username, it's valid
    if (user?.username && rawUser === user.username.toLowerCase()) {
      setUsernameStatus({ checking: false, available: true, message: "✓ Your current username" });
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

    setUsernameStatus({ checking: true, available: null, message: "Checking..." });
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
  }, [profileForm.username, user?.username]);

  // Auth Protection Guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between">
        <Navbar />
        <div className="flex flex-col items-center justify-center my-auto py-24">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-xs font-semibold text-slate-500">Loading your profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => {
      const updated = { ...prev, [name]: value };
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

    if (profileErrors[name]) {
      setProfileErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setProfileSuccess("");
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileErrors({});

    const newErrors = {};
    if (!profileForm.name.trim()) {
      newErrors.name = "Full name is required";
    }

    const cleanUsername = profileForm.username.trim().toLowerCase();
    if (cleanUsername) {
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
        newErrors.username = "Username must be 3-30 chars (letters, numbers & _ only)";
      } else if (usernameStatus.available === false) {
        newErrors.username = "This username is already taken. Please choose another.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setProfileErrors(newErrors);
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateUserProfile({
        name: profileForm.name.trim(),
        username: cleanUsername || undefined,
        category: profileForm.category,
        phone: profileForm.phone.trim(),
        whatsappNumber: profileForm.whatsappNumber.trim(),
        dob: profileForm.dob,
        targetExam: profileForm.targetExam,
        higherQualification: profileForm.higherQualification,
        age: profileForm.age ? Number(profileForm.age) : null,
        state: profileForm.state,
      });
      setProfileSuccess("Profile details updated successfully! 🎉");
    } catch (err) {
      setProfileErrors({ server: err.message || "Failed to update profile" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setPasswordSuccess("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordErrors({});

    const newErrors = {};
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = "Enter your current password";
    }
    if (!passwordForm.newPassword) {
      newErrors.newPassword = "Enter a new password";
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Confirm your new password";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordSuccess(res.message || "Password changed successfully! 🔐");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordErrors({ server: err.message || "Failed to change password" });
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Step 1: When user selects image file, open Adjust/Crop modal
  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageNotice({ type: "error", message: "Please select an image file (JPG, PNG, WEBP)" });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setImageNotice({ type: "error", message: "Image size must be less than 8MB" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const viewportSize = 240;
        const nw = img.naturalWidth || viewportSize;
        const nh = img.naturalHeight || viewportSize;

        // Scale image so that the whole face/subject comfortably fills or fits the crop box
        let baseW = viewportSize;
        let baseH = viewportSize;
        if (nw >= nh) {
          // Landscape / Square
          baseH = viewportSize;
          baseW = (nw / nh) * viewportSize;
        } else {
          // Portrait
          baseW = viewportSize;
          baseH = (nh / nw) * viewportSize;
        }

        setImageDimensions({
          width: Math.round(baseW),
          height: Math.round(baseH),
          naturalWidth: nw,
          naturalHeight: nh,
        });
        setAdjustImageSrc(reader.result);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setRotation(0);
        setIsAdjustModalOpen(true);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Pan & Drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  // Step 2: Render cropped round canvas and upload to Cloudinary
  const handleSaveCroppedAvatar = async () => {
    if (!adjustImageSrc || !imageRef.current) return;

    setIsUploadingImage(true);
    setImageNotice({ type: "", message: "" });

    try {
      const img = imageRef.current;
      const canvas = document.createElement("canvas");
      const cropSize = 500; // Output square avatar resolution (500x500 px)
      canvas.width = cropSize;
      canvas.height = cropSize;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, cropSize, cropSize);

      // Viewport scale factor (240px preview viewport to 500px canvas)
      const viewportSize = 240;
      const scaleFactor = cropSize / viewportSize;

      const drawWidth = imageDimensions.width * scaleFactor * zoom;
      const drawHeight = imageDimensions.height * scaleFactor * zoom;

      ctx.save();
      // Translate to canvas center + pan offset
      ctx.translate(
        cropSize / 2 + pan.x * scaleFactor,
        cropSize / 2 + pan.y * scaleFactor
      );
      ctx.rotate((rotation * Math.PI) / 180);

      // Draw image centered at the translated point
      ctx.drawImage(
        img,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );
      ctx.restore();

      // Convert canvas to Blob
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92)
      );

      if (!blob) throw new Error("Could not process image crop");

      const croppedFile = new File([blob], "profile-avatar.jpg", { type: "image/jpeg" });

      await uploadProfileImage(croppedFile);
      setIsAdjustModalOpen(false);
      setAdjustImageSrc(null);
      setImageNotice({ type: "success", message: "Round profile photo updated successfully! 📸" });
    } catch (err) {
      console.error("Crop upload error:", err);
      setImageNotice({ type: "error", message: err.message || "Failed to upload image" });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Remove Avatar Handler
  const handleRemoveAvatar = async () => {
    if (!confirm("Are you sure you want to remove your profile photo?")) return;
    setIsUploadingImage(true);
    setImageNotice({ type: "", message: "" });

    try {
      await deleteProfileImage();
      setImageNotice({ type: "success", message: "Profile photo removed." });
    } catch (err) {
      setImageNotice({ type: "error", message: err.message || "Failed to remove photo" });
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between">
      {/* Hidden File Input for Avatar Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleAvatarFileChange}
        className="hidden"
      />

      {/* Top Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          <Link href="/" className="hover:text-[#0f224a] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">User Profile</span>
        </div>

        {/* Global Image Notice Alert */}
        {imageNotice.message && (
          <div
            className={`mb-4 p-3 rounded-xl border text-xs flex items-center justify-between gap-2 animate-fade-in-up ${
              imageNotice.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {imageNotice.type === "success" ? (
                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{imageNotice.message}</span>
            </div>
            <button
              onClick={() => setImageNotice({ type: "", message: "" })}
              className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Profile Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0f224a] via-[#1e3a8a] to-[#312e81] rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            {/* User Info Avatar & Name */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Interactive Cloudinary Round Avatar */}
              <div className="relative group shrink-0">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 backdrop-blur-md border-3 border-white/40 flex items-center justify-center text-2xl sm:text-3xl font-black text-white shadow-xl uppercase overflow-hidden cursor-pointer relative group-hover:border-white transition-all ring-4 ring-white/10"
                  title="Click to adjust and upload round profile photo"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <span>{user.name ? user.name.charAt(0) : "U"}</span>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-bold text-white p-1 text-center rounded-full">
                    <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Adjust</span>
                  </div>

                  {/* Loading Spinner Overlay */}
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-[#0f224a]/85 flex flex-col items-center justify-center rounded-full">
                      <span className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></span>
                    </div>
                  )}
                </div>

                {/* Floating Camera Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white border-2 border-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
                  title="Upload & adjust photo"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">{user.name}</h1>
                  {user.username && (
                    <span className="text-blue-200 text-xs sm:text-sm font-semibold">@{user.username}</span>
                  )}
                  {user.category && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/10 text-slate-200 border border-white/15 text-[10px] font-bold">
                      {user.category}
                    </span>
                  )}
                  {user.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified Aspirant
                    </span>
                  )}
                </div>
                <p className="text-slate-300 text-xs sm:text-sm mt-0.5">{user.email}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-300 flex-wrap">
                  <span className="flex items-center gap-1">
                    🎯 <strong className="text-white">{user.targetExam || "RPSC RAS"}</strong>
                  </span>
                  <span>•</span>
                  <span>📍 {user.state || "Rajasthan"}</span>
                  <span>•</span>
                  <span>Member since {new Date(user.createdAt || Date.now()).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                  {user.profileImage && (
                    <>
                      <span>•</span>
                      <button
                        onClick={handleRemoveAvatar}
                        disabled={isUploadingImage}
                        className="text-[11px] text-rose-300 hover:text-rose-100 underline cursor-pointer"
                      >
                        Remove Photo
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Logout Quick Action */}
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-stretch sm:self-auto justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "profile"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Aspirant Details</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "security"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Security & Password</span>
          </button>

          <button
            onClick={() => setActiveTab("vault")}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "vault"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>My Prep Vault</span>
          </button>
        </div>

        {/* Tab 1: Personal / Aspirant Details */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-3xl">
            <div className="mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Aspirant Profile Details</h2>
              <p className="text-slate-500 text-xs mt-0.5">Manage your personal details, unique handle, exam preferences, and contact info.</p>
            </div>

            {profileSuccess && (
              <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileErrors.server && (
              <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{profileErrors.server}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Full Name & Username (2 Column Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label htmlFor="profileName" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="profileName"
                    name="name"
                    type="text"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="Your Full Name"
                  />
                  {profileErrors.name && (
                    <p className="text-red-500 text-[10px] mt-1">{profileErrors.name}</p>
                  )}
                </div>

                {/* Unique Username */}
                <div>
                  <label htmlFor="profileUsername" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Unique Username</span>
                    {usernameStatus.checking ? (
                      <span className="text-[10px] text-slate-400 font-medium animate-pulse">Checking...</span>
                    ) : usernameStatus.available === true ? (
                      <span className="text-[10px] text-emerald-600 font-bold">{usernameStatus.message}</span>
                    ) : usernameStatus.available === false ? (
                      <span className="text-[10px] text-red-500 font-semibold">{usernameStatus.message}</span>
                    ) : (
                      <span className="text-[10px] text-blue-600 font-semibold">@handle</span>
                    )}
                  </label>
                  <div
                    className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl bg-white transition-all ${
                      profileErrors.username || usernameStatus.available === false
                        ? "border-red-400 ring-1 ring-red-200"
                        : usernameStatus.available === true
                        ? "border-emerald-400 ring-1 ring-emerald-100"
                        : "border-slate-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
                    }`}
                  >
                    <span className="text-xs text-slate-400 font-bold select-none">@</span>
                    <input
                      id="profileUsername"
                      name="username"
                      type="text"
                      placeholder="e.g. rahul_sharma"
                      value={profileForm.username}
                      onChange={handleProfileChange}
                      className="flex-1 outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent font-medium lowercase"
                    />
                  </div>
                  {profileErrors.username && (
                    <p className="text-red-500 text-[10px] mt-1">{profileErrors.username}</p>
                  )}
                </div>
              </div>

              {/* Email Address & Category (2 Column Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Email Address (Readonly) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Registered Email</span>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                      ✓ Verified
                    </span>
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="profileCategory" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Category / Quota</span>
                    <span className="text-[10px] text-slate-400 font-medium">For Exam Cutoffs</span>
                  </label>
                  <select
                    id="profileCategory"
                    name="category"
                    value={profileForm.category}
                    onChange={handleProfileChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Rajasthan Exam */}
              <div>
                <label htmlFor="profileExam" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Targeted Rajasthan Exam</span>
                  <span className="text-[10px] text-blue-600 font-semibold">Primary Target</span>
                </label>
                <select
                  id="profileExam"
                  name="targetExam"
                  value={profileForm.targetExam}
                  onChange={handleProfileChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white cursor-pointer"
                >
                  {EXAM_OPTIONS.map((exam) => (
                    <option key={exam} value={exam}>{exam}</option>
                  ))}
                </select>
              </div>

              {/* WhatsApp Number & DOB (2 Column Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="profileWhatsapp" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>WhatsApp Number</span>
                    <span className="text-[10px] text-emerald-600 font-medium">For PYQ Alerts</span>
                  </label>
                  <input
                    id="profileWhatsapp"
                    name="whatsappNumber"
                    type="tel"
                    value={profileForm.whatsappNumber}
                    onChange={handleProfileChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="e.g. 9876543210"
                  />
                </div>

                <div>
                  <label htmlFor="profileDob" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Date of Birth (DOB)</span>
                    {profileForm.age && (
                      <span className="text-[10px] text-slate-500 font-medium">{profileForm.age} Years Old</span>
                    )}
                  </label>
                  <input
                    id="profileDob"
                    name="dob"
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={profileForm.dob}
                    onChange={handleProfileChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white cursor-pointer"
                  />
                </div>
              </div>

              {/* Higher Qualification & State (2 Column Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="profileHigherQual" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Highest Qualification
                  </label>
                  <select
                    id="profileHigherQual"
                    name="higherQualification"
                    value={profileForm.higherQualification}
                    onChange={handleProfileChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white cursor-pointer"
                  >
                    {QUALIFICATION_OPTIONS.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="profileState" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Home State / Domicile
                  </label>
                  <select
                    id="profileState"
                    name="state"
                    value={profileForm.state}
                    onChange={handleProfileChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white cursor-pointer"
                  >
                    {STATE_OPTIONS.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 rounded-xl bg-[#0f224a] hover:bg-[#162c5b] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-70 flex items-center gap-2"
                >
                  {isSavingProfile ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === "security" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-3xl">
            <div className="mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Change Password</h2>
              <p className="text-slate-500 text-xs mt-0.5">Ensure your account uses a strong and unique password.</p>
            </div>

            {passwordSuccess && (
              <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordErrors.server && (
              <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{passwordErrors.server}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Current Password
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="flex-1 outline-none text-xs sm:text-sm text-slate-800 bg-transparent"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                  >
                    {showCurrentPassword ? (
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-red-500 text-[10px] mt-1">{passwordErrors.currentPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-xs font-bold text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="flex-1 outline-none text-xs sm:text-sm text-slate-800 bg-transparent"
                    placeholder="Enter new password (min 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-[10px] mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="flex-1 outline-none text-xs sm:text-sm text-slate-800 bg-transparent"
                    placeholder="Repeat new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-[10px] mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#e62e3d] to-[#4f46e5] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-70 flex items-center gap-2"
                >
                  {isSavingPassword ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: My Prep Vault */}
        {activeTab === "vault" && (
          <PersonalVaultDashboard />
        )}

      </main>

      {/* Circular Image Crop & Adjustment Modal */}
      {isAdjustModalOpen && adjustImageSrc && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col border border-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Adjust Profile Photo</span> <span>✂️</span>
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">Drag to reposition & use zoom to frame your round avatar.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAdjustModalOpen(false);
                  setAdjustImageSrc(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            {/* Interactive Viewport Area */}
            <div className="p-6 flex flex-col items-center bg-slate-950 select-none">
              <div
                ref={viewportRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
                className="w-60 h-60 relative overflow-hidden bg-slate-900 cursor-grab active:cursor-grabbing flex items-center justify-center rounded-2xl shadow-inner touch-none"
              >
                {/* Transformed Image */}
                <img
                  ref={imageRef}
                  src={adjustImageSrc}
                  alt="Crop preview"
                  draggable={false}
                  style={{
                    width: `${imageDimensions.width}px`,
                    height: `${imageDimensions.height}px`,
                    minWidth: `${imageDimensions.width}px`,
                    minHeight: `${imageDimensions.height}px`,
                    maxWidth: "none",
                    maxHeight: "none",
                    transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
                    transformOrigin: "center center",
                    transition: isDragging ? "none" : "transform 0.05s ease-out",
                  }}
                  className="pointer-events-none select-none"
                />

                {/* Circular Mask Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-52 h-52 rounded-full border-2 border-blue-500 shadow-[0_0_0_9999px_rgba(15,23,42,0.7)] relative">
                    {/* Centered crosshair guide */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                      <div className="w-full h-px border-t border-dashed border-white"></div>
                      <div className="h-full w-px border-l border-dashed border-white absolute"></div>
                    </div>
                  </div>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 mt-2 font-medium">
                💡 Drag image to center face inside the blue circle
              </span>
            </div>

            {/* Controls Bar */}
            <div className="px-6 py-4 bg-slate-50 space-y-3.5 border-t border-slate-100">
              {/* Zoom Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Zoom Level</span>
                  <span className="text-blue-600">{Math.round(zoom * 100)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setZoom((prev) => Math.max(0.5, Number((prev - 0.1).toFixed(2))))}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-sm shadow-2xs cursor-pointer"
                    title="Zoom Out"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom((prev) => Math.min(3, Number((prev + 0.1).toFixed(2))))}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-sm shadow-2xs cursor-pointer"
                    title="Zoom In"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Extra tools: Rotate & Reset */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Rotate 90°</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setZoom(1);
                      setPan({ x: 0, y: 0 });
                      setRotation(0);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 font-medium">
                  Round Shape (1:1)
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsAdjustModalOpen(false);
                  setAdjustImageSrc(null);
                }}
                disabled={isUploadingImage}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveCroppedAvatar}
                disabled={isUploadingImage}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#e62e3d] via-[#a8226a] to-[#4f46e5] hover:opacity-95 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-70"
              >
                {isUploadingImage ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Saving to Cloudinary...</span>
                  </>
                ) : (
                  <>
                    <span>Apply & Save Photo</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
