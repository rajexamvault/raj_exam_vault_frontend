"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import monitoringService from "@/services/monitoringService";

// ─── Icons (inline SVG to avoid external deps) ────────────────────────────────
const Icon = {
  cpu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
      <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
      <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
      <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
      <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
    </svg>
  ),
  memory: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9z"/>
      <path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01"/>
    </svg>
  ),
  disk: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  ),
  activity: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  server: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
      <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
    </svg>
  ),
  database: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  ),
  logs: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  api: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  session: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  refresh: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  slowApi: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  back: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
};

// ─── Utility helpers ──────────────────────────────────────────────────────────
function formatDuration(seconds) {
  if (!seconds) return "0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function statusBadge(code) {
  if (code >= 500) return "bg-red-500/20 text-red-400 border border-red-500/30";
  if (code >= 400) return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
  if (code >= 300) return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
  return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
}

function methodColor(method) {
  const map = {
    GET: "text-emerald-400 bg-emerald-500/10",
    POST: "text-blue-400 bg-blue-500/10",
    PUT: "text-yellow-400 bg-yellow-500/10",
    PATCH: "text-purple-400 bg-purple-500/10",
    DELETE: "text-red-400 bg-red-500/10"
  };
  return map[method] || "text-slate-400 bg-slate-500/10";
}

function GaugeBar({ percent, color = "from-violet-500 to-cyan-500", label, value }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-semibold">{value}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <div className="text-right text-xs text-slate-500">{percent?.toFixed(1)}%</div>
    </div>
  );
}

function StatCard({ title, value, sub, icon: IconComp, accent = "violet", trend }) {
  const accents = {
    violet: "from-violet-500/20 to-violet-600/5 border-violet-500/20",
    cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20",
    emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
    orange: "from-orange-500/20 to-orange-600/5 border-orange-500/20",
    red: "from-red-500/20 to-red-600/5 border-red-500/20",
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20"
  };
  const iconAccents = {
    violet: "text-violet-400", cyan: "text-cyan-400", emerald: "text-emerald-400",
    orange: "text-orange-400", red: "text-red-400", blue: "text-blue-400"
  };
  return (
    <div className={`relative bg-gradient-to-br ${accents[accent]} border rounded-2xl p-5 overflow-hidden`}>
      <div className="absolute top-4 right-4">
        <div className={`${iconAccents[accent]} opacity-80`}><IconComp /></div>
      </div>
      <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">{title}</p>
      <p className="text-3xl font-black text-white mb-1">{value ?? "—"}</p>
      {sub && <p className="text-slate-500 text-xs">{sub}</p>}
      {trend !== undefined && (
        <p className={`text-xs mt-1 font-medium ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
        </p>
      )}
    </div>
  );
}

function SectionHeader({ title, icon: IconComp, actions }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400">
          <IconComp />
        </div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
          : "text-slate-400 hover:text-white hover:bg-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>
  );
}

// ─── Sub-sections ─────────────────────────────────────────────────────────────

function OverviewSection({ stats, realtime, loading }) {
  if (loading) return <Spinner />;
  const s = stats?.data || {};
  const r = realtime?.data || {};

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Requests" value={s.requests?.total?.toLocaleString()} sub="All time" icon={Icon.api} accent="violet" />
        <StatCard title="Last 24h" value={s.requests?.last24h?.toLocaleString()} sub={`Error rate: ${s.requests?.errorRate24h ?? 0}%`} icon={Icon.activity} accent="cyan" />
        <StatCard title="Avg Response" value={`${s.requests?.avgResponseMs ?? 0}ms`} sub="Last 24 hours" icon={Icon.slowApi} accent="blue" />
        <StatCard title="Active Sessions" value={r.activeSessions ?? s.sessions?.active} sub={`${s.sessions?.total7d ?? 0} this week`} icon={Icon.session} accent="emerald" />
      </div>

      {/* System Resource Gauges */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
        <SectionHeader title="System Resources" icon={Icon.server} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GaugeBar
            label="CPU Usage"
            value={`${r.cpu?.usagePercent ?? s.system?.cpuPercent ?? 0}%`}
            percent={r.cpu?.usagePercent ?? s.system?.cpuPercent ?? 0}
            color="from-violet-500 to-cyan-500"
          />
          <GaugeBar
            label="Memory Usage"
            value={r.memory ? `${r.memory.used} / ${r.memory.total}` : `${s.system?.memoryPercent ?? 0}%`}
            percent={r.memory?.usedPercent ?? s.system?.memoryPercent ?? 0}
            color="from-blue-500 to-violet-500"
          />
          <GaugeBar
            label="Disk Usage"
            value={r.disk ? `${r.disk.used} / ${r.disk.total}` : "—"}
            percent={r.disk?.usedPercent ?? 0}
            color="from-emerald-500 to-cyan-500"
          />
        </div>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Server Uptime", value: s.system?.uptime ?? "—" },
            { label: "Process Uptime", value: s.system?.processUptime ?? "—" },
            { label: "Heap Used", value: r.process?.heapUsed ?? "—" },
            { label: "Requests/5min", value: r.requests5m ?? "—" }
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-800/50 rounded-xl p-3 text-center">
              <p className="text-slate-500 text-xs mb-1">{label}</p>
              <p className="text-white font-bold text-sm">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ServerInfoSection({ data, loading }) {
  if (loading) return <Spinner />;
  const d = data?.data || {};
  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-800/60 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="text-white text-sm font-medium font-mono">{value ?? "—"}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
        <SectionHeader title="Server Info" icon={Icon.server} />
        <InfoRow label="Hostname" value={d.server?.hostname} />
        <InfoRow label="Platform" value={`${d.server?.platform} (${d.server?.arch})`} />
        <InfoRow label="OS Type" value={`${d.server?.osType} ${d.server?.osRelease}`} />
        <InfoRow label="Node.js" value={d.server?.nodeVersion} />
        <InfoRow label="PID" value={d.server?.pid} />
        <InfoRow label="Environment" value={d.server?.env} />
        <InfoRow label="Server Uptime" value={d.server?.uptime} />
        <InfoRow label="Process Uptime" value={d.server?.processUptime} />
        <InfoRow label="Started At" value={d.server?.startedAt ? new Date(d.server.startedAt).toLocaleString() : "—"} />
      </div>

      <div className="space-y-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <SectionHeader title="CPU" icon={Icon.cpu} />
          <InfoRow label="Model" value={d.cpu?.model} />
          <InfoRow label="Cores" value={d.cpu?.cores} />
          <InfoRow label="Speed" value={d.cpu?.speed} />
          <InfoRow label="Usage" value={`${d.cpu?.usagePercent}%`} />
          {d.cpu?.loadAvg && (
            <InfoRow label="Load Avg (1/5/15m)" value={d.cpu.loadAvg.join(" / ")} />
          )}
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <SectionHeader title="Memory" icon={Icon.memory} />
          <InfoRow label="Total" value={d.memory?.total} />
          <InfoRow label="Used" value={d.memory?.used} />
          <InfoRow label="Free" value={d.memory?.free} />
          <InfoRow label="Used %" value={`${d.memory?.usedPercent}%`} />
          <InfoRow label="Heap Used" value={d.process?.heapUsed} />
          <InfoRow label="Heap Total" value={d.process?.heapTotal} />
          <InfoRow label="RSS" value={d.process?.rss} />
        </div>
      </div>
    </div>
  );
}

function DatabaseSection({ data, loading }) {
  const [tableSearch, setTableSearch] = useState("");
  if (loading) return <Spinner />;
  const d = data?.data || {};

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-800/60 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="text-white text-sm font-medium font-mono">{value ?? "—"}</span>
    </div>
  );

  const filteredTables = (d.tables || []).filter(t =>
    t.tableName.toLowerCase().includes(tableSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* DB Overview KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Database Size"
          value={`${d.totalSizeMB ?? 0} MB`}
          sub={`Data: ${d.totalDataSizeMB ?? 0} MB | Index: ${d.totalIndexSizeMB ?? 0} MB`}
          icon={Icon.database}
          accent="violet"
        />
        <StatCard
          title="Total Tables & Rows"
          value={`${d.totalTables ?? 0} tables`}
          sub={`${(d.totalRows || 0).toLocaleString()} total records`}
          icon={Icon.server}
          accent="cyan"
        />
        <StatCard
          title="Ping Latency"
          value={d.pingLatencyMs !== undefined ? `${d.pingLatencyMs}ms` : "—"}
          sub={`Status: ${d.status || 'connected'}`}
          icon={Icon.activity}
          accent="emerald"
        />
        <StatCard
          title="Buffer Pool Hit"
          value={`${d.bufferPoolHitRatio ?? 100}%`}
          sub={`Uptime: ${d.uptime || '—'}`}
          icon={Icon.memory}
          accent="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <SectionHeader title="Database Server Engine" icon={Icon.database} />
          <InfoRow label="Status" value={
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${d.status === "connected" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400"}`}>
              {d.status}
            </span>
          } />
          <InfoRow label="Host & Port" value={`${d.host}:${d.port}`} />
          <InfoRow label="Database Name" value={d.name} />
          <InfoRow label="Engine / Version" value={`${d.dialect} (${d.version || '8.0'})`} />
          <InfoRow label="Server Uptime" value={d.uptime} />
          <InfoRow label="Connection Pool" value={`${d.poolSize?.min || 0} min / ${d.poolSize?.max || 10} max`} />
          <InfoRow label="Ping Latency" value={`${d.pingLatencyMs ?? 0}ms`} />
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <SectionHeader title="Connections & Query Performance" icon={Icon.activity} />
          <InfoRow label="Total Connections" value={d.connections?.total?.toLocaleString()} />
          <InfoRow label="Active Connected Threads" value={d.connections?.active} />
          <InfoRow label="Running Queries" value={d.connections?.running} />
          <InfoRow label="Max Peak Connections" value={d.connections?.maxUsed} />
          <InfoRow label="Aborted Connections" value={d.connections?.aborted || 0} />
          <InfoRow label="Total Queries Executed" value={d.queries?.total?.toLocaleString()} />
          <InfoRow label="Slow Queries Detected" value={d.queries?.slow || 0} />
          <InfoRow label="Network I/O" value={`RX: ${d.traffic?.receivedBytes || '—'} | TX: ${d.traffic?.sentBytes || '—'}`} />
        </div>
      </div>

      {/* Table Sizes & Schema Intelligence */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <SectionHeader title={`Database Tables (${filteredTables.length} / ${d.totalTables || 0})`} icon={Icon.database} />
          <input
            type="text"
            value={tableSearch}
            onChange={e => setTableSearch(e.target.value)}
            placeholder="Search tables (e.g. users, exams, api_logs)..."
            className="w-full sm:w-72 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        {filteredTables.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  {["Table Name", "Records (Rows)", "Data Size", "Index Size", "Total Size", "Engine", "Updated"].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-slate-500 text-xs uppercase tracking-wider font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTables.map((t, i) => (
                  <tr key={i} className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 text-sm text-violet-300 font-mono font-medium">{t.tableName}</td>
                    <td className="py-2.5 px-3 text-sm text-white font-semibold">{(parseInt(t.rowCount) || 0).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-sm text-slate-400 font-mono">{t.dataSizeMB ?? 0} MB</td>
                    <td className="py-2.5 px-3 text-sm text-slate-400 font-mono">{t.indexSizeMB ?? 0} MB</td>
                    <td className="py-2.5 px-3 text-sm text-cyan-400 font-mono font-bold">{t.sizeMB ?? 0} MB</td>
                    <td className="py-2.5 px-3 text-xs text-slate-400">{t.engine || 'InnoDB'}</td>
                    <td className="py-2.5 px-3 text-xs text-slate-500 whitespace-nowrap">{t.updateTime ? new Date(t.updateTime).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-slate-500 text-sm">No tables match your search.</div>
        )}
      </div>
    </div>
  );
}

function ApiLogsSection() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", method: "", statusCode: "", minResponseTime: "" });
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await monitoringService.getApiLogs({ page, limit: 50, ...filters });
      setLogs(res.data || []);
      setPagination(res.pagination || {});
    } catch (_) {}
    setLoading(false);
  }, [page, filters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="API Request Logs"
        icon={Icon.api}
        actions={
          <button onClick={fetchLogs} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs transition-colors">
            <Icon.refresh /> Refresh
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          placeholder="Search URL..."
          className="flex-1 min-w-[200px] bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
        />
        <select
          value={filters.method}
          onChange={e => setFilters(f => ({ ...f, method: e.target.value }))}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
        >
          <option value="">All Methods</option>
          {["GET", "POST", "PUT", "PATCH", "DELETE"].map(m => <option key={m}>{m}</option>)}
        </select>
        <select
          value={filters.statusCode}
          onChange={e => setFilters(f => ({ ...f, statusCode: e.target.value }))}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
        >
          <option value="">All Status</option>
          <option value="200">200 OK</option>
          <option value="400">400 Bad Req</option>
          <option value="401">401 Unauth</option>
          <option value="403">403 Forbidden</option>
          <option value="404">404 Not Found</option>
          <option value="500">500 Error</option>
        </select>
        <input
          value={filters.minResponseTime}
          onChange={e => setFilters(f => ({ ...f, minResponseTime: e.target.value }))}
          placeholder="Min ms (e.g. 500)"
          type="number"
          className="w-36 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
        />
        <button
          onClick={() => { setFilters({ search: "", method: "", statusCode: "", minResponseTime: "" }); setPage(1); }}
          className="px-3 py-2 rounded-xl bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
        >
          Clear
        </button>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  {["Method", "URL / Route", "Status", "Time (ms)", "User", "IP", "When"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${methodColor(log.method)}`}>{log.method}</span>
                    </td>
                    <td className="py-2.5 px-4 max-w-xs">
                      <div className="text-white text-xs font-mono truncate" title={log.url}>{log.route || log.url}</div>
                      {log.route && log.url !== log.route && (
                        <div className="text-slate-600 text-xs truncate" title={log.url}>{log.url}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(log.statusCode)}`}>{log.statusCode}</span>
                    </td>
                    <td className={`py-2.5 px-4 font-mono text-xs ${log.responseTimeMs > 1000 ? "text-red-400" : log.responseTimeMs > 500 ? "text-orange-400" : "text-emerald-400"}`}>
                      {log.responseTimeMs?.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 text-xs">{log.userName || log.userId || "—"}</td>
                    <td className="py-2.5 px-4 text-slate-500 text-xs font-mono">{log.ip}</td>
                    <td className="py-2.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={7} className="py-12 text-center text-slate-600">No logs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
            <p className="text-slate-500 text-xs">{pagination.totalItems?.toLocaleString()} total logs</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs disabled:opacity-40">Prev</button>
              <span className="px-3 py-1 text-slate-400 text-xs">{page} / {pagination.totalPages}</span>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages} className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ApiAnalyticsSection() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState("24h");
  const [loading, setLoading] = useState(true);
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState("mostUsed");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await monitoringService.getApiAnalytics(period);
      setData(res.data);
    } catch (_) {}
    setLoading(false);
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const RouteTable = ({ routes, cols, title }) => (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className="text-xs text-slate-500 font-mono">{(routes || []).length} endpoints</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50">
              {cols.map(c => <th key={c} className="text-left py-3 px-4 text-slate-500 text-xs uppercase tracking-wider font-semibold">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {(routes || []).map((r, i) => (
              <tr key={i} className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${methodColor(r.method)}`}>{r.method}</span>
                </td>
                <td className="py-2.5 px-4 font-mono text-xs text-violet-300 max-w-sm truncate" title={r.route}>{r.route}</td>
                {r.count !== undefined && <td className="py-2.5 px-4 text-white font-semibold">{Number(r.count).toLocaleString()}</td>}
                {r.avgResponseMs !== undefined && (
                  <td className={`py-2.5 px-4 font-mono text-xs font-bold ${r.avgResponseMs > 500 ? "text-red-400" : r.avgResponseMs > 200 ? "text-orange-400" : "text-emerald-400"}`}>
                    {r.avgResponseMs?.toFixed(1)}ms
                  </td>
                )}
                {r.minResponseMs !== undefined && (
                  <td className="py-2.5 px-4 font-mono text-xs text-slate-400">
                    {r.minResponseMs?.toFixed(1)}ms
                  </td>
                )}
                {r.maxResponseMs !== undefined && (
                  <td className="py-2.5 px-4 font-mono text-xs text-amber-400">
                    {r.maxResponseMs?.toFixed(1)}ms
                  </td>
                )}
                {r.errorCount !== undefined && <td className="py-2.5 px-4 text-red-400 font-semibold">{r.errorCount}</td>}
              </tr>
            ))}
            {!(routes || []).length && <tr><td colSpan={cols.length} className="py-10 text-center text-slate-600 text-sm">No data for this period</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const methodColors = { GET: "#34d399", POST: "#60a5fa", PUT: "#fbbf24", PATCH: "#c084fc", DELETE: "#f87171" };
  const latDist = data?.latencyDistribution;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionHeader title="API Analytics & Delay Intelligence" icon={Icon.activity} />
        <div className="flex gap-2">
          {["1h", "24h", "7d", "30d"].map(p => (
            <TabBtn key={p} active={period === p} onClick={() => setPeriod(p)}>{p}</TabBtn>
          ))}
        </div>
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* Latency & API Delay Distribution Strip */}
          {latDist && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400">
                    <Icon.slowApi />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">API Call Delay & Latency Distribution</h3>
                    <p className="text-xs text-slate-500">Breakdown of server response execution times</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400">Avg Delay: <strong className="text-emerald-400 font-mono text-sm">{latDist.avgDelayMs}ms</strong></span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">Min: <strong className="text-cyan-400 font-mono">{latDist.minDelayMs}ms</strong></span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">Max: <strong className="text-rose-400 font-mono">{latDist.maxDelayMs}ms</strong></span>
                </div>
              </div>

              {/* Multi-segment delay progress bar */}
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden flex">
                {(latDist.buckets || []).map((b, idx) => (
                  <div
                    key={idx}
                    title={`${b.label}: ${b.count} (${b.pct}%)`}
                    style={{ width: `${b.pct}%` }}
                    className={`h-full transition-all duration-700 ${
                      b.color === 'emerald' ? 'bg-emerald-500' :
                      b.color === 'blue' ? 'bg-blue-500' :
                      b.color === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  />
                ))}
              </div>

              {/* Latency Bucket Legend Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(latDist.buckets || []).map((b, idx) => (
                  <div key={idx} className="bg-slate-800/40 border border-slate-800 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        b.color === 'emerald' ? 'bg-emerald-500' :
                        b.color === 'blue' ? 'bg-blue-500' :
                        b.color === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                      <span className="text-slate-400 text-xs font-medium">{b.label}</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-white font-bold text-base">{b.count.toLocaleString()}</span>
                      <span className="text-slate-500 text-xs font-semibold">{b.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Method + Status breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">HTTP Methods</h3>
              <div className="space-y-3">
                {(data?.methodBreakdown || []).map(m => {
                  const total = (data?.methodBreakdown || []).reduce((a, b) => a + b.count, 0);
                  const pct = total ? ((m.count / total) * 100).toFixed(1) : 0;
                  return (
                    <div key={m.method} className="flex items-center gap-3">
                      <span className={`w-14 text-center px-1.5 py-0.5 rounded text-xs font-bold font-mono ${methodColor(m.method)}`}>{m.method}</span>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: methodColors[m.method] || "#8b5cf6" }} />
                      </div>
                      <span className="text-white text-xs font-semibold w-16 text-right">{m.count.toLocaleString()}</span>
                      <span className="text-slate-500 text-xs w-10 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Status Codes</h3>
              <div className="space-y-2">
                {(data?.statusBreakdown || []).map(s => {
                  const total = (data?.statusBreakdown || []).reduce((a, b) => a + b.count, 0);
                  const pct = total ? ((s.count / total) * 100).toFixed(1) : 0;
                  const color = s.statusCode >= 500 ? "#f87171" : s.statusCode >= 400 ? "#fb923c" : s.statusCode >= 300 ? "#fbbf24" : "#34d399";
                  return (
                    <div key={s.statusCode} className="flex items-center gap-3">
                      <span className={`text-xs font-semibold font-mono px-2 py-0.5 rounded ${statusBadge(s.statusCode)}`}>{s.statusCode}</span>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                      <span className="text-white text-xs font-semibold">{s.count.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Route tables navigation */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "mostUsed", label: "🔥 Most Used APIs" },
              { id: "leastUsed", label: "📉 Less Used APIs" },
              { id: "slowest", label: "🐢 Slowest APIs (Delay)" },
              { id: "errors", label: "⚠️ Error-Prone Routes" }
            ].map(t => (
              <TabBtn key={t.id} active={activeAnalyticsTab === t.id} onClick={() => setActiveAnalyticsTab(t.id)}>{t.label}</TabBtn>
            ))}
          </div>

          {activeAnalyticsTab === "mostUsed" && (
            <RouteTable
              title="Most Used APIs (Ranked by Total Hits)"
              routes={data?.mostUsedRoutes}
              cols={["Method", "API Endpoint Route", "Total Hits", "Avg Delay", "Min", "Max"]}
            />
          )}
          {activeAnalyticsTab === "leastUsed" && (
            <RouteTable
              title="Less Used APIs (Lowest Frequency / Underutilized)"
              routes={data?.leastUsedRoutes}
              cols={["Method", "API Endpoint Route", "Total Hits", "Avg Delay"]}
            />
          )}
          {activeAnalyticsTab === "slowest" && (
            <RouteTable
              title="Slowest APIs (Highest Latency Delay)"
              routes={data?.slowestRoutes}
              cols={["Method", "API Endpoint Route", "Calls", "Avg Delay", "Max Delay"]}
            />
          )}
          {activeAnalyticsTab === "errors" && (
            <RouteTable
              title="Error-Prone APIs (4xx & 5xx Failures)"
              routes={data?.errorRoutes}
              cols={["Method", "API Endpoint Route", "Errors"]}
            />
          )}
        </>
      )}
    </div>
  );
}

function SlowApisSection() {
  const [data, setData] = useState([]);
  const [threshold, setThreshold] = useState(500);
  const [period, setPeriod] = useState("24h");
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await monitoringService.getSlowApis({ threshold, period });
      setData(res.data || []);
    } catch (_) {}
    setLoading(false);
  }, [threshold, period]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionHeader title="Slow API Detector" icon={Icon.slowApi} />
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Threshold:</span>
            <input
              type="number"
              value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              className="w-24 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500"
            />
            <span className="text-slate-500 text-sm">ms</span>
          </div>
          <div className="flex gap-1">
            {["1h", "24h", "7d", "30d"].map(p => (
              <TabBtn key={p} active={period === p} onClick={() => setPeriod(p)}>{p}</TabBtn>
            ))}
          </div>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <p className="text-slate-400 text-sm">{data.length} slow requests found above {threshold}ms</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Method", "URL", "Response (ms)", "Status", "User", "IP", "Time"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-slate-500 text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map(r => (
                  <tr key={r.id} className="border-b border-slate-800/40 hover:bg-slate-800/30">
                    <td className="py-2.5 px-4"><span className={`px-1.5 py-0.5 rounded text-xs font-bold font-mono ${methodColor(r.method)}`}>{r.method}</span></td>
                    <td className="py-2.5 px-4 font-mono text-xs text-violet-300 max-w-xs truncate">{r.route || r.url}</td>
                    <td className="py-2.5 px-4 font-mono text-xs text-red-400 font-bold">{r.responseTimeMs?.toFixed(1)}</td>
                    <td className="py-2.5 px-4"><span className={`px-2 py-0.5 rounded text-xs ${statusBadge(r.statusCode)}`}>{r.statusCode}</span></td>
                    <td className="py-2.5 px-4 text-slate-400 text-xs">{r.userName || r.userId || "anon"}</td>
                    <td className="py-2.5 px-4 text-slate-500 text-xs font-mono">{r.ip}</td>
                    <td className="py-2.5 px-4 text-slate-500 text-xs whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {!data.length && <tr><td colSpan={7} className="py-12 text-center text-slate-600">No slow APIs detected 🎉</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SessionsSection() {
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [page, setPage] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await monitoringService.getUserSessions({ page, limit: 50, ...filters });
      setSessions(res.data || []);
      setPagination(res.pagination || {});
    } catch (_) {}
    setLoading(false);
  }, [page, filters]);

  useEffect(() => {
    setLoading(true);
    fetchSessions();
  }, [fetchSessions]);

  // Auto-refresh sessions every 10 seconds to update live stay duration
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchSessions]);

  const sessionStatusBadge = (status, isOnline) => {
    if (isOnline) {
      return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40";
    }
    if (status === "active") return "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30";
    if (status === "logged_out") return "bg-slate-500/20 text-slate-400 border border-slate-500/30";
    return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
  };

  const onlineCount = sessions.filter(s => s.isOnline).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <SectionHeader title="User Sessions & Website Stay Time" icon={Icon.session} />
          <p className="text-xs text-slate-500 -mt-3">Tracks who logged in, dwell time, pages visited, and live online presence</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              autoRefresh ? 'bg-violet-600/20 text-violet-300 border-violet-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            {autoRefresh ? 'Live Updating (10s)' : 'Live Paused'}
          </button>
          <button
            onClick={fetchSessions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs transition-colors"
          >
            <Icon.refresh /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards for Sessions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
          <p className="text-slate-500 text-xs font-medium">Live Online Now</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-2xl font-black text-emerald-400">{onlineCount}</p>
          </div>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
          <p className="text-slate-500 text-xs font-medium">Active Sessions</p>
          <p className="text-2xl font-black text-cyan-400 mt-1">{sessions.filter(s => s.status === 'active').length}</p>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
          <p className="text-slate-500 text-xs font-medium">Total Sessions Logged</p>
          <p className="text-2xl font-black text-white mt-1">{pagination.totalItems?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
          <p className="text-slate-500 text-xs font-medium">Filter Online</p>
          <button
            onClick={() => setFilters(f => ({ ...f, status: f.status === 'active' ? '' : 'active' }))}
            className="text-xs text-violet-400 hover:underline mt-2 font-semibold block text-left"
          >
            {filters.status === 'active' ? 'Show All Sessions' : 'Filter Online Only →'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          placeholder="Search by student name or email..."
          className="flex-1 min-w-[220px] bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
        />
        <select
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
        >
          <option value="">All Statuses</option>
          <option value="active">Active / Online</option>
          <option value="logged_out">Logged Out</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  {["User Details", "Role", "Login Time", "Stay Duration", "Presence / Status", "Active Page", "Device", "Client IP"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id} className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        {s.isOnline ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" title="Online now" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-600 flex-shrink-0" />
                        )}
                        <div>
                          <div className="text-white text-xs font-bold">{s.userName || "Unknown User"}</div>
                          <div className="text-slate-400 text-xs font-mono">{s.userEmail || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/30">{s.userRole}</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-300 text-xs whitespace-nowrap">{new Date(s.loginAt).toLocaleString()}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-xs whitespace-nowrap">
                      <span className={s.isOnline ? "text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30" : "text-cyan-400"}>
                        ⏱️ {formatDuration(s.durationSeconds)}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${sessionStatusBadge(s.status, s.isOnline)}`}>
                        {s.isOnline ? "🟢 Live Online" : s.status === 'active' ? "Idle (Active)" : s.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-xs text-violet-300 max-w-[160px] truncate" title={s.currentPage || '/'}>
                      {s.currentPage || "/"}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 text-xs whitespace-nowrap">{s.device || "Desktop"}</td>
                    <td className="py-2.5 px-4 text-slate-500 text-xs font-mono whitespace-nowrap">{s.ip}</td>
                  </tr>
                ))}
                {!sessions.length && <tr><td colSpan={8} className="py-12 text-center text-slate-600">No sessions found</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
            <p className="text-slate-500 text-xs">{pagination.totalItems?.toLocaleString()} total sessions recorded</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs disabled:opacity-40">Prev</button>
              <span className="px-3 py-1 text-slate-400 text-xs">{page} / {pagination.totalPages || 1}</span>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages} className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UserActivitySection() {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    monitoringService.getUserActivity(period)
      .then(res => setData(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionHeader title="User Activity" icon={Icon.users} />
        <div className="flex gap-1">
          {["24h", "7d", "30d"].map(p => (
            <TabBtn key={p} active={period === p} onClick={() => setPeriod(p)}>{p}</TabBtn>
          ))}
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  {["User", "Role", "Total Requests", "Avg Response", "Sessions", "Total Time", "Avg Session", "Last Active"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((u, i) => (
                  <tr key={u.userId} className="border-b border-slate-800/40 hover:bg-slate-800/30">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold flex-shrink-0">
                          {(u.userName || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white text-xs font-semibold">{u.userName || "Unknown"}</div>
                          <div className="text-slate-600 text-xs">#{u.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-violet-500/20 text-violet-400">{u.userRole}</span>
                    </td>
                    <td className="py-2.5 px-4 text-white font-bold">{u.totalRequests.toLocaleString()}</td>
                    <td className={`py-2.5 px-4 font-mono text-xs ${u.avgResponseMs > 1000 ? "text-red-400" : "text-emerald-400"}`}>{u.avgResponseMs}ms</td>
                    <td className="py-2.5 px-4 text-cyan-400 font-semibold">{u.sessionCount}</td>
                    <td className="py-2.5 px-4 text-violet-400 text-xs">{formatDuration(u.totalTimeSpentSeconds)}</td>
                    <td className="py-2.5 px-4 text-slate-400 text-xs">{formatDuration(u.avgSessionSeconds)}</td>
                    <td className="py-2.5 px-4 text-slate-500 text-xs whitespace-nowrap">{u.lastActivity ? new Date(u.lastActivity).toLocaleString() : "—"}</td>
                  </tr>
                ))}
                {!data.length && <tr><td colSpan={8} className="py-12 text-center text-slate-600">No user activity data</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function LogFilesSection() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [logContent, setLogContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [lines, setLines] = useState(100);
  const [levelFilter, setLevelFilter] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    monitoringService.getLogFiles()
      .then(res => setFiles(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadFile = useCallback(async (filename) => {
    setSelectedFile(filename);
    setContentLoading(true);
    try {
      const res = await monitoringService.readLogFile(filename, lines);
      setLogContent(res.data || []);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (_) {}
    setContentLoading(false);
  }, [lines]);

  const filteredContent = levelFilter
    ? logContent.filter(l => l.level === levelFilter || (l.raw && l.raw.includes(levelFilter)))
    : logContent;

  const levelBadge = (level) => {
    const map = { error: "text-red-400", warn: "text-orange-400", info: "text-cyan-400", http: "text-violet-400", debug: "text-slate-400" };
    return map[level] || "text-slate-400";
  };

  const fileTypeBadge = (type) => {
    const map = { error: "bg-red-500/20 text-red-400", api: "bg-violet-500/20 text-violet-400", combined: "bg-cyan-500/20 text-cyan-400" };
    return map[type] || "bg-slate-500/20 text-slate-400";
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Log Files" icon={Icon.logs} />

      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* File List */}
          <div className="space-y-2">
            <p className="text-slate-500 text-xs uppercase tracking-wider px-1">Available Log Files</p>
            {files.map(f => (
              <button
                key={f.name}
                onClick={() => loadFile(f.name)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  selectedFile === f.name
                    ? "bg-violet-600/20 border-violet-500/50 text-white"
                    : "bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">{f.name}</span>
                  <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${fileTypeBadge(f.type)}`}>{f.type}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{f.size}</span>
                  <span>{new Date(f.modified).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
            {!files.length && (
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 text-center text-slate-600 text-sm">
                No log files yet. Logs will appear after the first requests.
              </div>
            )}
          </div>

          {/* Log Content */}
          <div className="lg:col-span-2">
            {selectedFile ? (
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden h-[600px] flex flex-col">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between flex-shrink-0 flex-wrap gap-2">
                  <p className="text-sm font-semibold text-white truncate">{selectedFile}</p>
                  <div className="flex items-center gap-2">
                    <select
                      value={levelFilter}
                      onChange={e => setLevelFilter(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                    >
                      <option value="">All Levels</option>
                      {["error", "warn", "info", "http", "debug"].map(l => <option key={l}>{l}</option>)}
                    </select>
                    <select
                      value={lines}
                      onChange={e => setLines(Number(e.target.value))}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                    >
                      {[50, 100, 200, 500].map(n => <option key={n}>{n} lines</option>)}
                    </select>
                    <button onClick={() => loadFile(selectedFile)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs transition-colors">
                      <Icon.refresh /> Reload
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto font-mono text-xs p-4 space-y-1">
                  {contentLoading ? <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" /></div> : (
                    <>
                      {filteredContent.map((line, i) => (
                        <div key={i} className="flex gap-3 hover:bg-slate-800/30 rounded px-1 py-0.5">
                          {line.timestamp && <span className="text-slate-600 flex-shrink-0">{line.timestamp}</span>}
                          {line.level && <span className={`flex-shrink-0 w-10 ${levelBadge(line.level)}`}>[{line.level.slice(0, 4)}]</span>}
                          <span className="text-slate-300 break-all">{line.message || line.raw || JSON.stringify(line)}</span>
                          {line.method && <span className={`flex-shrink-0 text-xs ${methodColor(line.method)}`}>{line.method}</span>}
                          {line.status && <span className={`flex-shrink-0 text-xs ${statusBadge(parseInt(line.status))}`}>{line.status}</span>}
                        </div>
                      ))}
                      <div ref={bottomRef} />
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-12 text-center">
                <div className="text-slate-600 text-4xl mb-3">📂</div>
                <p className="text-slate-500">Select a log file to view its contents</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TABS Config ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview", icon: Icon.activity },
  { id: "server", label: "Server", icon: Icon.server },
  { id: "database", label: "Database", icon: Icon.database },
  { id: "api-logs", label: "API Logs", icon: Icon.api },
  { id: "analytics", label: "Analytics", icon: Icon.activity },
  { id: "slow-apis", label: "Slow APIs", icon: Icon.slowApi },
  { id: "sessions", label: "Sessions", icon: Icon.session },
  { id: "user-activity", label: "Users", icon: Icon.users },
  { id: "logs", label: "Log Files", icon: Icon.logs }
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SystemMonitoringPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data state
  const [dashboardStats, setDashboardStats] = useState(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState(null);
  const [serverInfo, setServerInfo] = useState(null);
  const [dbInfo, setDbInfo] = useState(null);
  const [loadingStates, setLoadingStates] = useState({
    stats: true, realtime: true, server: false, database: false
  });

  const setLoading = (key, val) => setLoadingStates(prev => ({ ...prev, [key]: val }));

  // Auth guard
  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated) { router.push("/"); return; }
      const allowedRoles = ["superadmin", "admin", "root"];
      if (!allowedRoles.includes(user?.role)) { router.push("/"); }
    }
  }, [isAuthenticated, isAuthLoading, user, router]);

  // Initial data fetch
  useEffect(() => {
    if (!isAuthenticated || !["superadmin", "admin", "root"].includes(user?.role)) return;

    const fetchStats = async () => {
      setLoading("stats", true);
      try {
        const res = await monitoringService.getDashboardStats();
        setDashboardStats(res);
      } catch (err) {
        console.error("fetchStats error:", err);
      } finally {
        setLoading("stats", false);
      }
    };
    const fetchRealtime = async () => {
      setLoading("realtime", true);
      try {
        const res = await monitoringService.getRealtimeMetrics();
        setRealtimeMetrics(res);
      } catch (err) {
        console.error("fetchRealtime error:", err);
      } finally {
        setLoading("realtime", false);
      }
    };
    fetchStats();
    fetchRealtime();

    // Auto-refresh realtime every 15s
    const interval = setInterval(fetchRealtime, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  // Load server/DB info when tab becomes active
  useEffect(() => {
    if (activeTab === "server" && !serverInfo) {
      setLoading("server", true);
      monitoringService.getServerInfo()
        .then(setServerInfo).catch(() => {})
        .finally(() => setLoading("server", false));
    }
    if (activeTab === "database" && !dbInfo) {
      setLoading("database", true);
      monitoringService.getDatabaseInfo()
        .then(setDbInfo).catch(() => {})
        .finally(() => setLoading("database", false));
    }
  }, [activeTab, serverInfo, dbInfo]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !["superadmin", "admin", "root"].includes(user?.role)) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-900/95 backdrop-blur-sm border-r border-slate-800 transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-16"}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800 min-h-[68px]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          {isSidebarOpen && <span className="font-bold text-sm text-white truncate">System Monitor</span>}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                  : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
              title={tab.label}
            >
              <span className="flex-shrink-0"><tab.icon /></span>
              {isSidebarOpen && <span className="truncate">{tab.label}</span>}
            </button>
          ))}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="flex items-center justify-center p-4 border-t border-slate-800 text-slate-500 hover:text-white transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 transition-transform ${isSidebarOpen ? "" : "rotate-180"}`}>
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">System Monitoring</h1>
            <p className="text-xs text-slate-500">Real-time platform health & analytics</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">Live</span>
            </div>
            <button
              onClick={() => router.push("/superadmin")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-sm transition-colors"
            >
              <Icon.back /> Dashboard
            </button>
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 flex items-center justify-center text-violet-400 text-sm font-bold">
              {(user?.name || "A")[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <main className="p-6">
          {activeTab === "overview" && (
            <OverviewSection
              stats={dashboardStats}
              realtime={realtimeMetrics}
              loading={loadingStates.stats || loadingStates.realtime}
            />
          )}
          {activeTab === "server" && (
            <ServerInfoSection data={serverInfo} loading={loadingStates.server} />
          )}
          {activeTab === "database" && (
            <DatabaseSection data={dbInfo} loading={loadingStates.database} />
          )}
          {activeTab === "api-logs" && <ApiLogsSection />}
          {activeTab === "analytics" && <ApiAnalyticsSection />}
          {activeTab === "slow-apis" && <SlowApisSection />}
          {activeTab === "sessions" && <SessionsSection />}
          {activeTab === "user-activity" && <UserActivitySection />}
          {activeTab === "logs" && <LogFilesSection />}
        </main>
      </div>
    </div>
  );
}
