import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { DocsShell, Section, Card } from "@/components/docs/DocsShell";
import { Users, Building2, ShieldCheck, Database, Network, Lock, Rocket, ArrowRight, Workflow } from "lucide-react";

const JOURNEYS = [
  {
    title: "User journey",
    icon: Users,
    steps: ["Register & verify email", "Post requirement (6-step wizard)", "Receive matches privately", "Approve broker contact", "Connect securely"],
  },
  {
    title: "Broker journey",
    icon: Building2,
    steps: ["Register with RERA + KYC", "Admin verification (≤24h)", "List property (4-step)", "Receive matched leads", "Get user-approved contact"],
  },
  {
    title: "Admin journey",
    icon: ShieldCheck,
    steps: ["2FA sign-in", "Verify brokers & properties", "Review match queue", "Handle complaints", "Audit & analytics"],
  },
];

const TABLES = [
  { name: "users", fields: "id, email*, phone, name, status, created_at" },
  { name: "brokers", fields: "id, user_id→users, agency, rera_id*, kyc_status, trust_score" },
  { name: "broker_documents", fields: "id, broker_id, kind(pan|aadhaar|rera), url, status" },
  { name: "requirements", fields: "id, user_id, area, bhk, budget_min, budget_max, move_in, amenities[], status" },
  { name: "properties", fields: "id, broker_id, area, bhk, price, amenities[], photos[], status" },
  { name: "matches", fields: "id, requirement_id, property_id, score, admin_status, user_status" },
  { name: "contact_shares", fields: "id, match_id, shared_at, expires_at" },
  { name: "notifications", fields: "id, user_id, type, payload, read_at" },
  { name: "complaints", fields: "id, against_user_id, reason, status, resolution" },
  { name: "audit_logs", fields: "id, actor_id, action, target, meta, created_at (append-only)" },
];

const APIS: Array<{ m: "GET" | "POST" | "PATCH" | "DELETE"; path: string; desc: string }> = [
  { m: "POST", path: "/auth/register", desc: "Create account · returns session" },
  { m: "POST", path: "/auth/login", desc: "Email + password sign in" },
  { m: "POST", path: "/auth/forgot", desc: "Send recovery email" },
  { m: "POST", path: "/requirements", desc: "Submit rental requirement" },
  { m: "GET", path: "/requirements/:id", desc: "Status + timeline" },
  { m: "POST", path: "/broker/properties", desc: "Create property (pending review)" },
  { m: "GET", path: "/matches", desc: "Paginated matches for user" },
  { m: "POST", path: "/matches/:id/approve", desc: "Share contact with broker" },
  { m: "POST", path: "/admin/brokers/:id/verify", desc: "Admin verifies KYC" },
  { m: "POST", path: "/admin/complaints/:id/resolve", desc: "Resolve complaint with action" },
];

const PERMS = [
  { role: "Renter", can: ["Post requirements", "View own matches", "Approve contact"], cant: ["See broker contact pre-approval", "Verify others"] },
  { role: "Broker", can: ["List properties", "See matched (masked) leads", "Receive contact after approval"], cant: ["Browse users", "Self-verify"] },
  { role: "Admin", can: ["Verify brokers / properties", "Resolve complaints", "Access audit"], cant: ["Edit user requirements", "Read user passwords"] },
];

export default function ArchitecturePage() {
  return (
    <DocsShell
      title="Architecture"
      eyebrow="Founder + Engineering Reference"
      description="One place to understand how RentSaathi works end to end — journeys, data, APIs, permissions, security and deployment. Designed for engineering handoff."
    >
      <Helmet><title>Architecture — RentSaathi Engineering</title><meta name="description" content="Founder and engineering reference for RentSaathi: journeys, data model, APIs, permissions, security and deployment." /></Helmet>
      {/* TOC */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
        {[
          { id: "journeys", label: "Journeys", icon: Workflow },
          { id: "data", label: "Data model", icon: Database },
          { id: "apis", label: "API design", icon: Network },
          { id: "permissions", label: "Permissions", icon: Users },
          { id: "security", label: "Security", icon: Lock },
          { id: "deployment", label: "Deployment", icon: Rocket },
          { id: "next", label: "Next steps", icon: ArrowRight },
        ].map((t) => (
          <a key={t.id} href={`#${t.id}`} className="rounded-xl border border-border bg-surface p-4 hover:shadow-card-rs transition-shadow group">
            <div className="flex items-center justify-between">
              <t.icon className="size-4 text-accent" />
              <ArrowRight className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="mt-2 font-medium text-sm">{t.label}</div>
          </a>
        ))}
      </div>

      <Section id="journeys" kicker="Section 01" title="User, broker and admin journeys">
        <div className="grid md:grid-cols-3 gap-4">
          {JOURNEYS.map((j) => (
            <Card key={j.title}>
              <div className="flex items-center gap-2 mb-3">
                <div className="size-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
                  <j.icon className="size-4" />
                </div>
                <div className="font-display font-semibold">{j.title}</div>
              </div>
              <ol className="space-y-2">
                {j.steps.map((s, i) => (
                  <li key={s} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-[10px] font-semibold text-accent mt-1">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-foreground/90">{s}</span>
                  </li>
                ))}
              </ol>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="data" kicker="Section 02" title="Data model">
        <Card>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 font-mono text-xs">
            {TABLES.map((t) => (
              <div key={t.name} className="border-b border-border pb-2">
                <div className="text-foreground font-semibold">{t.name}</div>
                <div className="text-muted-foreground mt-1 leading-relaxed">{t.fields}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">All sensitive fields (phone, email, document URLs) are gated by row-level policies. <code>audit_logs</code> is append-only.</p>
        </Card>
      </Section>

      <Section id="apis" kicker="Section 03" title="API contract">
        <Card>
          <div className="divide-y divide-border">
            {APIS.map((a) => (
              <div key={a.path + a.m} className="flex items-center gap-4 py-3">
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md w-14 text-center ${
                  a.m === "GET" ? "bg-accent/10 text-accent" :
                  a.m === "POST" ? "bg-primary text-primary-foreground" :
                  "bg-secondary text-foreground"
                }`}>{a.m}</span>
                <code className="font-mono text-sm text-foreground">{a.path}</code>
                <span className="text-xs text-muted-foreground ml-auto">{a.desc}</span>
              </div>
            ))}
          </div>
          <Link to="/docs/api" className="mt-5 inline-flex items-center gap-1 text-sm text-accent font-medium">
            Full API reference <ArrowRight className="size-3.5" />
          </Link>
        </Card>
      </Section>

      <Section id="permissions" kicker="Section 04" title="Permissions matrix">
        <div className="grid md:grid-cols-3 gap-4">
          {PERMS.map((p) => (
            <Card key={p.role}>
              <div className="font-display font-semibold mb-3">{p.role}</div>
              <div className="text-[10px] uppercase tracking-widest text-success font-semibold mb-1">Can</div>
              <ul className="text-sm text-foreground space-y-1 mb-3">
                {p.can.map((c) => <li key={c}>• {c}</li>)}
              </ul>
              <div className="text-[10px] uppercase tracking-widest text-destructive font-semibold mb-1">Cannot</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                {p.cant.map((c) => <li key={c}>• {c}</li>)}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="security" kicker="Section 05" title="Security model">
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <div className="font-display font-semibold mb-2">Authentication</div>
            <ul className="text-sm space-y-1.5 text-muted-foreground">
              <li>• JWT access (15m) + rotating refresh (7d) httpOnly cookies</li>
              <li>• TOTP 2FA mandatory for admin role</li>
              <li>• Password reset tokens expire in 30 minutes</li>
              <li>• Rate-limited login + IP anomaly detection</li>
            </ul>
          </Card>
          <Card>
            <div className="font-display font-semibold mb-2">Data protection</div>
            <ul className="text-sm space-y-1.5 text-muted-foreground">
              <li>• Phone/email never sent in match payloads (masked)</li>
              <li>• KYC docs encrypted at rest, signed URLs only</li>
              <li>• Append-only audit log for every admin action</li>
              <li>• Contact share auto-expires after 14 days</li>
            </ul>
          </Card>
        </div>
        <Link to="/docs/security" className="mt-4 inline-flex items-center gap-1 text-sm text-accent font-medium">
          Security deep dive <ArrowRight className="size-3.5" />
        </Link>
      </Section>

      <Section id="deployment" kicker="Section 06" title="Deployment architecture">
        <Card>
          <pre className="text-xs leading-relaxed font-mono text-muted-foreground overflow-x-auto">
{`            ┌─────────────────────────────────────────┐
            │   CDN  (static · cached)                │
            └───────────────────┬─────────────────────┘
                                │
            ┌───────────────────▼─────────────────────┐
            │   Web app   ·  TanStack Start (SSR)     │
            └───────────────────┬─────────────────────┘
                                │ RPC / REST
            ┌───────────────────▼─────────────────────┐
            │   API   ·  Node serverless (TSS funcs)  │
            └────┬───────────┬───────────┬────────────┘
                 │           │           │
        ┌────────▼──┐  ┌─────▼─────┐ ┌───▼─────────┐
        │ Postgres  │  │  Storage  │ │  Email/SMS  │
        │ (Supabase)│  │ (signed)  │ │  provider   │
        └───────────┘  └───────────┘ └─────────────┘`}
          </pre>
        </Card>
      </Section>

      <Section id="next" kicker="Section 07" title="Engineering handoff">
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/docs/api" className="rounded-2xl border border-border p-5 bg-surface hover:shadow-card-rs transition-shadow">
            <div className="text-sm font-semibold">API Reference</div>
            <div className="text-xs text-muted-foreground mt-1">Every endpoint, request and response shape.</div>
          </Link>
          <Link to="/docs/readiness" className="rounded-2xl border border-border p-5 bg-surface hover:shadow-card-rs transition-shadow">
            <div className="text-sm font-semibold">Production Readiness</div>
            <div className="text-xs text-muted-foreground mt-1">Pre-launch checklist with owners.</div>
          </Link>
          <Link to="/docs/stack" className="rounded-2xl border border-border p-5 bg-surface hover:shadow-card-rs transition-shadow">
            <div className="text-sm font-semibold">Tech Stack Blueprint</div>
            <div className="text-xs text-muted-foreground mt-1">Languages, services, vendor choices.</div>
          </Link>
        </div>
      </Section>
    </DocsShell>
  );
}
