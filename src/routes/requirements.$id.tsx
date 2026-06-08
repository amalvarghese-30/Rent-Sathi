import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/site/Navbar";
import { StatusTimeline, type TimelineStep } from "@/components/brand/StatusTimeline";
import { TrustBadge } from "@/components/brand/TrustBadge";
import { MatchRing } from "@/components/brand/MatchRing";
import { ArrowLeft, MapPin, Wallet, Calendar, BedDouble, Bell, Sparkles, ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import api from "@/lib/api";

interface ReqDetail {
  id: string;
  area: string;
  city: string;
  property_type: string;
  budget_min: number;
  budget_max: number;
  move_in: string;
  tenant_type: string;
  amenities: string[];
  status: string;
}

interface TopMatch {
  id: string;
  property_title: string;
  property_area: string;
  property_rent: number;
  property_type: string;
  score_breakdown: { location: number; budget: number; property: number; amenities: number };
  broker_name: string;
}

export default function RequirementDetail() {
  const { id } = useParams();
  const [req, setReq] = useState<ReqDetail | null>(null);
  const [topMatch, setTopMatch] = useState<TopMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/requirements/${id}`),
      api.get("/matches"),
    ])
      .then(([reqRes, matchRes]) => {
        setReq(reqRes.data);
        const top = matchRes.data?.[0] || null;
        setTopMatch(top);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Failed to load requirement");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container-rs py-20 flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-accent" />
        </main>
      </div>
    );
  }

  if (error || !req) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container-rs py-20">
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-destructive text-sm">
            {error || "Requirement not found"}
            <Link to="/dashboard" className="ml-2 underline">Back to dashboard</Link>
          </div>
        </main>
      </div>
    );
  }

  const budgetLabel = `₹${(req.budget_min / 1000).toFixed(0)}k – ₹${(req.budget_max / 1000).toFixed(0)}k`;

  const steps: TimelineStep[] = [
    { title: "Requirement created", description: "Your requirement is live on the matchmaker.", status: "done", meta: "Active" },
    { title: "Matching", description: "Engine scoring properties against your needs.", status: req.status === "Matching" || req.status === "Matched" ? "done" : "active", meta: "In progress" },
    { title: "Match found", description: topMatch ? `${topMatch.property_title} matched` : "Waiting for top match", status: topMatch ? "done" : "pending" },
    { title: "Verification", description: "Admin reviews broker and listing.", status: req.status === "Verification" ? "active" : req.status === "Connected" ? "done" : "pending" },
    { title: "Contact shared", description: "Private contact unlocked for both sides.", status: req.status === "Connected" ? "done" : "pending" },
  ];

  const totalScore = topMatch?.score_breakdown
    ? (topMatch.score_breakdown.location || 0) + (topMatch.score_breakdown.budget || 0) + (topMatch.score_breakdown.property || 0) + (topMatch.score_breakdown.amenities || 0)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Requirement {id} — RentSaathi</title></Helmet>
      <Navbar />
      <main className="container-rs py-10 md:py-14">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to dashboard
        </Link>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-accent font-medium">Requirement · {id}</div>
            <h1 className="mt-2 font-display font-bold text-3xl md:text-4xl tracking-tight">{req.property_type} in {req.area}</h1>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary"><MapPin className="size-3" />{[req.area, req.city].filter(Boolean).join(", ")}</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary"><Wallet className="size-3" />{budgetLabel}</span>
              {req.move_in && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary"><Calendar className="size-3" />Move in {req.move_in}</span>}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-success/10 text-success">
                <span className="size-1 rounded-full bg-success animate-pulse" /> {req.status}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <TrustBadge kind="privacy" />
            <TrustBadge kind="verified" />
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-3xl border border-border bg-surface p-6 md:p-8 shadow-card-rs">
            <div className="flex items-center justify-between mb-6">
              <div className="font-display font-semibold text-lg">Status timeline</div>
              <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5"><Bell className="size-3.5" /> Updates in real-time</span>
            </div>
            <StatusTimeline steps={steps} />
          </div>

          {topMatch && (
            <div className="rounded-3xl border border-border bg-gradient-to-br from-primary to-primary/95 text-primary-foreground p-6 md:p-8 shadow-elegant relative overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-10" />
              <div className="relative">
                <div className="text-[11px] uppercase tracking-wider text-primary-foreground/60 font-medium">Your top match</div>
                <div className="mt-3 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-display font-bold text-2xl tracking-tight">{topMatch.property_title}</div>
                    <div className="text-sm text-primary-foreground/70 inline-flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3.5" /> {topMatch.property_area}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-white/10"><BedDouble className="size-3 inline mr-1" />{topMatch.property_type}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/10"><Wallet className="size-3 inline mr-1" />₹{topMatch.property_rent?.toLocaleString("en-IN")}/mo</span>
                    </div>
                  </div>
                  <div className="rounded-full bg-white/5 border border-white/10 p-2">
                    <MatchRing value={totalScore} size={84} />
                  </div>
                </div>
                <div className="mt-5 space-y-2.5">
                  {topMatch.score_breakdown && [
                    { l: "Budget", v: topMatch.score_breakdown.budget, max: 30 },
                    { l: "Location", v: topMatch.score_breakdown.location, max: 40 },
                    { l: "Property fit", v: topMatch.score_breakdown.property, max: 20 },
                  ].map((b) => (
                    <div key={b.l}>
                      <div className="flex justify-between text-[11px]"><span className="text-primary-foreground/60">{b.l}</span><span className="font-semibold">{b.v}/{b.max}</span></div>
                      <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-accent" style={{ width: `${(b.v / b.max * 100).toFixed(0)}%` }} /></div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  <Link to={`/matches/${topMatch.id}`} className="h-11 rounded-full bg-white/10 hover:bg-white/15 grid place-items-center text-sm font-medium border border-white/15">View full match</Link>
                  <button className="h-11 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 text-sm font-semibold inline-flex items-center justify-center gap-1.5">
                    <Sparkles className="size-4" /> Approve contact
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {topMatch?.broker_name && (
          <div className="mt-6 rounded-3xl border border-border bg-surface p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-xs uppercase tracking-wider text-accent font-medium">Broker</div>
                <div className="mt-1 font-display font-semibold text-lg">{topMatch.broker_name}</div>
                <div className="text-xs text-muted-foreground">Verified broker on RentSaathi</div>
              </div>
              <span className="text-xs font-medium px-3 py-2 rounded-full border border-border inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" /> Verified
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
