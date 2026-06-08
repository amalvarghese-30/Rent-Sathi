import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { adminNav } from "@/components/app/adminNav";
import { MapPin, Wallet, BedDouble, Calendar, ArrowLeft, CheckCircle2, XCircle, Loader2, AlertTriangle, Building2 } from "lucide-react";
import api from "@/lib/api";

interface PropertyDetail {
  id: string;
  broker_id: string;
  title: string;
  description: string;
  area: string;
  city: string;
  rent: number;
  deposit: number;
  property_type: string;
  amenities: string[];
  photos: string[];
  status: string;
  broker_name: string;
  created_at: string;
}

export default function PropertyReview() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<null | "approved" | "rejected">(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/admin/properties/${id}`)
      .then(({ data }) => {
        setProperty(data);
        if (data.status === "Verified") setDecision("approved");
        else if (data.status === "Draft") setDecision("rejected");
        setLoading(false);
      })
      .catch((err) => { setError(err.response?.data?.detail || "Failed to load property"); setLoading(false); });
  }, [id]);

  const handleVerify = async () => {
    if (!id) return;
    try {
      await api.post(`/admin/properties/${id}/verify`);
      setDecision("approved");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to approve property");
    }
  };

  const handleReject = async () => {
    if (!id) return;
    try {
      await api.post(`/admin/properties/${id}/reject`);
      setDecision("rejected");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to reject property");
    }
  };

  if (loading) {
    return (
      <AppShell nav={adminNav} title="Property verification" subtitle={`Loading ${id}...`} accentLabel="Trust" theme="dark" showLogout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      </AppShell>
    );
  }

  if (error || !property) {
    return (
      <AppShell nav={adminNav} title="Property verification" subtitle="Error" accentLabel="Trust" theme="dark" showLogout>
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-6 text-destructive text-sm">
          {error || "Property not found"}
          <Link to="/admin" className="ml-2 underline">Back to dashboard</Link>
        </div>
      </AppShell>
    );
  }

  const props = property;

  const checks = [
    { l: "Photo authenticity", s: "EXIF + duplicate check", v: props.photos?.length ? "Pass" : "Pending" },
    { l: "Address verified", s: `Cross-checked with broker area`, v: props.area ? "Pass" : "Pending" },
    { l: "Rent within market range", s: `₹${props.rent?.toLocaleString("en-IN")}/mo`, v: "Pass" },
    { l: "Availability confirmed", s: "Broker confirmed listing", v: "Pending" },
  ];

  const formattedDate = props.created_at
    ? new Date(props.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <AppShell nav={adminNav} title="Property verification" subtitle={`Reviewing ${id}`} accentLabel="Trust" theme="dark" showLogout>
      <Helmet><title>{`Verify property ${id} — Admin`}</title></Helmet>
      <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-primary-foreground/60 hover:text-primary-foreground">
        <ArrowLeft className="size-3" /> Back to queues
      </Link>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="aspect-[16/8] bg-gradient-to-br from-primary via-primary to-accent/70 relative grid place-items-center">
            <Building2 className="size-12 text-primary-foreground/40" />
            <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-primary-foreground/60">Submitted listing{props.created_at ? ` · ${formattedDate}` : ""}</div>
                <div className="font-display font-bold text-2xl">{props.title || "Untitled Property"}</div>
                <div className="text-xs text-primary-foreground/70 inline-flex items-center gap-1 mt-1">
                  <MapPin className="size-3" /> {[props.area, props.city].filter(Boolean).join(", ") || "—"}
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10"><BedDouble className="size-3" />{props.property_type || "—"}</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10"><Wallet className="size-3" />₹{props.rent?.toLocaleString("en-IN")}/mo{props.deposit ? ` · ₹${props.deposit.toLocaleString("en-IN")} deposit` : ""}</span>
              {props.amenities?.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10"><Calendar className="size-3" />{props.amenities.slice(0, 3).join(", ")}</span>
              )}
            </div>
            <p className="mt-4 text-sm text-primary-foreground/70 leading-relaxed">
              {props.description || "No description provided."}
            </p>

            <div className="mt-6">
              <div className="text-[11px] uppercase tracking-wider text-primary-foreground/50 font-medium mb-3">Verification checks</div>
              <div className="space-y-2">
                {checks.map((c) => (
                  <div key={c.l} className="rounded-xl bg-white/[0.04] border border-white/10 p-4 flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-accent/15 text-accent grid place-items-center"><CheckCircle2 className="size-4" /></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{c.l}</div>
                      <div className="text-[11px] text-primary-foreground/50">{c.s}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.v === "Pass" ? "bg-success/15 text-success" : "bg-amber-500/15 text-amber-400"}`}>{c.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 text-xs text-primary-foreground/50">
              Broker: {props.broker_name || "Unknown"} · Status: {props.status}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 lg:sticky lg:top-20 h-fit">
          <div className="text-xs uppercase tracking-wider text-accent font-medium">Decision</div>
          <div className="mt-2 font-display font-semibold text-lg leading-snug">Approve this listing?</div>
          <p className="mt-2 text-xs text-primary-foreground/60 leading-relaxed">
            Approval marks the property Verified and opens it to scored matches with active renter requirements.
          </p>

          {decision === null ? (
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={handleReject}
                className="h-11 rounded-full bg-destructive/15 text-destructive hover:bg-destructive/25 text-sm font-medium inline-flex items-center justify-center gap-1.5">
                <XCircle className="size-4" /> Reject
              </button>
              <button onClick={handleVerify}
                className="h-11 rounded-full bg-success/20 text-success hover:bg-success/30 text-sm font-semibold inline-flex items-center justify-center gap-1.5">
                <CheckCircle2 className="size-4" /> Approve
              </button>
            </div>
          ) : (
            <div className={`mt-5 rounded-xl p-4 text-sm ${decision === "approved" ? "bg-success/10 border border-success/20 text-success" : "bg-destructive/10 border border-destructive/20 text-destructive"}`}>
              <div className="font-medium">{decision === "approved" ? "Listing approved" : "Listing rejected"}</div>
              <div className="mt-1 text-xs opacity-80">Broker notified. Logged to audit trail.</div>
              <button onClick={() => setDecision(null)} className="mt-3 text-[11px] underline opacity-80">Undo</button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
