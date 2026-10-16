export const metadata = {
  title: "System Monitoring — Raj Exam Vault",
  description: "Real-time platform intelligence: API logs, user sessions, server health, database metrics, and performance analytics for SuperAdmin.",
};

export default function MonitoringLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100">
      {children}
    </div>
  );
}
