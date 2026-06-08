import { Link, useNavigate, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { AppShell, StatCard, type NavItem } from "@/components/app/AppShell";
import { LayoutGrid, FileText, Sparkles, Bell, User, ArrowUpRight, Plus, MapPin, Loader2, AlertTriangle } from "lucide-react";
import { RequirementCard } from "@/components/brand/RequirementCard";
import { MatchRing } from "@/components/brand/MatchRing";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";

interface Requirement {
  id: string;
  area: string;
  city: string;
  property_type: string;
  budget_min: number;
  budget_max: number;
  tenant_type: string;
  move_in: string;
  status: string;
}

interface Match {
  id: string;
  property_title: string;
  requirement_area: string;
  score_breakdown: { location: number; budget: number; property: number; amenities: number };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user?.role === "broker") return <Navigate to="/broker" replace />;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;

  const nav: NavItem[] = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { to: "/requirements/new", label: "Post Requirement", icon: FileText },
    { to: "/matches", label: "Matches", icon: Sparkles },
    { to: "/notifications", label: "Notifications", icon: Bell },
  ];

  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get("/requirements"),
      api.get("/matches"),
    ])
      .then(([reqRes, matchRes]) => {
        setRequirements(reqRes.data || []);
        setMatches(matchRes.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Failed to load dashboard");
        setLoading(false);
      });
  }, []);

  const totalScore = (bd: Match["score_breakdown"]) =>
    (bd?.location || 0) + (bd?.budget || 0) + (bd?.property || 0) + (bd?.amenities || 0);

  const activeReqs = requirements.filter((r) => r.status === "Active" || r.status === "Matching").length;

  if (loading) {
    return (
      <AppShell nav={nav} title="Dashboard" subtitle="Loading your data..." accentLabel="Workspace" showLogout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell nav={nav} title="Dashboard" subtitle="Error loading data" accentLabel="Workspace" showLogout>
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-6 flex items-center gap-3 text-destructive">
          <AlertTriangle className="size-5" />
          <div>
            <div className="text-sm font-medium">Failed to load dashboard</div>
            <div className="text-xs opacity-80 mt-0.5">{error}</div>
          </div>
          <button onClick={() => window.location.reload()} className="ml-auto text-xs underline">Retry</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell nav={nav} title={`Welcome back, ${user?.full_name?.split(" ")[0] || "there"}`} subtitle="Your home search, scored and sorted." accentLabel="Workspace" showLogout>
      <Helmet><title>Dashboard — RentSaathi</title></Helmet>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active requirements" value={String(activeReqs)} delta={activeReqs > 0 ? "Matching now" : "Post your first"} />
        <StatCard label="Total requirements" value={String(requirements.length)} accent />
        <StatCard label="Matches found" value={String(matches.length)} />
        <StatCard label="All requirements" value={String(requirements.length)} delta="Tracked" />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <div className="font-display font-semibold text-lg">Your requirements</div>
            <div className="text-xs text-muted-foreground">Verified brokers see these and bring you scored matches.</div>
          </div>
          <Link to="/requirements/new" className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant">
            <Plus className="size-3.5" /> Post new requirement
          </Link>
        </div>

        {requirements.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <div className="text-sm text-muted-foreground">No requirements yet. Post your first one!</div>
            <Link to="/requirements/new" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium px-4 h-10 rounded-full bg-primary text-primary-foreground">
              <Plus className="size-4" /> Post requirement
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {requirements.map((r) => (
              <Link key={r.id} to={`/requirements/${r.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl">
                <RequirementCard r={{
                  bhk: r.property_type || "—",
                  area: [r.area, r.city].filter(Boolean).join(", ") || "—",
                  budget: `₹${(r.budget_min / 1000).toFixed(0)}k–₹${(r.budget_max / 1000).toFixed(0)}k`,
                  tenant: r.tenant_type || "—",
                  moveIn: r.move_in || "Flexible",
                  status: r.status as any,
                }} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {matches.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="font-display font-semibold text-lg">Recent matches</div>
              <div className="text-xs text-muted-foreground">Scored matches against your requirements.</div>
            </div>
            <Link to="/matches" className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">View all <ArrowUpRight className="size-3" /></Link>
          </div>
          <div className="space-y-3">
            {matches.slice(0, 5).map((m) => (
              <Link key={m.id} to={`/matches/${m.id}`}
                className="p-3 rounded-xl border border-border hover:shadow-card-rs hover:border-accent/30 transition-all flex items-center gap-3">
                <MatchRing value={totalScore(m.score_breakdown)} size={52} stroke={5} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{m.property_title || "Property"}</div>
                  <div className="text-xs text-muted-foreground inline-flex items-center gap-1"><MapPin className="size-3" />{m.requirement_area || "—"}</div>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
