import { Helmet } from "react-helmet-async";
import { AppShell } from "@/components/app/AppShell";
import { adminNav } from "@/components/app/adminNav";
import { Database, Key, ArrowRight } from "lucide-react";
import { REQUIREMENT_STATUSES, PROPERTY_STATUSES, MATCH_STATUSES, WEIGHTS } from "@/lib/matching";

type Field = { name: string; type: string; pk?: boolean; fk?: string };
type Table = { name: string; icon: string; fields: Field[] };

const tables: Table[] = [
  { name: "users", icon: "U", fields: [
    { name: "id", type: "uuid", pk: true },
    { name: "name", type: "text" },
    { name: "email", type: "text" },
    { name: "phone", type: "text" },
    { name: "role", type: "enum: renter | broker | admin" },
    { name: "created_at", type: "timestamptz" },
  ] },
  { name: "brokers", icon: "B", fields: [
    { name: "id", type: "uuid", pk: true },
    { name: "user_id", type: "uuid", fk: "users.id" },
    { name: "agency_name", type: "text" },
    { name: "pan", type: "text · encrypted" },
    { name: "aadhaar", type: "text · encrypted" },
    { name: "verification_status", type: "enum: pending | verified | suspended" },
    { name: "trust_score", type: "int (0-100)" },
  ] },
  { name: "requirements", icon: "R", fields: [
    { name: "id", type: "uuid", pk: true },
    { name: "user_id", type: "uuid", fk: "users.id" },
    { name: "area", type: "text" },
    { name: "budget_min", type: "int" },
    { name: "budget_max", type: "int" },
    { name: "property_type", type: "enum" },
    { name: "amenities", type: "text[]" },
    { name: "status", type: "requirement_status" },
  ] },
  { name: "properties", icon: "P", fields: [
    { name: "id", type: "uuid", pk: true },
    { name: "broker_id", type: "uuid", fk: "brokers.id" },
    { name: "area", type: "text" },
    { name: "rent", type: "int" },
    { name: "deposit", type: "int" },
    { name: "property_type", type: "enum" },
    { name: "amenities", type: "text[]" },
    { name: "status", type: "property_status" },
  ] },
  { name: "matches", icon: "M", fields: [
    { name: "id", type: "uuid", pk: true },
    { name: "requirement_id", type: "uuid", fk: "requirements.id" },
    { name: "property_id", type: "uuid", fk: "properties.id" },
    { name: "score", type: "int (0-100)" },
    { name: "breakdown", type: "jsonb { loc, bud, prop, amen }" },
    { name: "status", type: "match_status" },
    { name: "admin_decision_at", type: "timestamptz" },
    { name: "user_decision_at", type: "timestamptz" },
  ] },
  { name: "complaints", icon: "!", fields: [
    { name: "id", type: "uuid", pk: true },
    { name: "reporter_id", type: "uuid", fk: "users.id" },
    { name: "against_id", type: "uuid", fk: "users.id" },
    { name: "reason", type: "text" },
    { name: "status", type: "enum: open | resolved" },
  ] },
  { name: "audit_log", icon: "L", fields: [
    { name: "id", type: "uuid", pk: true },
    { name: "actor_id", type: "uuid", fk: "users.id" },
    { name: "actor_role", type: "enum" },
    { name: "action", type: "text" },
    { name: "target_type", type: "text" },
    { name: "target_id", type: "uuid" },
    { name: "at", type: "timestamptz" },
  ] },
];

const permissions = [
  { role: "Renter", can: ["Register", "Login", "Create / edit / delete requirement", "Approve / reject contact", "View matches", "Report broker"],
    cannot: ["See broker private data until match approved on both sides"] },
  { role: "Broker", can: ["Register", "Upload KYC", "Add / edit property", "View matching leads", "Request contact"],
    cannot: ["See renter phone or email until match approved on both sides"] },
  { role: "Admin", can: ["Verify broker", "Verify property", "Approve / reject match", "Suspend broker / user", "Resolve complaints", "View audit log"],
    cannot: ["—"] },
];

export default function SchemaPage() {
  return (
    <AppShell nav={adminNav} title="System architecture" subtitle="Data model, roles, status machines, scoring weights." accentLabel="Engineering" theme="dark" showLogout>
      <Helmet><title>Architecture — Admin</title></Helmet>
      {/* Matching engine */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="font-display font-semibold text-lg">Matching engine</div>
            <div className="text-xs text-primary-foreground/60">Deterministic, explainable scoring · no black-box AI.</div>
          </div>
          <span className="text-[11px] px-2 py-1 rounded-full bg-accent/15 text-accent">Total = 100</span>
        </div>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(WEIGHTS).map(([k, v]) => (
            <div key={k} className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
              <div className="text-[10px] uppercase tracking-wider text-primary-foreground/50">{k}</div>
              <div className="mt-2 font-display font-bold text-3xl text-accent">{v}</div>
              <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-accent" style={{ width: `${v}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Double consent */}
      <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-6">
        <div className="font-display font-semibold text-lg">Double-consent contact flow</div>
        <div className="mt-4 flex items-center gap-2 flex-wrap text-sm">
          {["Match created", "Admin reviews", "User approves", "Broker notified", "Contact shared"].map((s, i, arr) => (
            <div key={s} className="flex items-center gap-2">
              <div className="rounded-xl px-3 py-2 bg-white/[0.04] border border-white/10">{s}</div>
              {i < arr.length - 1 && <ArrowRight className="size-3 text-primary-foreground/40" />}
            </div>
          ))}
        </div>
      </div>

      {/* Roles */}
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {permissions.map((p) => (
          <div key={p.role} className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="font-display font-semibold text-lg">{p.role}</div>
            <div className="mt-4 text-[10px] uppercase tracking-wider text-success/80 font-medium">Can</div>
            <ul className="mt-2 space-y-1.5 text-sm text-primary-foreground/80">
              {p.can.map((c) => <li key={c}>· {c}</li>)}
            </ul>
            <div className="mt-4 text-[10px] uppercase tracking-wider text-destructive/80 font-medium">Cannot</div>
            <ul className="mt-2 space-y-1.5 text-sm text-primary-foreground/80">
              {p.cannot.map((c) => <li key={c}>· {c}</li>)}
            </ul>
          </div>
        ))}
      </div>

      {/* Status machines */}
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {[
          { l: "Requirement status", v: REQUIREMENT_STATUSES },
          { l: "Property status", v: PROPERTY_STATUSES },
          { l: "Match status", v: MATCH_STATUSES },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="font-display font-semibold text-lg">{s.l}</div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {s.v.map((x, i) => (
                <span key={x} className={`text-[11px] px-2.5 py-1 rounded-full border ${
                  i === 0 ? "bg-white/10 border-white/15 text-primary-foreground/70" :
                  i === s.v.length - 1 ? "bg-success/15 border-success/25 text-success" :
                  "bg-accent/10 border-accent/20 text-accent"
                }`}>{x}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Data model */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="size-4 text-accent" />
          <div className="font-display font-semibold text-lg">Data model</div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tables.map((t) => (
            <div key={t.name} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
              <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2 bg-white/[0.02]">
                <div className="size-7 rounded-md bg-accent/15 text-accent grid place-items-center text-xs font-bold">{t.icon}</div>
                <div className="font-mono text-sm font-semibold">{t.name}</div>
              </div>
              <ul className="divide-y divide-white/5">
                {t.fields.map((f) => (
                  <li key={f.name} className="px-5 py-2.5 flex items-center gap-2 text-xs">
                    {f.pk && <Key className="size-3 text-amber-400 shrink-0" />}
                    <span className="font-mono font-medium flex-1 truncate">{f.name}</span>
                    <span className="font-mono text-primary-foreground/50 truncate text-right">{f.type}</span>
                    {f.fk && <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/15 text-accent shrink-0">→ {f.fk}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
