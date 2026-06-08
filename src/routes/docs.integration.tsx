import { Helmet } from "react-helmet-async";
import { DocsShell, Section, Card, Code } from "@/components/docs/DocsShell";
import { ArrowRight, CheckCircle2, Circle, Database, KeyRound } from "lucide-react";

// ---------- Route Inventory ----------
type Auth = "public" | "user" | "broker" | "admin";
const ROUTES: Array<{ path: string; purpose: string; auth: Auth }> = [
  { path: "/", purpose: "Landing + live matchmaker demo", auth: "public" },
  { path: "/architecture", purpose: "Founder + engineering reference", auth: "public" },
  { path: "/auth/login", purpose: "Email/password sign in", auth: "public" },
  { path: "/auth/register", purpose: "Renter sign-up", auth: "public" },
  { path: "/auth/forgot", purpose: "Request password reset email", auth: "public" },
  { path: "/auth/reset", purpose: "Set new password from token", auth: "public" },
  { path: "/auth/broker", purpose: "Broker register + KYC wizard", auth: "public" },
  { path: "/auth/admin", purpose: "Admin sign-in with 2FA", auth: "public" },
  { path: "/dashboard", purpose: "Renter home — requirements + matches", auth: "user" },
  { path: "/post", purpose: "Requirement creation wizard", auth: "user" },
  { path: "/requirements/:id", purpose: "Requirement detail + status timeline", auth: "user" },
  { path: "/matches", purpose: "Matches list for current user", auth: "user" },
  { path: "/matches/:id", purpose: "Match detail with approval flow", auth: "user" },
  { path: "/notifications", purpose: "Inbox", auth: "user" },
  { path: "/verify/:brokerId", purpose: "Public broker trust page", auth: "public" },
  { path: "/broker", purpose: "Broker dashboard — leads + properties", auth: "broker" },
  { path: "/broker/properties/new", purpose: "List a new property", auth: "broker" },
  { path: "/admin", purpose: "Admin operations hub", auth: "admin" },
  { path: "/admin/ops", purpose: "Funnel + KPIs", auth: "admin" },
  { path: "/admin/matches", purpose: "Match review queue", auth: "admin" },
  { path: "/admin/brokers/:id", purpose: "Broker KYC review", auth: "admin" },
  { path: "/admin/properties/:id", purpose: "Property verification review", auth: "admin" },
  { path: "/admin/complaints", purpose: "Complaint management", auth: "admin" },
  { path: "/admin/audit", purpose: "Immutable audit log viewer", auth: "admin" },
  { path: "/admin/schema", purpose: "DB + permissions reference", auth: "admin" },
];

// ---------- Component Inventory ----------
const COMPONENTS = [
  { name: "AuthShell", path: "components/auth/AuthShell.tsx", role: "Layout + Field/Input/PrimaryButton for auth screens" },
  { name: "AppShell", path: "components/app/AppShell.tsx", role: "Side + bottom navigation for user/broker/admin apps" },
  { name: "DocsShell", path: "components/docs/DocsShell.tsx", role: "Engineering docs layout (sidebar + sections)" },
  { name: "RequirementCard", path: "components/brand/RequirementCard.tsx", role: "Renter requirement summary card" },
  { name: "LeadCard", path: "components/brand/LeadCard.tsx", role: "Broker lead card with match score" },
  { name: "MatchRing", path: "components/brand/MatchRing.tsx", role: "Circular match-score ring" },
  { name: "StatusTimeline", path: "components/brand/StatusTimeline.tsx", role: "Multi-step status visualisation" },
  { name: "TrustBadge", path: "components/brand/TrustBadge.tsx", role: "Verification/privacy badge primitive" },
  { name: "EmptyState", path: "components/brand/EmptyState.tsx", role: "Polished empty-state block" },
  { name: "LiveMatchDemo", path: "components/site/LiveMatchDemo.tsx", role: "Interactive frontend matchmaking simulator" },
];

// ---------- API Dependency Map ----------
type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type Endpoint = { m: Method; path: string };
const FEATURES: Array<{
  feature: string;
  surfaces: string[];
  endpoints: Endpoint[];
  notes?: string;
}> = [
  {
    feature: "Account & sessions",
    surfaces: ["/auth/login", "/auth/register", "/auth/forgot", "/auth/reset", "/auth/admin"],
    endpoints: [
      { m: "POST", path: "/auth/register" },
      { m: "POST", path: "/auth/login" },
      { m: "POST", path: "/auth/logout" },
      { m: "POST", path: "/auth/forgot-password" },
      { m: "POST", path: "/auth/reset-password" },
      { m: "POST", path: "/auth/refresh" },
      { m: "POST", path: "/auth/admin/verify-otp" },
    ],
    notes: "JWT access (15m) + rotating refresh (7d) in httpOnly cookies.",
  },
  {
    feature: "Broker onboarding",
    surfaces: ["/auth/broker"],
    endpoints: [
      { m: "POST", path: "/brokers" },
      { m: "POST", path: "/brokers/me/documents" },
      { m: "GET", path: "/brokers/me/verification-status" },
    ],
  },
  {
    feature: "Renter requirements",
    surfaces: ["/post", "/dashboard", "/requirements/:id"],
    endpoints: [
      { m: "POST", path: "/requirements" },
      { m: "GET", path: "/requirements" },
      { m: "GET", path: "/requirements/{id}" },
      { m: "PUT", path: "/requirements/{id}" },
      { m: "DELETE", path: "/requirements/{id}" },
    ],
  },
  {
    feature: "Broker properties",
    surfaces: ["/broker", "/broker/properties/new"],
    endpoints: [
      { m: "POST", path: "/properties" },
      { m: "GET", path: "/properties" },
      { m: "PUT", path: "/properties/{id}" },
      { m: "DELETE", path: "/properties/{id}" },
      { m: "GET", path: "/broker/leads" },
    ],
  },
  {
    feature: "Matches & contact share",
    surfaces: ["/matches", "/matches/:id"],
    endpoints: [
      { m: "GET", path: "/matches" },
      { m: "GET", path: "/matches/{id}" },
      { m: "POST", path: "/matches/{id}/approve" },
      { m: "POST", path: "/matches/{id}/reject" },
    ],
    notes: "Contact only revealed after admin + user approval (double consent).",
  },
  {
    feature: "Notifications",
    surfaces: ["/notifications", "all in-app toasts"],
    endpoints: [
      { m: "GET", path: "/notifications" },
      { m: "POST", path: "/notifications/{id}/read" },
      { m: "GET", path: "/notifications/preferences" },
      { m: "PUT", path: "/notifications/preferences" },
    ],
  },
  {
    feature: "Admin — brokers",
    surfaces: ["/admin", "/admin/brokers/:id"],
    endpoints: [
      { m: "GET", path: "/admin/brokers" },
      { m: "GET", path: "/admin/brokers/{id}" },
      { m: "POST", path: "/admin/brokers/{id}/approve" },
      { m: "POST", path: "/admin/brokers/{id}/reject" },
    ],
  },
  {
    feature: "Admin — properties",
    surfaces: ["/admin", "/admin/properties/:id"],
    endpoints: [
      { m: "GET", path: "/admin/properties" },
      { m: "POST", path: "/admin/properties/{id}/approve" },
      { m: "POST", path: "/admin/properties/{id}/reject" },
    ],
  },
  {
    feature: "Admin — matches & complaints",
    surfaces: ["/admin/matches", "/admin/complaints", "/admin/audit"],
    endpoints: [
      { m: "GET", path: "/admin/matches" },
      { m: "POST", path: "/admin/matches/{id}/admin-approve" },
      { m: "GET", path: "/admin/complaints" },
      { m: "POST", path: "/admin/complaints/{id}/resolve" },
      { m: "GET", path: "/admin/audit" },
    ],
  },
  {
    feature: "File uploads",
    surfaces: ["/auth/broker (KYC)", "/broker/properties/new (photos)"],
    endpoints: [
      { m: "POST", path: "/uploads/sign" },
      { m: "POST", path: "/uploads/complete" },
    ],
    notes: "Client requests signed URL, PUTs directly to Cloudinary/S3, then notifies backend.",
  },
];

// ---------- Tables ----------
const TABLES = [
  { name: "users", cols: "id, name, email, phone, password_hash, role, is_active, created_at" },
  { name: "brokers", cols: "id, user_id→users, agency_name, pan_number, aadhaar_number, rera_number, trust_score, verification_status" },
  { name: "requirements", cols: "id, user_id, location, property_type, budget_min, budget_max, move_in_date, status" },
  { name: "properties", cols: "id, broker_id, title, location, rent, deposit, property_type, status" },
  { name: "matches", cols: "id, requirement_id, property_id, score, status" },
  { name: "complaints", cols: "id, user_id, broker_id, reason, status" },
  { name: "audit_logs", cols: "id, actor_id, action, entity_type, entity_id, created_at" },
];

const methodTone: Record<Method, string> = {
  GET: "bg-accent/10 text-accent",
  POST: "bg-primary text-primary-foreground",
  PUT: "bg-secondary text-foreground",
  PATCH: "bg-secondary text-foreground",
  DELETE: "bg-destructive/10 text-destructive",
};

const authTone: Record<Auth, string> = {
  public: "bg-secondary text-foreground",
  user: "bg-accent/10 text-accent",
  broker: "bg-primary/10 text-primary",
  admin: "bg-destructive/10 text-destructive",
};

export default function IntegrationAudit() {
  const totalEndpoints = new Set(FEATURES.flatMap((f) => f.endpoints.map((e) => `${e.m} ${e.path}`))).size;

  return (
    <DocsShell
      title="Backend Integration Audit"
      eyebrow="Phase 6A · Implementation checklist"
      description="Generated from the live frontend. Use this as the single source of truth when wiring the FastAPI backend: every route, every component and every API it depends on."
    >
      <Helmet><title>Backend Integration Audit — RentSaathi</title><meta name="description" content="Phase 6A audit: every route, component and the APIs they depend on. The single checklist for backend implementation." /></Helmet>
      {/* Summary */}
      <div className="grid md:grid-cols-4 gap-3 mb-12">
        <Card><div className="text-xs text-muted-foreground">Frontend routes</div><div className="font-display font-bold text-3xl mt-1">{ROUTES.length}</div></Card>
        <Card><div className="text-xs text-muted-foreground">Shared components</div><div className="font-display font-bold text-3xl mt-1">{COMPONENTS.length}</div></Card>
        <Card><div className="text-xs text-muted-foreground">API endpoints</div><div className="font-display font-bold text-3xl mt-1">{totalEndpoints}</div></Card>
        <Card><div className="text-xs text-muted-foreground">DB tables</div><div className="font-display font-bold text-3xl mt-1">{TABLES.length}</div></Card>
      </div>

      <Section id="routes" kicker="01" title="Route inventory">
        <Card className="p-0 overflow-hidden">
          <div className="grid grid-cols-[1fr_2fr_90px] text-[11px] uppercase tracking-widest text-muted-foreground bg-secondary/40 px-5 py-3 border-b border-border">
            <div>Route</div>
            <div>Purpose</div>
            <div className="text-right">Auth</div>
          </div>
          {ROUTES.map((r, i) => (
            <div key={r.path} className={`grid grid-cols-[1fr_2fr_90px] px-5 py-3 items-center text-sm ${i ? "border-t border-border" : ""}`}>
              <code className="font-mono text-xs text-foreground">{r.path}</code>
              <span className="text-muted-foreground text-xs">{r.purpose}</span>
              <span className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded-md w-fit justify-self-end ${authTone[r.auth]}`}>{r.auth}</span>
            </div>
          ))}
        </Card>
      </Section>

      <Section id="components" kicker="02" title="Component inventory">
        <Card>
          <div className="divide-y divide-border">
            {COMPONENTS.map((c) => (
              <div key={c.name} className="py-3 grid md:grid-cols-[200px_1fr_2fr] gap-3 items-start text-sm">
                <span className="font-semibold text-foreground">{c.name}</span>
                <code className="font-mono text-[11px] text-muted-foreground">{c.path}</code>
                <span className="text-xs text-muted-foreground">{c.role}</span>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section id="api-map" kicker="03" title="API dependency map">
        <div className="space-y-4">
          {FEATURES.map((f) => (
            <Card key={f.feature}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-display font-semibold text-base">{f.feature}</div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {f.surfaces.map((s) => (
                      <code key={s} className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-foreground">{s}</code>
                    ))}
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground mt-2 hidden md:block" />
                <div className="flex-1 min-w-[260px]">
                  <div className="space-y-1.5">
                    {f.endpoints.map((e) => (
                      <div key={e.m + e.path} className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md w-14 text-center ${methodTone[e.m]}`}>{e.m}</span>
                        <code className="font-mono text-xs text-foreground">{e.path}</code>
                      </div>
                    ))}
                  </div>
                  {f.notes && <div className="text-[11px] text-muted-foreground mt-3">{f.notes}</div>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="schema" kicker="04" title="Database tables">
        <Card>
          <div className="divide-y divide-border font-mono text-xs">
            {TABLES.map((t) => (
              <div key={t.name} className="py-3">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Database className="size-3.5 text-accent" /> {t.name}
                </div>
                <div className="text-muted-foreground mt-1 leading-relaxed pl-5">{t.cols}</div>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section id="stack" kicker="05" title="Recommended backend">
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { l: "Language / framework", v: "Python · FastAPI" },
            { l: "ORM / migrations", v: "SQLAlchemy 2.x · Alembic" },
            { l: "Database", v: "PostgreSQL 16" },
            { l: "File storage", v: "Cloudinary (signed uploads)" },
            { l: "Auth", v: "JWT (access 15m + refresh 7d)" },
            { l: "Queue / cron", v: "Celery + Redis or pg_cron" },
          ].map((s) => (
            <Card key={s.l}>
              <div className="text-[10px] uppercase tracking-widest text-accent font-semibold">{s.l}</div>
              <div className="font-display font-semibold mt-1">{s.v}</div>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="implementation" kicker="06" title="Suggested implementation order">
        <Card>
          <ol className="space-y-3 text-sm">
            {[
              "Bootstrap FastAPI app · SQLAlchemy session · Alembic baseline migration",
              "Auth module: register, login, refresh, forgot/reset password (JWT cookies)",
              "Users + roles + admin TOTP",
              "Brokers + KYC + Cloudinary signed-upload endpoint",
              "Requirements CRUD",
              "Properties CRUD + admin verification endpoints",
              "Matching worker (writes to matches with score)",
              "Match approval / rejection + contact share state machine",
              "Notifications persistence + email/SMS providers",
              "Complaints + immutable audit log",
              "Rate limiting · backups · staging cutover",
            ].map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                {i < 4 ? <CheckCircle2 className="size-4 text-success mt-0.5 shrink-0" /> : <Circle className="size-4 text-muted-foreground mt-0.5 shrink-0" />}
                <span className="text-foreground">
                  <span className="text-[11px] text-muted-foreground font-mono mr-2">{String(i + 1).padStart(2, "0")}</span>
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </Section>

      <Section id="example" kicker="07" title="Sample request — POST /requirements">
        <Code>{`POST /requirements
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "location": "Nerul, Navi Mumbai",
  "property_type": "1BHK",
  "budget_min": 15000,
  "budget_max": 20000,
  "move_in_date": "2026-07-01",
  "amenities": ["parking", "lift"]
}

→ 201 Created
{
  "id": "req_01HX7P...",
  "status": "matching",
  "created_at": "2026-06-07T08:14:22Z"
}`}</Code>
        <div className="text-[11px] text-muted-foreground mt-3 flex items-center gap-2">
          <KeyRound className="size-3.5" /> All authenticated endpoints expect a JWT bearer token or session cookie.
        </div>
      </Section>
    </DocsShell>
  );
}
