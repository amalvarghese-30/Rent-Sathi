import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { adminNav } from "@/components/app/adminNav";
import { ShieldCheck, ArrowUpRight, Loader2, AlertTriangle, Star } from "lucide-react";
import api from "@/lib/api";

interface PendingBroker {
  id: string;
  user_id: string;
  agency_name: string;
  license_number: string;
  rera_id: string;
  trust_score: number;
  verification_status: string;
  documents: Array<{ name: string }>;
  user: { id: string; email: string; full_name: string; phone: string } | null;
}

export default function PendingBrokersPage() {
  const [brokers, setBrokers] = useState<PendingBroker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/admin/brokers/pending")
      .then(({ data }) => { setBrokers(data); setLoading(false); })
      .catch((err) => { setError(err.response?.data?.detail || "Failed to load brokers"); setLoading(false); });
  }, []);

  return (
    <AppShell nav={adminNav} title="Pending brokers" subtitle="Brokers awaiting verification." accentLabel="Trust" theme="dark" showLogout>
      <Helmet><title>Pending Brokers — Admin</title></Helmet>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-6 flex items-center gap-3 text-destructive">
          <AlertTriangle className="size-5 shrink-0" />
          <div className="text-sm">{error}</div>
          <button onClick={() => window.location.reload()} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="text-sm text-primary-foreground/50 mb-5">{brokers.length} broker{brokers.length !== 1 ? "s" : ""} pending verification</div>
          {brokers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-primary-foreground/60">
              All brokers are verified. Queue is clear.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {brokers.map((b) => (
                <Link key={b.id} to={`/admin/brokers/${b.id}`}
                  className="rounded-2xl bg-white/5 border border-white/10 p-5 hover:border-accent/30 hover:bg-white/[0.07] transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="size-10 rounded-xl bg-accent/15 text-accent grid place-items-center font-bold text-sm">
                      {(b.agency_name || b.user?.full_name || "B").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-primary-foreground/40">
                      <Star className="size-3 text-amber-400" /> {b.trust_score || "—"}
                    </div>
                  </div>
                  <div className="mt-4 font-medium text-sm">{b.agency_name || b.user?.full_name || "Unnamed"}</div>
                  <div className="mt-1 text-xs text-primary-foreground/50">{b.user?.email || "—"}{b.user?.phone ? ` · ${b.user.phone}` : ""}</div>
                  <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                    {b.license_number && <span className="px-2 py-0.5 rounded-full bg-white/10">PAN: {b.license_number}</span>}
                    {b.rera_id && <span className="px-2 py-0.5 rounded-full bg-white/10">RERA: {b.rera_id}</span>}
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">{b.documents?.length || 0} docs</span>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-[11px] text-accent group-hover:underline">
                    Review <ArrowUpRight className="size-3" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
