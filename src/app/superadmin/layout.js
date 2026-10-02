export const metadata = {
  title: "SuperAdmin Control Center - Raj Exam Vault",
  description: "Root administrative suite for managing platform staff, aspirant profiles, and exam vault operations.",
};

export default function SuperAdminLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 selection:bg-red-600 selection:text-white">
      {children}
    </div>
  );
}
