import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { adminNav } from "@/components/app/adminNav";
import { Flag, MessageSquare, ShieldOff, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import api from "@/lib/api";

interface Complaint {
  id: string;
  filed_by: string;
  against_user: string;
  match_id: string;
  reason: string;
  description: string;
  status: string;
  resolution: string | null;
  created_at: string;
  filed_by_name: string;
  against_name: string;
}

export default function ComplaintsPage() {
  const [items, setItems] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const fetchComplaints = () => {
    api.get("/admin/complaints")
      .then(({ data }) => { setItems(data); setLoading(false); })
      .catch((err) => { setError(err.response?.data?.detail || "Failed to load complaints"); setLoading(false); });
  };

  useEffect(() => { fetchComplaints(); }, []);

  const resolve = async (id: string) => {
    setActing(id);
    try {
      await api.patch(`/admin/complaints/${id}/resolve`, {
        resolution: "Resolved by admin",
        status: "Resolved",
      });
      setItems(items.map((i) => (i.id === id ? { ...i, status: "Resolved" } : i)));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to resolve complaint");
    } finally {
      setActing(null);
    }
  };

  const openCount = items.filter((c) => c.status === "Open").length;
  const avgResolution = "—";
  const susps = 0;

  return (
    <AppShell nav={adminNav} title="Complaints" subtitle="Trust signals from both sides of the marketplace." accentLabel="Trust" theme="dark" showLogout>
      <Helmet><title>Complaints — Admin</title></Helmet>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-6 flex items-center gap-3 text-destructive">
          <AlertTriangle className="size-5 shrink-0" />
          <div>
            <div className="text-sm font-medium">Failed to load complaints</div>
            <div className="text-xs opacity-80 mt-0.5">{error}</div>
          </div>
          <button onClick={fetchComplaints} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { l: "Open complaints", v: openCount, tint: "text-amber-400" },
              { l: "Ready for resolution", v: items.length, tint: "text-accent" },
              { l: "Resolved", v: items.filter((c) => c.status === "Resolved").length, tint: "text-success" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-white/5 border border-white/10 p-6">
                <div className="text-xs text-primary-foreground/60">{s.l}</div>
                <div className={`mt-2 font-display font-bold text-3xl tracking-tight ${s.tint}`}>{s.v}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            {items.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-primary-foreground/60">
                No complaints yet. The marketplace is healthy.
              </div>
            )}
            {items.map((c) => (
              <div key={c.id} className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3">
                    <div className="size-9 rounded-xl bg-amber-500/15 text-amber-400 grid place-items-center"><Flag className="size-4" /></div>
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {c.filed_by_name || "Renter"} <span className="text-primary-foreground/40">→</span> {c.against_name || "Broker"}
                      </div>
                      <div className="text-[11px] text-primary-foreground/50 mt-0.5">
                        {c.status === "Open" ? "Open" : "Resolved"}
                        {c.created_at && ` · ${new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`}
                        {" · "}{c.id?.slice(0, 8)}
                      </div>
                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/10">
                        <MessageSquare className="size-3" /> {c.reason}
                      </div>
                      <p className="mt-3 text-sm text-primary-foreground/70 max-w-xl">{c.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.status === "Open" ? (
                      <>
                        <button className="h-9 px-3 rounded-full bg-destructive/15 text-destructive hover:bg-destructive/25 text-xs font-medium inline-flex items-center gap-1.5">
                          <ShieldOff className="size-3.5" /> Suspend
                        </button>
                        <button onClick={() => resolve(c.id)} disabled={acting === c.id}
                          className="h-9 px-3 rounded-full bg-success/20 text-success hover:bg-success/30 text-xs font-medium inline-flex items-center gap-1.5 disabled:opacity-50">
                          {acting === c.id ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                          Resolve
                        </button>
                      </>
                    ) : (
                      <span className="text-xs px-3 py-1 rounded-full bg-success/15 text-success inline-flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5" /> Resolved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
