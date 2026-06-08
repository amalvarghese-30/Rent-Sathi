import { Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { AppShell, StatCard, type NavItem } from "@/components/app/AppShell";
import { LayoutGrid, Building2, Sparkles, Plus, TrendingUp, Loader2, AlertTriangle, MapPin, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";

interface Property {
  id: string;
  title: string;
  area: string;
  city: string;
  rent: number;
  property_type: string;
  status: string;
}

interface Lead {
  id: string;
  requirement_id: string;
  property_id: string;
  score_breakdown: { location: number; budget: number; property: number; amenities: number };
  requirement_area: string;
  property_title: string;
  status: string;
}

export default function BrokerPage() {
  const { user } = useAuth();

  if (user?.role !== "broker" && user?.role !== "admin") return <Navigate to="/dashboard" replace />;

  const nav: NavItem[] = [
    { to: "/broker", label: "Dashboard", icon: LayoutGrid },
    { to: "/broker/properties/new", label: "Add Property", icon: Plus },
  ];

  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get("/properties"),
      api.get("/matches"),
    ])
      .then(([propRes, matchRes]) => {
        setProperties(propRes.data || []);
        setLeads(matchRes.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Failed to load data");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <AppShell nav={nav} title="Broker workspace" subtitle="Loading your data..." accentLabel="Broker" showLogout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell nav={nav} title="Broker workspace" subtitle="Error" accentLabel="Broker" showLogout>
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-6 flex items-center gap-3 text-destructive">
          <AlertTriangle className="size-5" />
          <div className="text-sm">{error}</div>
          <button onClick={() => window.location.reload()} className="ml-auto text-xs underline">Retry</button>
        </div>
      </AppShell>
    );
  }

  const propsByStatus = (s: string) => properties.filter((p) => p.status === s).length;

  return (
    <AppShell nav={nav} title={`${user?.full_name || "Broker"}'s workspace`} subtitle="Real renter leads, scored against your listings." accentLabel="Broker" showLogout>
      <Helmet><title>Broker Workspace — RentSaathi</title></Helmet>

      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div>
          <div className="font-display font-semibold text-lg">Properties</div>
          <div className="text-xs text-muted-foreground">Your listings and matched leads.</div>
        </div>
        <Link to="/broker/properties/new" className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant">
          <Plus className="size-3.5" /> Add property
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total properties" value={String(properties.length)} accent />
        <StatCard label="Verified listings" value={String(propsByStatus("Verified"))} delta="Live" />
        <StatCard label="Pending verification" value={String(propsByStatus("Pending Verification"))} delta="In review" />
        <StatCard label="Active leads" value={String(leads.length)} delta="Matched" />
      </div>

      {properties.length > 0 && (
        <div className="mt-10">
          <div className="font-display font-semibold text-lg mb-4">Your properties</div>
          <div className="grid gap-4 md:grid-cols-2">
            {properties.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border bg-surface p-5">
                <div className="flex items-start justify-between">
                  <div className="size-9 rounded-lg bg-accent/10 text-accent grid place-items-center font-bold"><Building2 className="size-4" /></div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.status === "Verified" ? "bg-success/10 text-success" : p.status === "Pending Verification" ? "bg-amber-500/10 text-amber-500" : "bg-secondary text-muted-foreground"}`}>{p.status}</span>
                </div>
                <div className="mt-3 font-medium">{p.title || "Untitled Property"}</div>
                <div className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                  <MapPin className="size-3" /> {[p.area, p.city].filter(Boolean).join(", ") || "—"}
                </div>
                <div className="mt-2 text-sm font-semibold inline-flex items-center gap-1">
                  <Wallet className="size-3.5" /> ₹{p.rent?.toLocaleString("en-IN")}/mo
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {properties.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
          <Building2 className="size-10 text-muted-foreground/30 mx-auto" />
          <div className="mt-4 text-sm text-muted-foreground">No properties yet. Add your first listing.</div>
          <Link to="/broker/properties/new" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium px-4 h-10 rounded-full bg-primary text-primary-foreground">
            <Plus className="size-4" /> Add property
          </Link>
        </div>
      )}

      {leads.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-display font-semibold text-lg">Matched leads</div>
              <div className="text-xs text-muted-foreground">Scored matches from renter requirements.</div>
            </div>
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><TrendingUp className="size-3 text-success" /> {leads.length} leads</span>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="text-left">
                  <th className="font-medium p-4 pb-3">Property</th>
                  <th className="font-medium p-4 pb-3">Area</th>
                  <th className="font-medium p-4 pb-3">Score</th>
                  <th className="font-medium p-4 pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((l) => {
                  const bd = l.score_breakdown || { location: 0, budget: 0, property: 0, amenities: 0 };
                  const total = (bd.location || 0) + (bd.budget || 0) + (bd.property || 0) + (bd.amenities || 0);
                  return (
                    <tr key={l.id}>
                      <td className="p-4 font-medium">{l.property_title || "Property"}</td>
                      <td className="p-4 text-muted-foreground">{l.requirement_area || "—"}</td>
                      <td className="p-4"><span className="font-display font-semibold">{total}%</span></td>
                      <td className="p-4"><span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary">{l.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  );
}
