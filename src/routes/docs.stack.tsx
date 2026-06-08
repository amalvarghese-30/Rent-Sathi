import { Helmet } from "react-helmet-async";
import { DocsShell, Section, Card } from "@/components/docs/DocsShell";

const STACK = [
  { layer: "Frontend", choice: "TanStack Start (React 19, Vite)", why: "SSR + typed file routing; works with edge runtimes." },
  { layer: "UI system", choice: "Tailwind v4 · shadcn · Inter Tight", why: "Token-driven; consistent across product + docs." },
  { layer: "State / data", choice: "TanStack Query + server functions", why: "Loader-first, server-validated, no useEffect/fetch." },
  { layer: "Backend", choice: "Node serverless (TSS server fns + routes)", why: "Co-located with frontend; per-request scope." },
  { layer: "Database", choice: "PostgreSQL (Supabase)", why: "Row-level security, audit-friendly, generous free tier." },
  { layer: "Auth", choice: "Email + password, OTP for admin (TOTP)", why: "JWT 15m + refresh 7d; httpOnly cookies." },
  { layer: "Storage", choice: "Supabase Storage (private buckets)", why: "Signed URLs, EXIF stripping at edge." },
  { layer: "Email", choice: "Resend (transactional)", why: "Templates in code; good deliverability." },
  { layer: "SMS", choice: "MSG91 (India)", why: "DLT-compliant for transactional templates." },
  { layer: "Background jobs", choice: "Postgres + pg_cron for retries / digests", why: "No extra infra; auditable." },
  { layer: "Observability", choice: "Logflare (logs) + Sentry (errors)", why: "Lightweight, hosted." },
  { layer: "Hosting", choice: "Cloudflare (edge) + Supabase (db/storage)", why: "Stable URLs, regional cache." },
];

export default function StackDocs() {
  return (
    <DocsShell title="Tech Stack Blueprint" eyebrow="Production reference" description="Vendor + technology choices for the build-ready RentSaathi. Optimized for a 2-engineer team and the Indian market.">
      <Helmet><title>Tech Stack Blueprint — RentSaathi</title></Helmet>
      <Section title="Layer by layer">
        <Card>
          <div className="divide-y divide-border">
            {STACK.map((s) => (
              <div key={s.layer} className="py-3 grid md:grid-cols-[160px_1fr_2fr] gap-3 items-start text-sm">
                <span className="text-foreground font-semibold">{s.layer}</span>
                <span className="text-foreground">{s.choice}</span>
                <span className="text-xs text-muted-foreground">{s.why}</span>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section title="Environments">
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { e: "dev", url: "project--{id}-dev.lovable.app", notes: "Hot reload, seeded data" },
            { e: "staging", url: "staging.rentsaathi.in", notes: "Mirrors prod, anonymized data" },
            { e: "production", url: "rentsaathi.in", notes: "Locked migrations, blue/green" },
          ].map((e) => (
            <Card key={e.e}>
              <div className="text-[10px] uppercase tracking-widest text-accent font-semibold">{e.e}</div>
              <div className="font-mono text-sm mt-1 break-all">{e.url}</div>
              <div className="text-xs text-muted-foreground mt-2">{e.notes}</div>
            </Card>
          ))}
        </div>
      </Section>
    </DocsShell>
  );
}
