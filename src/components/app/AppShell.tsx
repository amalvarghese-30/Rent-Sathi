import { Link, useLocation } from "react-router-dom";
import { Home, LogOut, type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export function AppShell({
  nav, title, subtitle, accentLabel, theme = "light", children, showLogout = false,
}: {
  nav: NavItem[];
  title: string;
  subtitle?: string;
  accentLabel: string;
  theme?: "light" | "dark";
  children: ReactNode;
  showLogout?: boolean;
}) {
  const { logout } = useAuth();
  const { pathname } = useLocation();
  const dark = theme === "dark";
  return (
    <div className={`min-h-screen ${dark ? "bg-primary" : "bg-background"} flex`}>
      <aside className={`hidden lg:flex flex-col w-64 shrink-0 ${dark ? "bg-primary border-r border-white/10" : "bg-primary"} text-primary-foreground`}>
        <div className="h-16 flex items-center gap-2 px-6 border-b border-white/10">
          <div className="size-8 rounded-lg bg-accent text-accent-foreground grid place-items-center">
            <Home className="size-4" strokeWidth={2.5} />
          </div>
          <div className="font-display font-bold tracking-tight">RentSaathi</div>
        </div>
        <div className="px-3 py-5">
          <div className="px-3 text-[10px] uppercase tracking-wider text-primary-foreground/50 mb-2">{accentLabel}</div>
          <nav className="space-y-0.5">
            {nav.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to} to={n.to}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active ? "bg-white/10 text-white" : "text-primary-foreground/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <n.icon className="size-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t border-white/10">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="text-xs text-primary-foreground/60">Need help?</div>
            <div className="mt-1 text-sm font-medium">Talk to support</div>
          </div>
        </div>
      </aside>

      <div className={`flex-1 flex flex-col min-w-0 ${dark ? "bg-[oklch(0.16_0.025_264)] text-primary-foreground" : "bg-background"}`}>
        <header className={`h-16 flex items-center justify-between px-6 lg:px-10 border-b ${dark ? "border-white/10" : "border-border"}`}>
          <div>
            <div className="font-display font-semibold text-lg tracking-tight">{title}</div>
            {subtitle && <div className={`text-xs ${dark ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{subtitle}</div>}
          </div>
          <div className="flex items-center gap-3">
            <div className={`hidden md:flex items-center gap-2 text-xs ${dark ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
              <span className="size-1.5 rounded-full bg-success" />
              All systems normal
            </div>
            {showLogout && (
              <button
                onClick={() => logout()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  dark ? "text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <LogOut className="size-3.5" />
                Logout
              </button>
            )}
            <div className="size-9 rounded-full bg-accent text-accent-foreground grid place-items-center font-semibold text-sm">RS</div>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-10 pb-24 lg:pb-10">{children}</main>

        {/* Mobile bottom nav */}
        <nav className={`lg:hidden fixed bottom-0 inset-x-0 z-40 border-t ${dark ? "bg-primary border-white/10" : "bg-surface border-border"} px-2 py-2`}>
          <div className="flex items-center justify-around">
            {nav.slice(0, 5).map((n) => {
              const active = pathname === n.to;
              return (
                <Link key={n.to} to={n.to} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] ${active ? "text-accent" : dark ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  <n.icon className="size-5" />
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

export function StatCard({ label, value, delta, accent }: { label: string; value: string; delta?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-6 ${accent ? "bg-primary text-primary-foreground border-primary" : "bg-surface border-border"} shadow-card-rs`}>
      <div className={`text-xs ${accent ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{label}</div>
      <div className="mt-2 font-display font-bold text-3xl tracking-tight">{value}</div>
      {delta && <div className={`mt-1 text-xs ${accent ? "text-accent" : "text-success"}`}>{delta}</div>}
    </div>
  );
}
