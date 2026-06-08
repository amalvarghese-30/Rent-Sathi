import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { adminNav } from "@/components/app/adminNav";
import { ShieldCheck, Building2, Sparkles, Flag, ArrowUpRight, Activity, Loader2, AlertTriangle } from "lucide-react";
import api from "@/lib/api";

interface AdminStats {
  pending_brokers: number;
  pending_properties: number;
  pending_matches: number;
  open_complaints: number;
  total_users: number;
  total_brokers: number;
  total_renters: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/admin/stats")
      .then(({ data }) => { setStats(data); setLoading(false); })
      .catch((err) => { setError(err.response?.data?.detail || "Failed to load stats"); setLoading(false); });
  }, []);

  const queues = [
    { l: "Pending brokers", v: stats?.pending_brokers ?? 0, to: "/admin/brokers/pending", icon: ShieldCheck },
    { l: "Pending properties", v: stats?.pending_properties ?? 0, to: "/admin/properties/pending", icon: Building2 },
    { l: "Pending matches", v: stats?.pending_matches ?? 0, to: "/admin/matches", icon: Sparkles },
    { l: "Open complaints", v: stats?.open_complaints ?? 0, to: "/admin/complaints", icon: Flag },
  ];

  return (
    <AppShell nav={adminNav} title="Admin control" subtitle="Marketplace operations · trust queues · double-consent flow." accentLabel="Admin" theme="dark" showLogout>
      <Helmet><title>Admin — RentSaathi</title></Helmet>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-6 flex items-center gap-3 text-destructive">
          <AlertTriangle className="size-5 shrink-0" />
          <div>
            <div className="text-sm font-medium">Failed to load dashboard</div>
            <div className="text-xs opacity-80 mt-0.5">{error}</div>
          </div>
          <button onClick={() => window.location.reload()} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {queues.map((q) => {
              const card = (
                <div className="rounded-2xl bg-white/5 border border-white/10 p-6 hover:border-accent/40 hover:bg-white/[0.07] transition-all group h-full">
                  <div className="flex items-center justify-between">
                    <div className="size-10 rounded-xl bg-accent/15 text-accent grid place-items-center"><q.icon className="size-5" /></div>
                    <ArrowUpRight className="size-4 text-primary-foreground/40 group-hover:text-accent transition-colors" />
                  </div>
                  <div className="mt-4 font-display font-bold text-4xl tracking-tight">{q.v}</div>
                  <div className="mt-1 text-xs text-primary-foreground/60">{q.l}</div>
                </div>
              );
              return <Link key={q.l} to={q.to}>{card}</Link>;
            })}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="font-display font-semibold text-lg">Double-consent flow</div>
                  <div className="text-xs text-primary-foreground/60">Every match passes through admin review and user approval before contact is shared.</div>
                </div>
                <span className="text-[11px] px-2 py-1 rounded-full bg-accent/15 text-accent">Core differentiator</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { t: "Match created", s: "Engine scores requirement vs property", c: "bg-white/10" },
                  { t: "Admin reviews", s: "Human checks broker + listing", c: "bg-accent/20 text-accent" },
                  { t: "User approves", s: "Renter consents to share contact", c: "bg-accent/20 text-accent" },
                  { t: "Contact shared", s: "Private channel opens both sides", c: "bg-success/20 text-success" },
                ].map((s, i) => (
                  <div key={s.t} className="rounded-xl border border-white/10 p-4 bg-white/[0.03]">
                    <div className={`size-7 rounded-lg grid place-items-center text-[11px] font-semibold ${s.c}`}>{i + 1}</div>
                    <div className="mt-3 text-sm font-medium">{s.t}</div>
                    <div className="mt-1 text-[11px] text-primary-foreground/60 leading-snug">{s.s}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div className="font-display font-semibold text-lg">Platform</div>
                <span className="text-[11px] text-primary-foreground/50 inline-flex items-center gap-1"><Activity className="size-3" /> Live</span>
              </div>
              <div className="mt-5 space-y-3 text-sm">
                {[
                  { l: "Total users", v: stats.total_users },
                  { l: "Total renters", v: stats.total_renters },
                  { l: "Total brokers", v: stats.total_brokers },
                  { l: "Pending verifications", v: stats.pending_brokers + stats.pending_properties },
                ].map((r) => (
                  <div key={r.l} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0">
                    <span className="text-primary-foreground/70">{r.l}</span>
                    <span className="font-display font-semibold">{r.v}</span>
                  </div>
                ))}
              </div>
              <Link to="/admin/ops" className="mt-5 inline-flex items-center gap-1 text-xs text-accent hover:underline">
                Open founder dashboard <ArrowUpRight className="size-3" />
              </Link>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
