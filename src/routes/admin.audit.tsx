import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { adminNav } from "@/components/app/adminNav";
import { Sparkles, ShieldCheck, FileText, CheckCircle2, XCircle, UserCog, Building2, Flag, Loader2, AlertTriangle } from "lucide-react";
import api from "@/lib/api";

interface AuditEntry {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  details: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

const actionIcons: Record<string, typeof ShieldCheck> = {
  approve: CheckCircle2,
  verified: ShieldCheck,
  verify: ShieldCheck,
  reject: XCircle,
  rejected: XCircle,
  match: Sparkles,
  matched: Sparkles,
  requirement: FileText,
  property: Building2,
  complaint: Flag,
  suspend: UserCog,
  suspended: UserCog,
};

function getIcon(action: string) {
  const lower = action.toLowerCase();
  for (const [key, icon] of Object.entries(actionIcons)) {
    if (lower.includes(key)) return icon;
  }
  return FileText;
}

const filters = ["All", "Admin", "Broker", "Renter", "System"] as const;

const roleTint: Record<string, string> = {
  admin: "bg-accent/15 text-accent",
  broker: "bg-primary-foreground/10 text-primary-foreground/80",
  renter: "bg-success/15 text-success",
  system: "bg-amber-500/15 text-amber-400",
};

function inferRole(_: AuditEntry): string {
  // Audit log entries don't carry an explicit role field in the current API.
  // We extract a guess from the action or resource.
  return "system";
}

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAudit = () => {
    setLoading(true);
    api.get("/admin/audit", { params: { limit: 200 } })
      .then(({ data }) => { setEntries(data); setLoading(false); })
      .catch((err) => { setError(err.response?.data?.detail || "Failed to load audit log"); setLoading(false); });
  };

  useEffect(() => { fetchAudit(); }, []);

  const visible = filter === "All" ? entries : entries.filter((e) => inferRole(e) === filter.toLowerCase());

  return (
    <AppShell nav={adminNav} title="Audit log" subtitle="Every consequential action across the marketplace." accentLabel="Trust" theme="dark" showLogout>
      <Helmet><title>Audit log — Admin</title></Helmet>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-6 flex items-center gap-3 text-destructive">
          <AlertTriangle className="size-5 shrink-0" />
          <div>
            <div className="text-sm font-medium">Failed to load audit log</div>
            <div className="text-xs opacity-80 mt-0.5">{error}</div>
          </div>
          <button onClick={fetchAudit} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    filter === f ? "bg-accent text-accent-foreground border-accent" : "bg-white/5 border-white/10 text-primary-foreground/70 hover:text-primary-foreground"
                  }`}>{f}</button>
              ))}
            </div>
            <span className="text-[11px] text-primary-foreground/50">{entries.length} entries · append-only</span>
          </div>

          <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            {visible.length === 0 && (
              <div className="p-10 text-center text-sm text-primary-foreground/60">
                No audit entries match this filter.
              </div>
            )}
            <ul className="divide-y divide-white/5">
              {visible.map((e) => {
                const Icon = getIcon(e.action);
                const role = inferRole(e);
                const time = e.timestamp ? new Date(e.timestamp).toLocaleString("en-IN", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                }) : "";
                return (
                  <li key={e.id} className="p-5 flex items-start gap-4">
                    <div className="size-9 rounded-xl bg-white/5 border border-white/10 grid place-items-center text-accent">
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{e.action || "Action"}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${roleTint[role] || roleTint.system}`}>{role}</span>
                      </div>
                      <div className="text-xs text-primary-foreground/60 mt-0.5">
                        {e.resource || e.details || "—"}
                        {e.ip_address && <span className="ml-2 text-primary-foreground/30">· {e.ip_address}</span>}
                      </div>
                    </div>
                    <div className="text-[11px] text-primary-foreground/40 whitespace-nowrap">
                      {time}{e.id && ` · ${e.id.slice(0, 8)}`}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </AppShell>
  );
}
