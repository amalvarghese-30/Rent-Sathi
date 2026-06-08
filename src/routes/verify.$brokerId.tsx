import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/site/Navbar";
import { TrustBadge } from "@/components/brand/TrustBadge";
import { ArrowLeft, ShieldCheck, FileCheck2, Home, Phone, Star, MapPin, CheckCircle2 } from "lucide-react";

const checks = [
  { icon: ShieldCheck, label: "KYC checked", sub: "Govt-issued ID + selfie match", done: true },
  { icon: FileCheck2, label: "RERA / agency proof", sub: "Verified against state registry", done: true },
  { icon: Home, label: "Property verified", sub: "Photos + ownership/agreement", done: true },
  { icon: Phone, label: "Phone & email confirmed", sub: "Active OTP within 30 days", done: true },
  { icon: Star, label: "Reputation review", sub: "218 successful connections · 4.9 avg", done: true },
  { icon: CheckCircle2, label: "Availability confirmed", sub: "Listing checked in last 24 hours", done: false },
];

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Broker verification — RentSaathi</title></Helmet>
      <Navbar />
      <main className="container-rs py-10 md:py-14 max-w-4xl">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back
        </Link>

        <div className="mt-6 rounded-3xl border border-border bg-surface p-6 md:p-10 shadow-card-rs">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-primary text-primary-foreground grid place-items-center font-display font-bold text-lg">VR</div>
              <div>
                <div className="text-xs uppercase tracking-wider text-accent font-medium">Verified broker</div>
                <h1 className="mt-1 font-display font-bold text-3xl tracking-tight">Vikram Realty</h1>
                <div className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-1"><MapPin className="size-3" /> Mumbai · operating since 2018</div>
              </div>
            </div>
            <div className="rounded-2xl border border-accent/30 bg-accent/5 px-4 py-3 text-center">
              <div className="font-display font-bold text-3xl text-accent leading-none">A+</div>
              <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">Trust score</div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <TrustBadge kind="kyc" />
            <TrustBadge kind="verified" />
            <TrustBadge kind="human" />
            <TrustBadge kind="privacy" />
          </div>

          <div className="mt-8 grid sm:grid-cols-2 gap-3">
            {checks.map((c) => (
              <div key={c.label} className="rounded-xl border border-border bg-background p-4 flex items-start gap-3">
                <div className={`size-9 shrink-0 rounded-lg grid place-items-center ${c.done ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground"}`}>
                  <c.icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{c.label}</div>
                  <div className="text-xs text-muted-foreground">{c.sub}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${c.done ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"}`}>
                  {c.done ? "Verified" : "Pending"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-secondary/50 p-5 text-sm text-muted-foreground leading-relaxed">
            Every broker on RentSaathi is human-reviewed by our verification team. We re-check active brokers every 30 days,
            and your contact details stay hidden until you explicitly approve a match.
          </div>
        </div>
      </main>
    </div>
  );
}
