import { Helmet } from "react-helmet-async";
import { DocsShell, Section, Card } from "@/components/docs/DocsShell";
import { CheckCircle2, AlertTriangle, Smartphone, Tablet, Monitor } from "lucide-react";

type Status = "ok" | "warn" | "todo";
const ROUTES: Array<{ path: string; mobile: Status; tablet: Status; desktop: Status; notes: string }> = [
  { path: "/", mobile: "ok", tablet: "ok", desktop: "ok", notes: "Hero stacks, demo collapses, sticky CTA" },
  { path: "/post", mobile: "ok", tablet: "ok", desktop: "ok", notes: "Wizard becomes full-screen on mobile" },
  { path: "/dashboard", mobile: "ok", tablet: "ok", desktop: "ok", notes: "Bottom nav + condensed stats" },
  { path: "/matches", mobile: "ok", tablet: "ok", desktop: "ok", notes: "Single-column cards" },
  { path: "/matches/:id", mobile: "warn", tablet: "ok", desktop: "ok", notes: "Sidebar moves below content on mobile" },
  { path: "/requirements/:id", mobile: "ok", tablet: "ok", desktop: "ok", notes: "Timeline becomes vertical chips" },
  { path: "/broker", mobile: "ok", tablet: "ok", desktop: "ok", notes: "Lead cards stack; metrics 2-up" },
  { path: "/broker/properties/new", mobile: "warn", tablet: "ok", desktop: "ok", notes: "Photo grid needs sticky upload" },
  { path: "/admin", mobile: "warn", tablet: "ok", desktop: "ok", notes: "Operations queues prefer tablet+" },
  { path: "/admin/audit", mobile: "todo", tablet: "warn", desktop: "ok", notes: "Wide table; mobile shows compact rows" },
  { path: "/notifications", mobile: "ok", tablet: "ok", desktop: "ok", notes: "Inbox-style list at all breakpoints" },
  { path: "/architecture", mobile: "ok", tablet: "ok", desktop: "ok", notes: "Side nav hidden, bottom nav active" },
];

const icon = (s: Status) => s === "ok" ? <CheckCircle2 className="size-4 text-success" /> : s === "warn" ? <AlertTriangle className="size-4 text-accent" /> : <AlertTriangle className="size-4 text-destructive" />;

export default function MobileDocs() {
  return (
    <DocsShell title="Mobile Audit" eyebrow="Responsive QA" description="Per-route validation across mobile, tablet and desktop breakpoints. Issues are tracked here before launch.">
      <Helmet><title>Mobile Audit — RentSaathi</title></Helmet>
      <Section title="Breakpoint matrix">
        <Card className="p-0 overflow-hidden">
          <div className="grid grid-cols-[1fr_60px_60px_60px_2fr] text-[11px] uppercase tracking-widest text-muted-foreground bg-secondary/40 px-5 py-3 border-b border-border">
            <div>Route</div>
            <div className="text-center"><Smartphone className="size-3.5 mx-auto" /></div>
            <div className="text-center"><Tablet className="size-3.5 mx-auto" /></div>
            <div className="text-center"><Monitor className="size-3.5 mx-auto" /></div>
            <div>Notes</div>
          </div>
          {ROUTES.map((r, i) => (
            <div key={r.path} className={`grid grid-cols-[1fr_60px_60px_60px_2fr] px-5 py-3 items-center text-sm ${i ? "border-t border-border" : ""}`}>
              <code className="font-mono text-xs text-foreground">{r.path}</code>
              <div className="text-center">{icon(r.mobile)}</div>
              <div className="text-center">{icon(r.tablet)}</div>
              <div className="text-center">{icon(r.desktop)}</div>
              <div className="text-xs text-muted-foreground">{r.notes}</div>
            </div>
          ))}
        </Card>
      </Section>

      <Section title="Mobile-first principles">
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { t: "Thumb-zone CTAs", d: "Primary actions reachable with one thumb; sticky bottom bar when needed." },
            { t: "Bottom navigation", d: "5-item nav on /dashboard, /broker, /admin replacing sidebar on small screens." },
            { t: "Type rhythm", d: "Min 15px body, 13px metadata; no horizontal scroll except code blocks." },
          ].map((p) => (
            <Card key={p.t}>
              <div className="text-sm font-semibold">{p.t}</div>
              <div className="text-xs text-muted-foreground mt-1">{p.d}</div>
            </Card>
          ))}
        </div>
      </Section>
    </DocsShell>
  );
}
