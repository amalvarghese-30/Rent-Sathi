import { Link } from "react-router-dom";
import { Home, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  footer,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left: form */}
      <div className="flex flex-col">
        <header className="h-16 flex items-center px-6 lg:px-10 border-b border-border/60">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary text-primary-foreground grid place-items-center shadow-elegant">
              <Home className="size-4" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold tracking-tight">RentSaathi</span>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-md">
            <div className="text-[11px] uppercase tracking-widest text-accent font-semibold mb-3">
              {eyebrow}
            </div>
            <h1 className="font-display font-bold text-3xl tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            )}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
          </div>
        </main>
        <footer className="hidden lg:flex h-12 items-center px-10 text-xs text-muted-foreground border-t border-border/60">
          © 2026 RentSaathi · Privacy-first matchmaking
        </footer>
      </div>
      {/* Right: trust panel */}
      <div className="hidden lg:flex relative bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="inline-flex items-center gap-2 text-xs text-primary-foreground/70 self-start">
            <ShieldCheck className="size-4 text-accent" /> Privacy-first authentication
          </div>
          <div>
            <div className="font-display font-bold text-4xl tracking-tight leading-tight">
              Your contact details stay private until <span className="text-accent">you approve</span> a broker.
            </div>
            <p className="mt-4 text-primary-foreground/70 max-w-md">
              Every account is verified by a human reviewer before it can interact on the platform.
              No scraping, no lead resale, no spam.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { k: "97%", v: "Broker verification" },
                { k: "4.2h", v: "Avg. match time" },
                { k: "100%", v: "Contact privacy" },
              ].map((s) => (
                <div key={s.k} className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="font-display font-bold text-2xl">{s.k}</div>
                  <div className="text-[11px] text-primary-foreground/60 mt-1">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-foreground">{label}</span>
      {children}
      {error ? (
        <span className="text-xs text-destructive">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  const { invalid, className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full h-11 px-3.5 rounded-xl border bg-surface text-sm outline-none transition-colors
        ${invalid ? "border-destructive focus:ring-2 focus:ring-destructive/20" : "border-border focus:border-accent focus:ring-2 focus:ring-accent/20"}
        ${className}`}
    />
  );
}

export function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-elegant disabled:opacity-50"
    >
      {children}
    </button>
  );
}
