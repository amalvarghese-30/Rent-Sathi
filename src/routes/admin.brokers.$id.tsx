import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { adminNav } from "@/components/app/adminNav";
import { ShieldCheck, FileCheck2, MapPin, Phone, Mail, ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Loader2, Building2 } from "lucide-react";
import api from "@/lib/api";

interface BrokerDetail {
  id: string;
  user_id: string;
  agency_name: string;
  license_number: string;
  rera_id: string;
  trust_score: number;
  response_rate: number;
  verification_status: string;
  documents: Array<{ name: string; id: string; status?: string }>;
  listings_count: number;
  successful_connections: number;
  user: { id: string; email: string; full_name: string; phone: string } | null;
  properties: Array<{ id: string; title: string; status: string }>;
}

export default function BrokerReview() {
  const { id } = useParams<{ id: string }>();
  const [broker, setBroker] = useState<BrokerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<null | "approved" | "rejected">(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/admin/brokers/${id}`)
      .then(({ data }) => {
        setBroker(data);
        if (data.verification_status === "verified") setDecision("approved");
        else if (data.verification_status === "rejected") setDecision("rejected");
        setLoading(false);
      })
      .catch((err) => { setError(err.response?.data?.detail || "Failed to load broker"); setLoading(false); });
  }, [id]);

  const handleVerify = async (status: "verified" | "rejected") => {
    if (!id) return;
    try {
      await api.post(`/admin/brokers/${id}/verify`, { status, reason: "" });
      setDecision(status === "verified" ? "approved" : "rejected");
    } catch (err: any) {
      alert(err.response?.data?.detail || `Failed to ${status === "verified" ? "approve" : "reject"} broker`);
    }
  };

  if (loading) {
    return (
      <AppShell nav={adminNav} title="Broker verification" subtitle={`Loading ${id}...`} accentLabel="Trust" theme="dark" showLogout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      </AppShell>
    );
  }

  if (error || !broker) {
    return (
      <AppShell nav={adminNav} title="Broker verification" subtitle="Error" accentLabel="Trust" theme="dark" showLogout>
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-6 text-destructive text-sm">
          {error || "Broker not found"}
          <Link to="/admin" className="ml-2 underline">Back to dashboard</Link>
        </div>
      </AppShell>
    );
  }

  const docs = broker.documents?.length
    ? broker.documents.map((d: any) => ({
        name: d.name || d.type || "Document",
        id: d.id || d.url || "—",
        status: d.verified === false ? "Needs review" : d.status || "Valid",
      }))
    : [
        { name: "PAN card", id: broker.license_number || "—", status: broker.license_number ? "Valid" : "Missing" },
        { name: "RERA registration", id: broker.rera_id || "—", status: broker.rera_id ? "Valid" : "Missing" },
      ];

  const initials = broker.agency_name
    ? broker.agency_name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "BR";

  return (
    <AppShell nav={adminNav} title="Broker verification" subtitle={`Reviewing ${id}`} accentLabel="Trust" theme="dark" showLogout>
      <Helmet><title>{`Verify broker ${id} — Admin`}</title></Helmet>
      <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-primary-foreground/60 hover:text-primary-foreground">
        <ArrowLeft className="size-3" /> Back to queues
      </Link>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-start gap-4">
            <div className="size-14 rounded-2xl bg-accent text-accent-foreground grid place-items-center font-display font-bold">{initials}</div>
            <div className="flex-1">
              <div className="font-display font-bold text-2xl">{broker.agency_name || "Unnamed Agency"}</div>
              <div className="text-xs text-primary-foreground/60 inline-flex items-center gap-2 mt-1">
                <MapPin className="size-3" /> {broker.user?.full_name || "Broker"}
              </div>
              <div className="mt-2 flex gap-3 text-xs text-primary-foreground/70">
                <span className="inline-flex items-center gap-1"><Phone className="size-3" /> {broker.user?.phone || "—"}</span>
                <span className="inline-flex items-center gap-1"><Mail className="size-3" /> {broker.user?.email || "—"}</span>
              </div>
            </div>
            <div className="rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-center">
              <div className="font-display font-bold text-2xl text-accent leading-none">{broker.trust_score}</div>
              <div className="text-[10px] uppercase tracking-wider text-primary-foreground/60 mt-1">Trust score</div>
            </div>
          </div>

          {broker.properties?.length > 0 && (
            <div className="mt-6">
              <div className="text-[11px] uppercase tracking-wider text-primary-foreground/50 font-medium mb-3">
                Properties ({broker.listings_count || broker.properties.length})
              </div>
              <div className="space-y-2">
                {broker.properties.map((p) => (
                  <div key={p.id} className="rounded-xl bg-white/[0.04] border border-white/10 p-3 flex items-center gap-3">
                    <Building2 className="size-4 text-accent/50" />
                    <div className="flex-1 text-sm">{p.title || `Property ${p.id.slice(0, 8)}`}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10">{p.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="text-[11px] uppercase tracking-wider text-primary-foreground/50 font-medium mb-3">Submitted documents</div>
            <div className="space-y-2">
              {docs.map((d) => (
                <div key={d.name} className="rounded-xl bg-white/[0.04] border border-white/10 p-4 flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-accent/15 text-accent grid place-items-center"><FileCheck2 className="size-4" /></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{d.name}</div>
                    <div className="text-[11px] text-primary-foreground/50">{d.id}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${d.status === "Valid" ? "bg-success/15 text-success" : d.status === "Missing" ? "bg-destructive/15 text-destructive" : "bg-amber-500/15 text-amber-400"}`}>{d.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { l: "Response rate", v: `${Math.round((broker.response_rate || 0) * 100)}%` },
              { l: "Connections", v: broker.successful_connections },
              { l: "RERA ID", v: broker.rera_id || "—" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-center">
                <div className="text-[10px] uppercase text-primary-foreground/50">{s.l}</div>
                <div className="mt-1 font-semibold text-sm">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 lg:sticky lg:top-20 h-fit">
          <div className="text-xs uppercase tracking-wider text-accent font-medium">Decision</div>
          <div className="mt-2 font-display font-semibold text-lg leading-snug">Approve this broker?</div>
          <p className="mt-2 text-xs text-primary-foreground/60 leading-relaxed">
            Approving unlocks matching for all of this broker's listings. Renters will see the verified badge across the product.
          </p>

          {decision === null ? (
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={() => handleVerify("rejected")}
                className="h-11 rounded-full bg-destructive/15 text-destructive hover:bg-destructive/25 text-sm font-medium inline-flex items-center justify-center gap-1.5">
                <XCircle className="size-4" /> Reject
              </button>
              <button onClick={() => handleVerify("verified")}
                className="h-11 rounded-full bg-success/20 text-success hover:bg-success/30 text-sm font-semibold inline-flex items-center justify-center gap-1.5">
                <ShieldCheck className="size-4" /> Approve
              </button>
            </div>
          ) : (
            <div className={`mt-5 rounded-xl p-4 text-sm ${decision === "approved" ? "bg-success/10 border border-success/20 text-success" : "bg-destructive/10 border border-destructive/20 text-destructive"}`}>
              <div className="font-medium inline-flex items-center gap-1.5">
                {decision === "approved" ? <><CheckCircle2 className="size-4" /> Broker approved</> : <><XCircle className="size-4" /> Broker rejected</>}
              </div>
              <div className="mt-1 text-xs opacity-80">Logged to the audit trail. Notifications sent.</div>
              <button onClick={() => setDecision(null)} className="mt-3 text-[11px] underline opacity-80">Undo</button>
            </div>
          )}

          <div className="mt-6 text-[11px] text-primary-foreground/50 leading-relaxed">
            Suspending an approved broker pauses all their listings and active matches immediately.
          </div>
          <button className="mt-3 w-full h-9 rounded-full border border-white/15 text-xs text-primary-foreground/70 hover:bg-white/5">
            Suspend broker
          </button>
        </div>
      </div>
    </AppShell>
  );
}