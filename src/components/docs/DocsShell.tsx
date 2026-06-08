import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Network, Bell, MessageSquare, HardDrive, Activity, Smartphone, Layers, ShieldCheck, ListChecks, Building2, Plug } from "lucide-react";
import type { ReactNode } from "react";

const DOCS_NAV = [
  { to: "/architecture", label: "Architecture", icon: Network, group: "Overview" },
  { to: "/docs/integration", label: "Integration Audit", icon: Plug, group: "Overview" },
  { to: "/docs/api", label: "API Reference", icon: BookOpen, group: "Engineering" },
  { to: "/docs/notifications", label: "Notifications", icon: Bell, group: "Engineering" },
  { to: "/docs/messages", label: "Messages", icon: MessageSquare, group: "Engineering" },
  { to: "/docs/storage", label: "File Storage", icon: HardDrive, group: "Engineering" },
  { to: "/docs/states", label: "System States", icon: Activity, group: "Quality" },
  { to: "/docs/mobile", label: "Mobile Audit", icon: Smartphone, group: "Quality" },
  { to: "/docs/stack", label: "Tech Stack", icon: Layers, group: "Production" },
  { to: "/docs/security", label: "Security", icon: ShieldCheck, group: "Production" },
  { to: "/docs/readiness", label: "Readiness", icon: ListChecks, group: "Production" },
];


export function DocsShell({
  title,
  eyebrow,
  description,
  children,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
}) {
  const { pathname } = useLocation();
  const groups = Array.from(new Set(DOCS_NAV.map((n) => n.group)));
  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-border bg-surface">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-border">
          <div className="size-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <Home className="size-4" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display font-bold tracking-tight leading-none">RentSaathi</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">Engineering Docs</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          {groups.map((g) => (
            <div key={g}>
              <div className="px-3 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">{g}</div>
              <nav className="space-y-0.5">
                {DOCS_NAV.filter((n) => n.group === g).map((n) => {
                  const active = pathname === n.to;
                  return (
                    <Link
                      key={n.to}
                      to={n.to}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <n.icon className="size-4" />
                      {n.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-border">
          <Link to="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <Building2 className="size-3.5" /> Back to product
          </Link>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 lg:px-10 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30">
          <div>
            {eyebrow && <div className="text-[10px] uppercase tracking-widest text-accent font-semibold">{eyebrow}</div>}
            <div className="font-display font-semibold text-lg tracking-tight">{title}</div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-success" /> Build-ready
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-12 max-w-5xl w-full mx-auto">
          {description && <p className="text-muted-foreground max-w-2xl mb-10">{description}</p>}
          {children}
        </main>
        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-surface border-border px-2 py-2">
          <div className="flex items-center justify-around overflow-x-auto">
            {DOCS_NAV.slice(0, 5).map((n) => {
              const active = pathname === n.to;
              return (
                <Link key={n.to} to={n.to} className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] ${active ? "text-accent" : "text-muted-foreground"}`}>
                  <n.icon className="size-4" />
                  {n.label.split(" ")[0]}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

export function Section({ id, title, kicker, children }: { id?: string; title: string; kicker?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 mb-14">
      {kicker && <div className="text-[10px] uppercase tracking-widest text-accent font-semibold mb-2">{kicker}</div>}
      <h2 className="font-display font-bold text-2xl tracking-tight text-foreground">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-surface p-6 shadow-card-rs ${className}`}>{children}</div>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return (
    <pre className="rounded-xl bg-primary text-primary-foreground/90 text-[12.5px] leading-relaxed p-4 overflow-x-auto font-mono">
      {children}
    </pre>
  );
}

export function StateRow({
  state,
  copy,
  tone,
}: {
  state: "Loading" | "Empty" | "Error" | "Success";
  copy: string;
  tone: "neutral" | "warn" | "danger" | "ok";
}) {
  const toneClass = {
    neutral: "bg-secondary text-muted-foreground",
    warn: "bg-accent/10 text-accent",
    danger: "bg-destructive/10 text-destructive",
    ok: "bg-success/10 text-success",
  }[tone];
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <span className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded-md ${toneClass}`}>{state}</span>
      <span className="text-sm text-foreground">{copy}</span>
    </div>
  );
}
