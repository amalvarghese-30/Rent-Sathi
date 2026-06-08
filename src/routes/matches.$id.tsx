import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { MatchRing } from "@/components/brand/MatchRing";
import { TrustBadge } from "@/components/brand/TrustBadge";
import { ArrowLeft, MapPin, Wallet, BedDouble, Calendar, Phone, X, Check, ShieldCheck, Sparkles, Flag, Loader2, AlertTriangle } from "lucide-react";
import api from "@/lib/api";

interface MatchDetail {
  id: string;
  property_title: string;
  property_area: string;
  property_rent: number;
  property_deposit: number;
  property_type: string;
  property_available: string;
  property_description: string;
  score_breakdown: { location: number; budget: number; property: number; amenities: number };
  status: string;
  requirement_area: string;
  broker_name?: string;
}

export default function MatchDetailPage() {
  const { id } = useParams();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<null | "approved" | "declined">(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/matches/${id}`)
      .then(({ data }) => { setMatch(data); setLoading(false); })
      .catch((err) => { setError(err.response?.data?.detail || "Failed to load match"); setLoading(false); });
  }, [id]);

  const handleDecision = async (action: "approve" | "decline") => {
    if (!id) return;
    try {
      await api.patch(`/matches/${id}/${action}`);
      setDecision(action === "approve" ? "approved" : "declined");
    } catch (err: any) {
      alert(err.response?.data?.detail || `Failed to ${action} match`);
    }
  };

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

  if (error || !match) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container-rs py-20">
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-destructive text-sm">
            {error || "Match not found"}
            <Link to="/matches" className="ml-2 underline">Back to matches</Link>
          </div>
        </main>
      </div>
    );
  }

  const bd = match.score_breakdown || { location: 0, budget: 0, property: 0, amenities: 0 };
  const total = (bd.location || 0) + (bd.budget || 0) + (bd.property || 0) + (bd.amenities || 0);

  const bars = [
    { l: "Budget fit", v: bd.budget || 0, max: 30, sub: `₹${match.property_rent?.toLocaleString("en-IN") || "—"} rent` },
    { l: "Location fit", v: bd.location || 0, max: 40, sub: match.property_area || "—" },
    { l: "Property fit", v: bd.property || 0, max: 20, sub: match.property_type || "—" },
    { l: "Amenities", v: bd.amenities || 0, max: 10, sub: "Amenity overlap" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Match {id} — RentSaathi</title></Helmet>
      <Navbar />
      <main className="container-rs py-10 md:py-14">
        <Link to="/matches" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to matches
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="rounded-3xl border border-border bg-surface overflow-hidden shadow-card-rs">
              <div className="aspect-[16/7] bg-gradient-to-br from-primary via-primary to-accent/70 relative">
                <div className="absolute inset-0 bg-grid opacity-15" />
                <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between text-primary-foreground">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-primary-foreground/70 font-medium">Match</div>
                    <div className="font-display font-bold text-3xl md:text-4xl tracking-tight">{match.property_title}</div>
                    <div className="text-sm text-primary-foreground/70 inline-flex items-center gap-1 mt-1">
                      <MapPin className="size-3.5" /> {match.property_area || "—"}
                    </div>
                  </div>
                  <div className="rounded-full bg-white/10 border border-white/20 p-2">
                    <MatchRing value={total} size={86} />
                  </div>
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap gap-2">
                  <Pill icon={<BedDouble className="size-3" />}>{match.property_type || "—"}</Pill>
                  <Pill icon={<Wallet className="size-3" />}>₹{match.property_rent?.toLocaleString("en-IN") || "—"} / month</Pill>
                  {match.property_available && <Pill icon={<Calendar className="size-3" />}>Available {match.property_available}</Pill>}
                  <TrustBadge kind="verified" />
                </div>
                {match.property_description && (
                  <p className="mt-5 text-sm text-muted-foreground leading-relaxed">{match.property_description}</p>
                )}

                <div className="mt-7">
                  <div className="font-display font-semibold text-lg">Match score breakdown</div>
                  <div className="mt-4 space-y-4">
                    {bars.map((b, i) => (
                      <motion.div key={b.l} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.06 }}>
                        <div className="flex justify-between text-sm">
                          <div><div className="font-medium">{b.l}</div><div className="text-[11px] text-muted-foreground">{b.sub}</div></div>
                          <div className="font-display font-bold text-lg">{b.v}<span className="text-xs text-muted-foreground">/{b.max}</span></div>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <motion.div className="h-full bg-accent" initial={{ width: 0 }} animate={{ width: `${(b.v / b.max * 100).toFixed(0)}%` }} transition={{ duration: 0.9, delay: 0.2 + i * 0.06 }} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-card-rs sticky top-20">
              <div className="text-xs uppercase tracking-wider text-accent font-medium">Double-consent contact</div>
              <div className="mt-2 font-display font-semibold text-lg leading-snug">
                {match.broker_name || "Broker"} wants to connect.
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Match score {total}%</div>

              <div className="mt-4 space-y-1.5">
                {[
                  { l: "Match created by engine", done: true },
                  { l: "Admin reviewed & approved", done: match.status === "Pending User" || match.status === "Approved" },
                  { l: "Your approval", done: decision === "approved" },
                  { l: "Contact shared securely", done: decision === "approved" },
                ].map((s) => (
                  <div key={s.l} className="flex items-center gap-2 text-xs">
                    <div className={`size-4 rounded-full grid place-items-center ${s.done ? "bg-success text-background" : "bg-secondary text-muted-foreground"}`}>
                      <Check className="size-2.5" />
                    </div>
                    <span className={s.done ? "text-foreground" : "text-muted-foreground"}>{s.l}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl bg-secondary/50 p-4 text-xs text-muted-foreground leading-relaxed">
                <Phone className="size-3.5 inline text-accent mr-1" />
                Your phone number stays hidden until you approve. The broker only sees your scored requirement.
              </div>

              <AnimatePresence mode="wait">
                {decision === null && (
                  <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5 grid grid-cols-2 gap-2">
                    <button onClick={() => handleDecision("decline")}
                      className="h-11 rounded-full border border-border text-sm font-medium hover:bg-secondary inline-flex items-center justify-center gap-1.5">
                      <X className="size-4" /> Decline
                    </button>
                    <button onClick={() => handleDecision("approve")}
                      className="h-11 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 text-sm font-semibold inline-flex items-center justify-center gap-1.5 shadow-elegant">
                      <Check className="size-4" /> Approve
                    </button>
                  </motion.div>
                )}
                {decision === "approved" && (
                  <motion.div key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-5 rounded-xl bg-success/10 border border-success/20 p-4 text-sm">
                    <div className="font-medium text-success inline-flex items-center gap-1.5">
                      <ShieldCheck className="size-4" /> Contact shared securely
                    </div>
                    <div className="mt-1 text-xs text-success/80">{match.broker_name || "Broker"} has been notified.</div>
                    <button className="mt-3 w-full h-10 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      Done
                    </button>
                  </motion.div>
                )}
                {decision === "declined" && (
                  <motion.div key="no" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-xl bg-secondary p-4 text-sm">
                    <div className="font-medium">Match declined</div>
                    <div className="mt-1 text-xs text-muted-foreground">We'll keep matching new properties to your requirement.</div>
                    <button onClick={() => setDecision(null)} className="mt-3 text-xs text-accent font-medium">Undo</button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-5 flex flex-wrap gap-2">
                <TrustBadge kind="privacy" />
                <TrustBadge kind="human" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 text-xs">
              <Link to="/matches" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
                <Sparkles className="size-3" /> See all matches
              </Link>
              <button className="text-muted-foreground hover:text-destructive inline-flex items-center gap-1.5">
                <Flag className="size-3" /> Report this broker
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Pill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-xs">{icon}{children}</span>;
}
