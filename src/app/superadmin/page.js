"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import adminService from "@/services/adminService";
import ExamManagement from "@/components/admin/ExamManagement";
import MaterialManagement from "@/components/admin/MaterialManagement";
import SyllabusHierarchyManagement from "@/components/admin/SyllabusHierarchyManagement";
import QuestionBankManagement from "@/components/admin/QuestionBankManagement";
import MockTestManagement from "@/components/admin/MockTestManagement";
import CurrentAffairsManagement from "@/components/admin/CurrentAffairsManagement";
import AnnouncementManagement from "@/components/admin/AnnouncementManagement";

export default function SuperAdminDashboard() {
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const router = useRouter();

  // Active tab: 'overview' | 'admins' | 'users' | 'invites' | 'exams' | 'materials' | 'syllabus' | 'system'
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedExamForMaterial, setSelectedExamForMaterial] = useState(null);
  const [selectedExamForSyllabus, setSelectedExamForSyllabus] = useState(null);

  // KPI Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    activeAdmins: 0,
    pendingInvites: 0,
    expiredInvites: 0,
    totalExams: 0,
    totalMaterials: 0,
    totalPyqs: 0,
    totalNotes: 0
  });

  // Admins state
  const [admins, setAdmins] = useState([]);
  const [adminPagination, setAdminPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [adminSearch, setAdminSearch] = useState("");
  const [adminStatusFilter, setAdminStatusFilter] = useState("all");
  const [adminRoleFilter, setAdminRoleFilter] = useState("all");
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  // Users (Aspirants) state
  const [users, setUsers] = useState([]);
  const [userPagination, setUserPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [userSearch, setUserSearch] = useState("");
  const [userExamFilter, setUserExamFilter] = useState("all");
  const [isUserLoading, setIsUserLoading] = useState(false);

  // Modal & Notification states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "admin"
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createdAdminSuccess, setCreatedAdminSuccess] = useState(null);

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isBackendOffline, setIsBackendOffline] = useState(false);

  const showToast = (type, message) => {
    setToastMessage({ type, message });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Fetch KPI Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await adminService.getStats();
      if (res.stats) {
        setStats(res.stats);
        setIsBackendOffline(false);
      }
    } catch (err) {
      if (!err.status) {
        setIsBackendOffline(true);
      }
      console.warn("Stats fetch notice:", err.message);
    }
  }, []);

  // Fetch Admins
  const fetchAdmins = useCallback(async () => {
    try {
      setIsAdminLoading(true);
      const res = await adminService.getAdmins({
        page: adminPagination.currentPage,
        limit: 10,
        search: adminSearch,
        status: activeTab === "invites" ? "pending" : adminStatusFilter,
        role: adminRoleFilter
      });
      if (res.admins) {
        setAdmins(res.admins);
        setAdminPagination(res.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
        setIsBackendOffline(false);
      }
    } catch (err) {
      if (!err.status) {
        setIsBackendOffline(true);
      }
      console.warn("Admins fetch notice:", err.message);
    } finally {
      setIsAdminLoading(false);
    }
  }, [adminPagination.currentPage, adminSearch, adminStatusFilter, adminRoleFilter, activeTab]);

  // Fetch Registered Aspirants / Users
  const fetchUsers = useCallback(async () => {
    try {
      setIsUserLoading(true);
      const res = await adminService.getUsers({
        page: userPagination.currentPage,
        limit: 10,
        search: userSearch,
        exam: userExamFilter
      });
      if (res.users) {
        setUsers(res.users);
        setUserPagination(res.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
        setIsBackendOffline(false);
      }
    } catch (err) {
      if (!err.status) {
        setIsBackendOffline(true);
      }
      console.warn("Users fetch notice:", err.message);
    } finally {
      setIsUserLoading(false);
    }
  }, [userPagination.currentPage, userSearch, userExamFilter]);

  // Authorization check & initial load
  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      if (user && !["superadmin", "admin"].includes(user.role)) {
        router.push("/");
        return;
      }
      fetchStats();
      fetchAdmins();
    }
  }, [isAuthenticated, isAuthLoading, user, router, fetchStats, fetchAdmins]);

  // Handle Tab Switch
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
    if (tab === "users" && users.length === 0) {
      fetchUsers();
    }
  };

  // Handle Create Admin / SuperAdmin
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!createFormData.name || !createFormData.email) {
      showToast("error", "Name and email are required.");
      return;
    }

    try {
      setIsCreating(true);
      const res = await adminService.createAdmin(createFormData);
      setCreatedAdminSuccess({
        admin: res.admin,
        tempPassword: res.tempPassword,
        setupLink: res.setupLink
      });
      showToast("success", res.message || "Account created & 24h activation link sent!");
      setCreateFormData({ name: "", email: "", phone: "", role: "admin" });
      fetchAdmins();
      fetchStats();
    } catch (err) {
      showToast("error", err.message || "Failed to create account");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Resend 24-hr Invite
  const handleResendInvite = async (adminId) => {
    try {
      setActionLoadingId(`resend-${adminId}`);
      const res = await adminService.resendInvite(adminId);
      showToast("success", res.message || "New 24h link and 6-char UUID password emailed!");
      fetchAdmins();
      fetchStats();
    } catch (err) {
      showToast("error", err.message || "Failed to resend invite link");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Toggle Status
  const handleToggleStatus = async (adminId, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      setActionLoadingId(`toggle-${adminId}`);
      const res = await adminService.toggleStatus(adminId, nextStatus);
      showToast("success", res.message || `Status updated to ${nextStatus}`);
      fetchAdmins();
      fetchStats();
    } catch (err) {
      showToast("error", err.message || "Failed to update status");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Delete Admin
  const handleDeleteAdmin = async (adminId, adminName) => {
    if (!confirm(`Are you sure you want to permanently delete admin "${adminName}"?`)) {
      return;
    }
    try {
      setActionLoadingId(`delete-${adminId}`);
      const res = await adminService.deleteAdmin(adminId);
      showToast("success", res.message || "Admin deleted successfully");
      fetchAdmins();
      fetchStats();
    } catch (err) {
      showToast("error", err.message || "Failed to delete admin");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Delete User (Aspirant)
  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Delete aspirant account "${userName}"? This cannot be undone.`)) {
      return;
    }
    try {
      setActionLoadingId(`delete-user-${userId}`);
      const res = await adminService.deleteUser(userId);
      showToast("success", res.message || "User account deleted");
      fetchUsers();
      fetchStats();
    } catch (err) {
      showToast("error", err.message || "Failed to delete user");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-100 font-sans flex flex-col lg:flex-row antialiased overflow-hidden">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-bounce-in max-w-md shadow-2xl">
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 backdrop-blur-md ${
              toastMessage.type === "success"
                ? "bg-emerald-950/90 border-emerald-500 text-emerald-200"
                : "bg-red-950/90 border-red-500 text-red-200"
            }`}
          >
            <span className="text-xl">{toastMessage.type === "success" ? "✅" : "⚠️"}</span>
            <div className="text-xs font-semibold leading-snug">{toastMessage.message}</div>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-auto text-slate-400 hover:text-white text-xs cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* MOBILE TOP BAR */}
      <div className="lg:hidden shrink-0 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-[#0f224a] to-red-600 flex items-center justify-center text-white font-black text-xs">
            R
          </div>
          <span className="font-bold text-sm tracking-wide text-white">
            RAJ EXAM <span className="text-red-500">VAULT</span>
          </span>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* MOBILE SIDEBAR BACKDROP */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* ======================= SIDEBAR COMPONENT ======================= */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out shrink-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        
        {/* Top: Logo & SuperAdmin Profile (Fixed Header) */}
        <div className="shrink-0">
          
          {/* Logo & Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#0f224a] to-red-600 flex items-center justify-center text-white font-black text-sm shadow-md border border-red-500/30">
                R
              </div>
              <div>
                <div className="text-sm font-black tracking-wider text-white">
                  RAJ EXAM <span className="text-red-500">VAULT</span>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  SuperAdmin Control
                </div>
              </div>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* SuperAdmin User Card */}
          <div className="p-3 mx-3 my-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-red-600 to-amber-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0 border border-red-500/30">
              {user?.name ? user.name.charAt(0) : "S"}
            </div>
            <div className="truncate flex-1">
              <div className="text-xs font-bold text-white truncate">{user?.name || "Super Admin"}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
              <span className="inline-block px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-800/60 text-[9px] font-extrabold uppercase mt-0.5">
                {user?.role || "superadmin"}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Track */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 text-xs font-bold scrollbar-thin">
          <nav className="space-y-1">
            
            {/* Overview */}
            <button
              onClick={() => handleTabSwitch("overview")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-linear-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-900/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">📊</span>
                <span>Dashboard Overview</span>
              </div>
            </button>

            {/* Admin Management */}
            <button
              onClick={() => handleTabSwitch("admins")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "admins"
                  ? "bg-linear-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-900/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🛡️</span>
                <span>Admins & Roles</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "admins" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"
              }`}>
                {stats.totalAdmins || 0}
              </span>
            </button>

            {/* Aspirants Directory */}
            <button
              onClick={() => handleTabSwitch("users")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "users"
                  ? "bg-linear-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-900/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">👥</span>
                <span>Aspirants Directory</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "users" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"
              }`}>
                {stats.totalUsers || 0}
              </span>
            </button>

            {/* 24h Invites Monitor */}
            <button
              onClick={() => handleTabSwitch("invites")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "invites"
                  ? "bg-linear-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-900/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">⏱️</span>
                <span>24h Invites Tracker</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "invites" ? "bg-white/20 text-white" : "bg-amber-950 text-amber-300 border border-amber-800/50"
              }`}>
                {stats.pendingInvites || 0}
              </span>
            </button>

            {/* Exams Management */}
            <button
              onClick={() => handleTabSwitch("exams")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "exams"
                  ? "bg-linear-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-900/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🏛️</span>
                <span>Exams & Vacancies</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "exams" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"
              }`}>
                {stats.totalExams || 0}
              </span>
            </button>

            {/* Stages & Syllabus Architecture */}
            <button
              onClick={() => handleTabSwitch("syllabus")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "syllabus"
                  ? "bg-linear-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-900/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">📑</span>
                <span>Stages & Syllabus</span>
              </div>
            </button>

            {/* Notes & PYQs Materials */}
            <button
              onClick={() => handleTabSwitch("materials")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "materials"
                  ? "bg-linear-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-900/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">📚</span>
                <span>Notes & PYQ Vault</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "materials" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"
              }`}>
                {stats.totalMaterials || 0}
              </span>
            </button>

            {/* Question Bank Engine */}
            <button
              onClick={() => handleTabSwitch("questions")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "questions"
                  ? "bg-linear-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-900/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🎯</span>
                <span>Question Bank</span>
              </div>
            </button>

            {/* Mock Tests & Series Engine */}
            <button
              onClick={() => handleTabSwitch("tests")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "tests"
                  ? "bg-linear-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-900/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🏆</span>
                <span>Mock Test Series</span>
              </div>
            </button>

            {/* Daily Current Affairs Engine */}
            <button
              onClick={() => handleTabSwitch("current-affairs")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "current-affairs"
                  ? "bg-linear-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-900/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">📰</span>
                <span>Current Affairs</span>
              </div>
            </button>

            {/* Official Announcements & Alerts */}
            <button
              onClick={() => handleTabSwitch("announcements")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "announcements"
                  ? "bg-linear-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-900/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">📢</span>
                <span>Exam Alerts & Notices</span>
              </div>
            </button>

            {/* System Security */}
            <button
              onClick={() => handleTabSwitch("system")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "system"
                  ? "bg-linear-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-900/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">⚙️</span>
                <span>Security & Health</span>
              </div>
            </button>

          </nav>

          {/* Quick Create Action in Sidebar */}
          <div className="pt-3 pb-2">
            <button
              onClick={() => {
                setCreatedAdminSuccess(null);
                setIsCreateModalOpen(true);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
            >
              <span>➕</span>
              <span>Create New Admin</span>
            </button>
          </div>

        </div>

        {/* Bottom Sidebar Controls (Fixed at bottom) */}
        <div className="p-4 border-t border-slate-800/80 space-y-2 shrink-0 bg-slate-900">
          
          <Link
            href="/"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 text-xs font-semibold transition-colors"
          >
            <span>🌐</span>
            <span>Visit Aspirant Portal</span>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/80 text-red-300 text-xs font-semibold border border-red-900/50 transition-colors cursor-pointer"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>

          <div className="pt-1 text-[10px] text-slate-500 text-center font-mono">
            Raj Exam Vault v2.0 • Root Access
          </div>

        </div>

      </aside>

      {/* ======================= MAIN CONTENT VIEWPORT ======================= */}
      <main className="flex-1 h-full overflow-y-auto bg-slate-950 p-4 sm:p-8 space-y-6 pb-16 scrollbar-thin">
        
        {/* Top Bar Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>SuperAdmin Control Center</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Root administrative suite for managing platform staff, aspirant profiles, and 24-hour setup tokens.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchStats();
                fetchAdmins();
                if (activeTab === "users") fetchUsers();
                showToast("success", "Data synchronized with database");
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>🔄 Sync</span>
            </button>

            <button
              onClick={() => {
                setCreatedAdminSuccess(null);
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-md shadow-red-900/30 transition-all active:scale-95 cursor-pointer shrink-0 flex items-center gap-2"
            >
              <span>+ Create Admin</span>
            </button>
          </div>
        </div>

        {/* Backend Server Offline Alert Banner */}
        {isBackendOffline && (
          <div className="p-4 rounded-2xl bg-amber-950/70 border border-amber-500/50 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <div className="text-xs font-bold text-amber-100">Backend API Server is Offline or Restarting</div>
                <div className="text-[11px] text-amber-300/80">
                  Please ensure your Node.js backend is running on <code className="bg-amber-900/60 px-1 py-0.5 rounded font-mono">http://localhost:5000</code>.
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                fetchStats();
                fetchAdmins();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              🔄 Retry Connection
            </button>
          </div>
        )}

        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          
          <div 
            onClick={() => setActiveTab("exams")}
            className={`bg-slate-900/60 hover:bg-slate-900 border rounded-2xl p-4 relative overflow-hidden backdrop-blur-md cursor-pointer transition-all ${
              activeTab === "exams" ? "border-red-500 ring-2 ring-red-500/20" : "border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Target Exams</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-950/80 text-red-400 flex items-center justify-center border border-red-800/40 text-xs sm:text-sm">
                🏛️
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2">{stats.totalExams || 0}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">RPSC & RSSB Exams</div>
          </div>

          <div 
            onClick={() => setActiveTab("materials")}
            className={`bg-slate-900/60 hover:bg-slate-900 border rounded-2xl p-4 relative overflow-hidden backdrop-blur-md cursor-pointer transition-all ${
              activeTab === "materials" ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">PYQ & Notes</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-950/80 text-blue-400 flex items-center justify-center border border-blue-800/40 text-xs sm:text-sm">
                📚
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-2">{stats.totalMaterials || 0}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">Study Resources</div>
          </div>

          <div 
            onClick={() => setActiveTab("users")}
            className={`bg-slate-900/60 hover:bg-slate-900 border rounded-2xl p-4 relative overflow-hidden backdrop-blur-md cursor-pointer transition-all ${
              activeTab === "users" ? "border-purple-500 ring-2 ring-purple-500/20" : "border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Aspirants</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-950/80 text-purple-400 flex items-center justify-center border border-purple-800/40 text-xs sm:text-sm">
                👥
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-300 mt-2">{stats.totalUsers || 0}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">Registered Candidates</div>
          </div>

          <div 
            onClick={() => setActiveTab("admins")}
            className={`bg-slate-900/60 hover:bg-slate-900 border rounded-2xl p-4 relative overflow-hidden backdrop-blur-md cursor-pointer transition-all ${
              activeTab === "admins" ? "border-red-500 ring-2 ring-red-500/20" : "border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Admins</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-950/80 text-blue-400 flex items-center justify-center border border-blue-800/40 text-xs sm:text-sm">
                🛡️
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2">{stats.totalAdmins || 0}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">Staff Managers</div>
          </div>

          <div 
            onClick={() => setActiveTab("admins")}
            className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden backdrop-blur-md cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Active Staff</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-950/80 text-emerald-400 flex items-center justify-center border border-emerald-800/40 text-xs sm:text-sm">
                ⚡
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">{stats.activeAdmins || 0}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">Verified & Online</div>
          </div>

          <div 
            onClick={() => setActiveTab("invites")}
            className={`bg-slate-900/60 hover:bg-slate-900 border rounded-2xl p-4 relative overflow-hidden backdrop-blur-md cursor-pointer transition-all ${
              activeTab === "invites" ? "border-amber-500 ring-2 ring-amber-500/20" : "border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">24h Invites</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-950/80 text-amber-400 flex items-center justify-center border border-amber-800/40 text-xs sm:text-sm">
                ⏱️
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">{stats.pendingInvites || 0}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">Pending Setup Links</div>
          </div>

        </div>

        {/* ================= TAB 5: EXAMS MANAGEMENT ================= */}
        {activeTab === "exams" && (
          <ExamManagement
            onAddMaterialForExam={(exam) => {
              setSelectedExamForMaterial(exam);
              setActiveTab("materials");
            }}
            onManageSyllabusForExam={(exam) => {
              setSelectedExamForSyllabus(exam);
              setActiveTab("syllabus");
            }}
            showToast={showToast}
          />
        )}

        {/* ================= TAB 6: STAGES & SYLLABUS ================= */}
        {activeTab === "syllabus" && (
          <SyllabusHierarchyManagement
            initialExamId={selectedExamForSyllabus?.id}
          />
        )}

        {/* ================= TAB 7: STUDY MATERIALS & PYQS ================= */}
        {activeTab === "materials" && (
          <MaterialManagement
            preselectedExam={selectedExamForMaterial}
            showToast={showToast}
          />
        )}

        {/* ================= TAB 8: QUESTION BANK ================= */}
        {activeTab === "questions" && (
          <QuestionBankManagement
            showToast={showToast}
          />
        )}

        {/* ================= TAB 9: MOCK TESTS & TEST SERIES ================= */}
        {activeTab === "tests" && (
          <MockTestManagement
            showToast={showToast}
          />
        )}

        {/* ================= TAB 10: CURRENT AFFAIRS & EDITORIALS ================= */}
        {activeTab === "current-affairs" && (
          <CurrentAffairsManagement
            showToast={showToast}
          />
        )}

        {/* ================= TAB 11: ANNOUNCEMENTS & ALERTS ================= */}
        {activeTab === "announcements" && (
          <AnnouncementManagement
            showToast={showToast}
          />
        )}

        {/* ================= TAB 1 & TAB 4: ADMINS & INVITES ================= */}
        {(activeTab === "admins" || activeTab === "invites" || activeTab === "overview") && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl animate-fade-in">
            
            {/* Table Action Bar */}
            <div className="p-4 sm:p-6 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                  <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={adminRoleFilter}
                  onChange={(e) => setAdminRoleFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-medium rounded-xl px-3 py-2 outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins Only</option>
                  <option value="superadmin">SuperAdmins Only</option>
                </select>

                <select
                  value={adminStatusFilter}
                  onChange={(e) => setAdminStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-medium rounded-xl px-3 py-2 outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending 24h Setup</option>
                  <option value="expired">Expired Setup Link</option>
                  <option value="inactive">Inactive</option>
                </select>

                <button
                  onClick={fetchAdmins}
                  disabled={isAdminLoading}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title="Refresh Table"
                >
                  <svg className={`w-4 h-4 ${isAdminLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

            </div>

            {/* Admin Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Administrator</th>
                    <th className="py-3.5 px-4 sm:px-6">Role & Status</th>
                    <th className="py-3.5 px-4 sm:px-6">24h Expiry Window</th>
                    <th className="py-3.5 px-4 sm:px-6">Created On</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {isAdminLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        <div className="inline-block w-6 h-6 border-2 border-slate-600 border-t-red-500 rounded-full animate-spin mb-2" />
                        <div>Loading admin records...</div>
                      </td>
                    </tr>
                  ) : admins.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        <div className="text-2xl mb-2">🛡️</div>
                        <div>No administrators found.</div>
                      </td>
                    </tr>
                  ) : (
                    admins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-slate-800/40 transition-colors">
                        
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 border ${
                              admin.role === "superadmin"
                                ? "bg-linear-to-br from-red-600 to-amber-600 text-white border-red-500/40"
                                : "bg-linear-to-br from-[#0f224a] to-blue-700 text-white border-blue-500/30"
                            }`}>
                              {admin.name ? admin.name.charAt(0) : "A"}
                            </div>
                            <div>
                              <div className="font-bold text-slate-200">{admin.name}</div>
                              <div className="text-[11px] text-slate-400">{admin.email}</div>
                              {admin.phone && (
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">📞 {admin.phone}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 sm:px-6">
                          <div className="space-y-1">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                              admin.role === "superadmin"
                                ? "bg-red-950 text-red-400 border border-red-800"
                                : "bg-blue-950 text-blue-400 border border-blue-800"
                            }`}>
                              {admin.role}
                            </span>

                            <div>
                              {admin.isPasswordSet ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[11px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                  Active
                                </span>
                              ) : admin.isInviteExpired ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800/60 text-[11px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                  Link Expired (Over 24h)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800/60 text-[11px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                  Pending 24h Setup
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 sm:px-6">
                          {admin.isPasswordSet ? (
                            <span className="text-[11px] text-slate-500 font-medium">Password Set (Link Deactivated)</span>
                          ) : admin.inviteTokenExpiry ? (
                            <div className="text-[11px]">
                              <span className={admin.isInviteExpired ? "text-red-400 font-bold" : "text-amber-300 font-bold"}>
                                {admin.isInviteExpired ? "Expired" : "Active Window"}
                              </span>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(admin.inviteTokenExpiry).toLocaleString()}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500">N/A</span>
                          )}
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-slate-400 text-[11px]">
                          {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "-"}
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            
                            <button
                              onClick={() => handleResendInvite(admin.id)}
                              disabled={actionLoadingId === `resend-${admin.id}`}
                              className="px-2.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800/60 text-[11px] font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                              title="Regenerate 6-char UUID password & fresh 24h link"
                            >
                              {actionLoadingId === `resend-${admin.id}` ? "Sending..." : "📨 Resend Link"}
                            </button>

                            <button
                              onClick={() => handleToggleStatus(admin.id, admin.status)}
                              disabled={actionLoadingId === `toggle-${admin.id}`}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {admin.status === "active" ? "Deactivate" : "Activate"}
                            </button>

                            <button
                              onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                              disabled={actionLoadingId === `delete-${admin.id}`}
                              className="p-1 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400 border border-red-800/40 text-[11px] transition-colors disabled:opacity-50 cursor-pointer"
                              title="Delete Account"
                            >
                              🗑️
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div>
                Showing <span className="font-bold text-slate-200">{admins.length}</span> of{" "}
                <span className="font-bold text-slate-200">{adminPagination.totalItems}</span> records
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={adminPagination.currentPage <= 1}
                  onClick={() => setAdminPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  className="px-3 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <span>
                  Page {adminPagination.currentPage} of {adminPagination.totalPages || 1}
                </span>
                <button
                  disabled={adminPagination.currentPage >= adminPagination.totalPages}
                  onClick={() => setAdminPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  className="px-3 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 2: ASPIRANTS CANDIDATES DIRECTORY ================= */}
        {activeTab === "users" && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl animate-fade-in">
            
            <div className="p-4 sm:p-6 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search aspirants by name, email, target exam..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                />
                <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchUsers}
                  disabled={isUserLoading}
                  className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🔄 Refresh Directory</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Candidate Name & Email</th>
                    <th className="py-3.5 px-4 sm:px-6">Target Exam</th>
                    <th className="py-3.5 px-4 sm:px-6">Category & State</th>
                    <th className="py-3.5 px-4 sm:px-6">Verification</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {isUserLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        <div className="inline-block w-6 h-6 border-2 border-slate-600 border-t-red-500 rounded-full animate-spin mb-2" />
                        <div>Loading registered candidates...</div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        <div className="text-2xl mb-2">👥</div>
                        <div>No candidates found in directory.</div>
                      </td>
                    </tr>
                  ) : (
                    users.map((aspirant) => (
                      <tr key={aspirant.id} className="hover:bg-slate-800/40 transition-colors">
                        
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-slate-700">
                              {aspirant.name ? aspirant.name.charAt(0) : "U"}
                            </div>
                            <div>
                              <div className="font-bold text-slate-200">{aspirant.name}</div>
                              <div className="text-[11px] text-slate-400">{aspirant.email}</div>
                              {aspirant.phone && (
                                <div className="text-[10px] text-slate-500 font-mono">📞 {aspirant.phone}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 sm:px-6">
                          <span className="font-semibold text-blue-400">
                            {aspirant.targetExam || "Rajasthan General"}
                          </span>
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-slate-300">
                          <div>{aspirant.category || "General"}</div>
                          <div className="text-[10px] text-slate-500">{aspirant.state || "Rajasthan"}</div>
                        </td>

                        <td className="py-4 px-4 sm:px-6">
                          {aspirant.isVerified ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                              ✓ Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                              ⏳ Unverified
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-right">
                          <button
                            onClick={() => handleDeleteUser(aspirant.id, aspirant.name)}
                            disabled={actionLoadingId === `delete-user-${aspirant.id}`}
                            className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400 border border-red-800/40 text-[11px] transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div>
                Showing <span className="font-bold text-slate-200">{users.length}</span> of{" "}
                <span className="font-bold text-slate-200">{userPagination.totalItems}</span> aspirants
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={userPagination.currentPage <= 1}
                  onClick={() => setUserPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  className="px-3 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <span>
                  Page {userPagination.currentPage} of {userPagination.totalPages || 1}
                </span>
                <button
                  disabled={userPagination.currentPage >= userPagination.totalPages}
                  onClick={() => setUserPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  className="px-3 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 3: SYSTEM SECURITY ================= */}
        {activeTab === "system" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center text-lg border border-blue-800">
                  🔒
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">24-Hour Token & Password Protocol</h3>
                  <p className="text-xs text-slate-400">Invitation lifecycle security parameters</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-bold text-white">1. Initial Password Generation</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    A 6-character uppercase alphanumeric password is generated using UUID slice (<code className="text-red-400">crypto.randomUUID()</code>) and hashed with Bcrypt before DB insertion.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-bold text-white">2. 24-Hour Expiration Window</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    The token is stamped with <code className="text-amber-400">Date.now() + 24 * 60 * 60 * 1000</code>. Expired tokens cannot be submitted for password setup.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-bold text-white">3. Immediate Invalidation on Setup</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    As soon as the admin submits their new password, <code className="text-emerald-400">inviteToken = null</code> and <code className="text-emerald-400">inviteTokenExpiry = null</code> to permanently disable the link.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center text-lg border border-emerald-800">
                  ⚡
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Platform Health & Status</h3>
                  <p className="text-xs text-slate-400">Real-time service telemetry</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Database Connection:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Sequelize MySQL (Active)
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Transactional Email Service:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Nodemailer Gmail SMTP (Active)
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Token Security:</span>
                  <span className="text-blue-400 font-bold">
                    JWT HMAC-SHA256 (7-day Session)
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Server Time:</span>
                  <span className="text-slate-200 font-mono">
                    {new Date().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* CREATE ADMIN / SUPERADMIN MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative text-slate-100">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-950 text-red-400 border border-red-800 flex items-center justify-center text-lg">
                  🛡️
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Create New Administrative Account</h2>
                  <p className="text-xs text-slate-400">Select role, 6-char UUID password & 24-hour setup link</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {createdAdminSuccess ? (
              <div className="py-6 space-y-4 animate-scale-up">
                <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm mb-1">
                    <span>✅</span> Account Created Successfully!
                  </div>
                  <p className="text-xs text-emerald-200/80">
                    An email with the 24-hour activation link has been dispatched to <strong>{createdAdminSuccess.admin.email}</strong>.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-bold">Assigned Role:</span>
                    <div className="font-bold text-white uppercase">{createdAdminSuccess.admin.role}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-bold">Generated 6-Char UUID Password:</span>
                    <div className="font-mono text-base font-bold text-amber-400 tracking-wider">
                      {createdAdminSuccess.tempPassword}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-bold">24-Hour Setup Link:</span>
                    <div className="text-[11px] font-mono text-blue-400 break-all select-all bg-slate-900 p-2 rounded border border-slate-800 mt-1">
                      {createdAdminSuccess.setupLink}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setCreatedAdminSuccess(null);
                      setIsCreateModalOpen(false);
                    }}
                    className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateAdmin} className="py-6 space-y-4">
                
                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                    Account Role Designation <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`p-3 rounded-xl border flex flex-col cursor-pointer transition-all ${
                      createFormData.role === "admin"
                        ? "border-blue-500 bg-blue-950/40 text-white"
                        : "border-slate-800 bg-slate-950 text-slate-400"
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="role"
                          value="admin"
                          checked={createFormData.role === "admin"}
                          onChange={() => setCreateFormData(prev => ({ ...prev, role: "admin" }))}
                          className="accent-blue-500"
                        />
                        <span className="font-bold text-xs">Standard Admin</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1">Staff management</span>
                    </label>

                    <label className={`p-3 rounded-xl border flex flex-col cursor-pointer transition-all ${
                      createFormData.role === "superadmin"
                        ? "border-red-500 bg-red-950/40 text-white"
                        : "border-slate-800 bg-slate-950 text-slate-400"
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="role"
                          value="superadmin"
                          checked={createFormData.role === "superadmin"}
                          onChange={() => setCreateFormData(prev => ({ ...prev, role: "superadmin" }))}
                          className="accent-red-500"
                        />
                        <span className="font-bold text-xs">Root SuperAdmin</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1">Full authority</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="e.g. admin@rajexamvault.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={createFormData.phone}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="e.g. +91 9876543210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-3.5 text-xs text-blue-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-blue-200">
                    <span>⚡ Automated Credentials & Expiry:</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    • An initial <strong>6-character password</strong> will be generated using UUID slice.<br />
                    • A secure activation link valid for <strong>24 hours</strong> will be emailed immediately.<br />
                    • When the admin sets their password, the link is permanently deactivated.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-5 py-2.5 rounded-xl bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-red-900/30 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isCreating ? "Generating & Sending..." : "Create & Send 24h Invite 🚀"}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
