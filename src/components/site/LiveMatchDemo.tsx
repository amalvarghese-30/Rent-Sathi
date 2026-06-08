import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Wallet, BedDouble, ShieldCheck, Sparkles } from "lucide-react";
import { MatchRing } from "@/components/brand/MatchRing";

const areas = ["Nerul", "Koramangala", "HSR Layout", "Powai", "Indiranagar"];
const bhks = ["Studio", "1 BHK", "2 BHK", "3 BHK"];

type Broker = { name: string; area: string; bhk: string; price: number; rating: number };

const POOL: Broker[] = [
  { name: "Skyline Heights", area: "Nerul", bhk: "1 BHK", price: 18000, rating: 4.9 },
  { name: "Palm Meadows", area: "Nerul", bhk: "2 BHK", price: 32000, rating: 4.7 },
  { name: "Urban Nest", area: "Koramangala", bhk: "1 BHK", price: 28000, rating: 4.8 },
  { name: "Forum Residences", area: "Koramangala", bhk: "2 BHK", price: 46000, rating: 4.6 },
  { name: "Lake View Apartments", area: "HSR Layout", bhk: "Studio", price: 22000, rating: 4.5 },
  { name: "Hiranandani Estate", area: "Powai", bhk: "2 BHK", price: 52000, rating: 4.9 },
  { name: "Brigade Court", area: "Indiranagar", bhk: "3 BHK", price: 68000, rating: 4.7 },
  { name: "Green Acres", area: "Nerul", bhk: "Studio", price: 14000, rating: 4.4 },
  { name: "Riverside Towers", area: "Powai", bhk: "1 BHK", price: 30000, rating: 4.6 },
];

function scoreBroker(b: Broker, area: string, bhk: string, budget: number) {
  const loc = b.area === area ? 100 : 55;
  const type = b.bhk === bhk ? 100 : 60;
  const diff = Math.abs(b.price - budget) / budget;
  const bud = Math.max(40, Math.round(100 - diff * 140));
  return Math.round(loc * 0.4 + type * 0.3 + bud * 0.3);
}

export function LiveMatchDemo() {
  const [area, setArea] = useState("Nerul");
  const [bhk, setBhk] = useState("1 BHK");
  const [budget, setBudget] = useState(20000);

  const matches = useMemo(() => {
    return POOL.map((b) => ({ ...b, score: scoreBroker(b, area, bhk, budget) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [area, bhk, budget]);

  const top = matches[0];

  return (
    <section id="demo" className="py-16 md:py-20 border-t border-border/60">
      <div className="container-rs">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 max-w-3xl">
          <div>
            <div className="text-xs uppercase tracking-wider text-accent font-medium">Try the matchmaker</div>
            <h2 className="mt-3 font-display font-bold text-3xl md:text-4xl tracking-tight text-balance">
              Change your requirement. Watch the match score move.
            </h2>
            <p className="mt-3 text-muted-foreground">
              This is exactly how the platform thinks. No listings to scroll — just scored matches against what you actually need.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_1.2fr] items-stretch">
          {/* Requirement panel */}
          <div className="rounded-3xl border border-border bg-surface p-7 shadow-elegant">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Your requirement</div>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">
                <span className="size-1 rounded-full bg-success animate-pulse" /> Live
              </span>
            </div>

            <div className="mt-5 space-y-5">
              <Field label="Location" icon={<MapPin className="size-3.5" />}>
                <div className="flex flex-wrap gap-2">
                  {areas.map((a) => (
                    <Chip key={a} active={a === area} onClick={() => setArea(a)}>{a}</Chip>
                  ))}
                </div>
              </Field>

              <Field label="Property type" icon={<BedDouble className="size-3.5" />}>
                <div className="flex flex-wrap gap-2">
                  {bhks.map((b) => (
                    <Chip key={b} active={b === bhk} onClick={() => setBhk(b)}>{b}</Chip>
                  ))}
                </div>
              </Field>

              <Field label="Budget" icon={<Wallet className="size-3.5" />}>
                <div className="flex items-baseline justify-between">
                  <div className="font-display font-bold text-2xl tracking-tight">₹{budget.toLocaleString("en-IN")}</div>
                  <div className="text-xs text-muted-foreground">per month</div>
                </div>
                <input
                  type="range"
                  min={8000}
                  max={80000}
                  step={1000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="mt-3 w-full accent-accent"
                  aria-label={`Budget: ₹${budget.toLocaleString("en-IN")} per month`}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>₹8k</span><span>₹80k</span>
                </div>
              </Field>
            </div>
          </div>

          {/* Matches panel */}
          <div className="rounded-3xl border border-border bg-gradient-to-br from-primary to-primary/95 text-primary-foreground p-7 shadow-elegant relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-primary-foreground/60 font-medium inline-flex items-center gap-1"><Sparkles className="size-3" /> Matchmaker output</div>
                  <div className="mt-2 font-display font-bold text-2xl">Top match: {top.name}</div>
                  <div className="text-sm text-primary-foreground/70 inline-flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="size-3.5" /> Verified broker · {top.rating}★
                  </div>
                </div>
                <div className="rounded-full bg-white/5 border border-white/10 p-2">
                  <MatchRing value={top.score} size={86} label="match" />
                </div>
              </div>

              <div className="mt-6 space-y-2.5">
                {matches.map((m, i) => (
                  <motion.div
                    key={m.name}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex items-center gap-4 rounded-xl bg-white/[0.04] border border-white/10 p-3"
                  >
                    <div className="font-display font-bold text-xl w-12 text-accent">{m.score}%</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{m.name}</div>
                      <div className="text-[11px] text-primary-foreground/60 truncate">{m.bhk} · {m.area} · ₹{m.price.toLocaleString("en-IN")}</div>
                    </div>
                    <div className="h-1.5 w-24 rounded-full bg-white/10 overflow-hidden hidden sm:block">
                      <motion.div
                        className="h-full bg-accent"
                        initial={false}
                        animate={{ width: `${m.score}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-5 text-[11px] text-primary-foreground/60">
                Brokers see your scored requirement — not your number. Contact unlocks only when you approve.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium inline-flex items-center gap-1.5 mb-2">{icon}{label}</div>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
        active
          ? "bg-primary text-primary-foreground border-primary shadow-elegant"
          : "bg-surface border-border text-foreground/70 hover:border-accent/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
