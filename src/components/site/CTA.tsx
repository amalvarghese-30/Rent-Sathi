import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Lock, BadgeCheck, BellOff, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

const trust = [
  { icon: BadgeCheck, label: "Verified brokers" },
  { icon: Lock, label: "Privacy protected" },
  { icon: UserCheck, label: "Requirement first" },
  { icon: BellOff, label: "No spam calls" },
  { icon: ShieldCheck, label: "Human verification" },
];

export function CTA() {
  return (
    <section className="py-16 md:py-20">
      <div className="container-rs">
        <div className="rounded-3xl border border-border bg-surface p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 size-[420px] rounded-full bg-accent/10 blur-3xl" />
          <div className="relative">
            <div className="text-xs uppercase tracking-wider text-accent font-medium">Your next home should find you</div>
            <h2 className="mt-3 font-display font-bold text-3xl md:text-5xl tracking-tight text-balance">
              Stop scrolling listings.<br />Start receiving matches.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Post once. Let verified brokers compete for your requirement — privately, on your terms.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild className="rounded-full px-6 h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-elegant">
                <Link to="/dashboard">Post a requirement <ArrowRight className="ml-1 size-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full px-6 h-12">
                <Link to="/broker">Apply as a broker</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {trust.map((t) => (
                <span key={t.label} className="inline-flex items-center gap-1.5">
                  <t.icon className="size-3.5 text-accent" /> {t.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
