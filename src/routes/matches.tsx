import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/site/Navbar";
import { motion } from "framer-motion";
import { MapPin, Wallet, BedDouble, ShieldCheck, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import api from "@/lib/api";

interface Match {
  id: string;
  score_breakdown: { location: number; budget: number; property: number; amenities: number };
  property_title: string;
  requirement_area: string;
  property_rent: number;
  property_type: string;
  status: string;
  broker_name?: string;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/matches")
      .then(({ data }) => { setMatches(data); setLoading(false); })
      .catch((err) => { setError(err.response?.data?.detail || "Failed to load matches"); setLoading(false); });
  }, []);

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

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Matches — RentSaathi</title></Helmet>
      <Navbar />
      <main className="container-rs py-12 md:py-20">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back to dashboard</Link>
        <div className="mt-6 max-w-2xl">
          <div className="text-xs uppercase tracking-wider text-accent font-medium">Smart matching</div>
          <h1 className="mt-3 font-display font-bold text-4xl md:text-5xl tracking-tight text-balance">Your matches</h1>
          <p className="mt-4 text-muted-foreground">Scored on budget, location, and property fit. Contact unlocks after admin verification.</p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl bg-destructive/10 border border-destructive/20 p-6 flex items-center gap-3 text-destructive">
            <AlertTriangle className="size-5" />
            <div className="text-sm">{error}</div>
            <button onClick={() => window.location.reload()} className="ml-auto text-xs underline">Retry</button>
          </div>
        )}

        {matches.length === 0 && !error && (
          <div className="mt-12 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No matches yet. Post a requirement to start getting matches.
          </div>
        )}

        <div className="mt-12 grid gap-5">
          {matches.map((m, i) => {
            const bd = m.score_breakdown || { location: 0, budget: 0, property: 0, amenities: 0 };
            const total = (bd.location || 0) + (bd.budget || 0) + (bd.property || 0) + (bd.amenities || 0);
            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}>
                <Link to={`/matches/${m.id}`}
                  className="block rounded-2xl border border-border bg-surface p-6 md:p-8 shadow-card-rs grid gap-6 md:grid-cols-[120px_1fr_280px] hover:border-accent/30 hover:shadow-elegant transition-all">
                  <div className="flex md:flex-col items-center gap-4">
                    <div className="relative">
                      <Ring value={total} />
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="text-center">
                          <div className="font-display font-bold text-xl leading-none">{total}<span className="text-xs">%</span></div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">match</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="font-display font-semibold text-xl">{m.property_title || "Property"}</div>
                    <div className="mt-1 text-sm text-muted-foreground inline-flex items-center gap-1"><MapPin className="size-3.5" />{m.requirement_area || "—"}</div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary"><BedDouble className="size-3" />{m.property_type || "—"}</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary"><Wallet className="size-3" />₹{m.property_rent?.toLocaleString("en-IN") || "—"}/mo</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent"><ShieldCheck className="size-3" />{m.status}</span>
                    </div>
                  </div>
                  <div className="space-y-3 md:border-l md:pl-6 border-border">
                    <Bar label="Budget" value={bd.budget || 0} max={30} />
                    <Bar label="Location" value={bd.location || 0} max={40} />
                    <Bar label="Property" value={bd.property || 0} max={20} />
                    <span className="mt-2 w-full h-10 rounded-full bg-primary text-primary-foreground text-sm font-medium grid place-items-center">View match</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function Ring({ value }: { value: number }) {
  const c = 2 * Math.PI * 36;
  return (
    <svg viewBox="0 0 80 80" className="size-20 -rotate-90">
      <circle cx="40" cy="40" r="36" className="stroke-secondary" strokeWidth="6" fill="none" />
      <motion.circle cx="40" cy="40" r="36" fill="none" className="stroke-accent" strokeWidth="6" strokeLinecap="round"
        strokeDasharray={c} initial={{ strokeDashoffset: c }} whileInView={{ strokeDashoffset: c - (c * value) / 100 }}
        viewport={{ once: true }} transition={{ duration: 1.2, ease: "easeOut" }} />
    </svg>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = (value / max) * 100;
  return (
    <div>
      <div className="flex justify-between text-xs"><span className="text-muted-foreground">{label}</span><span className="font-semibold">{value}/{max}</span></div>
      <div className="mt-1.5 h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div className="h-full bg-accent rounded-full" initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 1 }} />
      </div>
    </div>
  );
}
