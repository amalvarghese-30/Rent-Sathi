import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { adminNav } from "@/components/app/adminNav";
import { Building2, MapPin, Wallet, ArrowUpRight, Loader2, AlertTriangle } from "lucide-react";
import api from "@/lib/api";

interface PendingProperty {
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
  created_at: string;
  broker_name: string;
}

export default function PendingPropertiesPage() {
  const [properties, setProperties] = useState<PendingProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/admin/properties/pending")
      .then(({ data }) => { setProperties(data); setLoading(false); })
      .catch((err) => { setError(err.response?.data?.detail || "Failed to load properties"); setLoading(false); });
  }, []);

  return (
    <AppShell nav={adminNav} title="Pending properties" subtitle="Listings awaiting verification." accentLabel="Trust" theme="dark" showLogout>
      <Helmet><title>Pending Properties — Admin</title></Helmet>

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
          <div className="text-sm text-primary-foreground/50 mb-5">{properties.length} propert{properties.length !== 1 ? "ies" : "y"} pending verification</div>
          {properties.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-primary-foreground/60">
              All properties are verified. Queue is clear.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {properties.map((p) => (
                <Link key={p.id} to={`/admin/properties/${p.id}`}
                  className="rounded-2xl bg-white/5 border border-white/10 p-5 hover:border-accent/30 hover:bg-white/[0.07] transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="size-10 rounded-xl bg-accent/15 text-accent grid place-items-center">
                      <Building2 className="size-5" />
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">Pending</span>
                  </div>
                  <div className="mt-4 font-medium text-sm">{p.title || "Untitled"}</div>
                  <div className="mt-1 text-xs text-primary-foreground/50">
                    <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {[p.area, p.city].filter(Boolean).join(", ") || "—"}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded-full bg-white/10">{p.property_type || "—"}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10">
                      <Wallet className="size-3 inline mr-0.5" />₹{p.rent?.toLocaleString("en-IN")}/mo
                    </span>
                    {p.photos?.length > 0 && <span className="px-2 py-0.5 rounded-full bg-white/10">{p.photos.length} photos</span>}
                  </div>
                  <div className="mt-3 text-xs text-primary-foreground/40">Broker: {p.broker_name || "—"} · {p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN") : ""}</div>
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
