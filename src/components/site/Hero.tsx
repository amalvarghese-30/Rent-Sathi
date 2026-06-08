import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Sparkles, MapPin, Wallet, User, Calendar, ArrowDown, CheckCircle2 } from "lucide-react";
import { MatchRing } from "@/components/brand/MatchRing";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-[0.35] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="absolute -top-40 right-1/4 size-[480px] rounded-full bg-accent/10 blur-3xl" />
      <div className="container-rs relative pt-20 pb-24 md:pt-28 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground shadow-card-rs">
            <span className="size-1.5 rounded-full bg-accent animate-pulse" />
            A matchmaker for rentals — not another listings site
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }}
          className="mt-6 text-center font-display font-bold text-balance text-5xl md:text-7xl leading-[1.02] tracking-tight"
        >
          Post your requirement.<br />
          <span className="text-muted-foreground">Get </span>
          <span className="relative inline-block">
            matched.
            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-accent rounded-full" />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-center text-lg text-muted-foreground text-balance"
        >
          Tell us the home you need. <span className="text-foreground font-medium">Verified brokers</span> bring you scored, matched properties — no spam calls, no scroll fatigue, contact stays private until you approve it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button size="lg" className="rounded-full px-6 h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-elegant">
            Post my requirement <ArrowRight className="ml-1 size-4" />
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-6 h-12 border-border bg-surface hover:bg-secondary">
            Apply as broker
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground"
        >
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> Admin-verified brokers</span>
          <span className="inline-flex items-center gap-1.5"><Sparkles className="size-3.5" /> AI-scored matches</span>
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-3.5" /> Contact stays private</span>
        </motion.div>

        {/* Matchmaking visual: Requirement → Match → Broker lead */}
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4 }}
          className="relative mt-20 mx-auto max-w-5xl"
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] items-center">
            {/* Renter requirement */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-elegant">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Renter posted</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">
                  <span className="size-1 rounded-full bg-success animate-pulse" /> Active
                </span>
              </div>
              <div className="mt-3 font-display font-bold text-2xl tracking-tight">1 BHK · Nerul</div>
              <div className="mt-1 text-sm text-muted-foreground inline-flex items-center gap-1"><MapPin className="size-3.5" />Sector 10, near station</div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-secondary/60 p-2.5">
                  <div className="text-muted-foreground flex items-center gap-1"><Wallet className="size-3" />Budget</div>
                  <div className="mt-1 font-semibold">₹15–20k</div>
                </div>
                <div className="rounded-lg bg-secondary/60 p-2.5">
                  <div className="text-muted-foreground flex items-center gap-1"><User className="size-3" />Tenant</div>
                  <div className="mt-1 font-semibold">Bachelor</div>
                </div>
                <div className="rounded-lg bg-secondary/60 p-2.5">
                  <div className="text-muted-foreground flex items-center gap-1"><Calendar className="size-3" />Move-in</div>
                  <div className="mt-1 font-semibold">July</div>
                </div>
              </div>
            </div>

            {/* Match ring connector */}
            <div className="flex lg:flex-col items-center justify-center gap-3">
              <div className="hidden lg:block w-px h-12 bg-gradient-to-b from-transparent to-border" />
              <div className="relative">
                <div className="absolute -inset-3 rounded-full bg-accent/10 blur-xl" />
                <div className="relative rounded-full bg-surface border border-border p-3 shadow-elegant">
                  <MatchRing value={94} size={88} label="match" />
                </div>
              </div>
              <ArrowDown className="size-4 text-muted-foreground/60 lg:rotate-0 -rotate-90" />
              <div className="hidden lg:block w-px h-12 bg-gradient-to-t from-transparent to-border" />
            </div>

            {/* Broker lead */}
            <div className="rounded-2xl border border-border bg-primary text-primary-foreground p-6 shadow-elegant">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-primary-foreground/60 font-medium">Broker matched</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                  <ShieldCheck className="size-3" /> Verified
                </span>
              </div>
              <div className="mt-3 font-display font-bold text-2xl tracking-tight">Skyline Heights</div>
              <div className="mt-1 text-sm text-primary-foreground/60 inline-flex items-center gap-1"><MapPin className="size-3.5" />Nerul, Sector 11 · 400m</div>
              <div className="mt-5 space-y-2.5">
                {[
                  { l: "Budget compatibility", v: 96 },
                  { l: "Location compatibility", v: 98 },
                  { l: "Property compatibility", v: 88 },
                ].map((b) => (
                  <div key={b.l}>
                    <div className="flex justify-between text-[11px]"><span className="text-primary-foreground/60">{b.l}</span><span className="font-semibold">{b.v}%</span></div>
                    <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden">
                      <motion.div className="h-full bg-accent" initial={{ width: 0 }} animate={{ width: `${b.v}%` }} transition={{ duration: 1.2, delay: 0.6 }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs text-primary-foreground/60">Vikram Realty · 4.9★</span>
                <button className="text-xs font-medium px-3 py-1.5 rounded-full bg-accent text-accent-foreground">Approve contact</button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">Live example — typical match found in under 4 hours.</div>
        </motion.div>
      </div>
    </section>
  );
}
