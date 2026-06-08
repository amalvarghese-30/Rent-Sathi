import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { adminNav } from "@/components/app/adminNav";
import { Gauge, MapPin, Wallet, TrendingUp, Users, Clock, Loader2, AlertTriangle } from "lucide-react";
import api from "@/lib/api";

interface OpsData {
  today: {
    requirements: number;
    matches: number;
    brokers_verified: number;
    contacts_shared: number;
    verifications_pending: number;
    contact_approvals: number;
    contact_accept_rate: number;
  };
  top_areas: Array<{ area: string; reqs: number; matched: number }>;
  budget_distribution: Array<{ range: string; count: number; pct: number }>;
  funnel: Array<{ label: string; value: number; pct: number }>;
}

export default function OpsPage() {
  const [data, setData] = useState<OpsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/admin/ops")
      .then(({ data }) => { setData(data); setLoading(false); })
      .catch((err) => { setError(err.response?.data?.detail || "Failed to load analytics"); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <AppShell nav={adminNav} title="Founder operations" subtitle="Loading analytics..." accentLabel="Internal" theme="dark" showLogout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell nav={adminNav} title="Founder operations" subtitle="Error" accentLabel="Internal" theme="dark" showLogout>
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-6 flex items-center gap-3 text-destructive">
          <AlertTriangle className="size-5 shrink-0" />
          <div>
            <div className="text-sm font-medium">Failed to load analytics</div>
            <div className="text-xs opacity-80 mt-0.5">{error}</div>
          </div>
          <button onClick={() => window.location.reload()} className="ml-auto text-xs underline">Retry</button>
        </div>
      </AppShell>
    );
  }

  const { today, top_areas, budget_distribution, funnel } = data;

  const kpis = [
    { l: "Requirements today", v: today.requirements.toLocaleString("en-IN"), icon: Gauge },
    { l: "Matches created", v: today.matches.toLocaleString("en-IN"), icon: TrendingUp },
    { l: "Verifications pending", v: today.verifications_pending.toLocaleString("en-IN"), icon: Clock },
    { l: "Contact approval rate", v: `${today.contact_accept_rate}%`, d: `${today.contact_approvals} total`, icon: Users },
  ];

  return (
    <AppShell nav={adminNav} title="Founder operations" subtitle="Real-time marketplace numbers from the database." accentLabel="Internal" theme="dark" showLogout>
      <Helmet><title>Founder Ops — RentSaathi</title></Helmet>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.l} className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="text-xs text-primary-foreground/60">{k.l}</div>
              <k.icon className="size-4 text-accent" />
            </div>
            <div className="mt-3 font-display font-bold text-4xl tracking-tight">{k.v}</div>
            {k.d && <div className="mt-1 text-[11px] text-success">{k.d}</div>}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="font-display font-semibold text-lg">Top areas this week</div>
            <span className="text-[11px] text-primary-foreground/50">By requirements posted</span>
          </div>
          <div className="mt-5 space-y-3">
            {top_areas.length === 0 && (
              <div className="text-sm text-primary-foreground/50 py-4 text-center">No requirements yet this week.</div>
            )}
            {top_areas.map((a) => {
              const pct = top_areas[0]?.reqs ? (a.reqs / top_areas[0].reqs) * 100 : 0;
              return (
                <div key={a.area}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1.5 text-primary-foreground/80"><MapPin className="size-3.5 text-accent" />{a.area}</span>
                    <span className="text-primary-foreground/60 text-xs">{a.reqs} · {a.matched} matched</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="font-display font-semibold text-lg">Budget distribution</div>
            <Wallet className="size-4 text-accent" />
          </div>
          <div className="mt-5 space-y-3">
            {budget_distribution.length === 0 && (
              <div className="text-sm text-primary-foreground/50 py-4 text-center">No data yet.</div>
            )}
            {budget_distribution.map((b) => (
              <div key={b.range}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-foreground/80">{b.range}</span>
                  <span className="text-primary-foreground/60 text-xs">{b.count.toLocaleString("en-IN")} · {b.pct}%</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-accent/80" style={{ width: `${Math.max(b.pct * 2.5, 2)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-6">
        <div className="font-display font-semibold text-lg">Funnel — last 30 days</div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          {funnel.map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[11px] uppercase tracking-wider text-primary-foreground/50">{s.label}</div>
              <div className="mt-2 font-display font-bold text-2xl">{s.value.toLocaleString("en-IN")}</div>
              <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-accent" style={{ width: `${Math.max(s.pct, 2)}%` }} />
              </div>
              <div className="mt-1 text-[10px] text-primary-foreground/50">{s.pct}% of top</div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
