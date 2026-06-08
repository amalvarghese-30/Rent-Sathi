import { Helmet } from "react-helmet-async";
import { DocsShell, Section, Card } from "@/components/docs/DocsShell";
import { Lock, Eye, EyeOff, KeyRound } from "lucide-react";

const PROTECTED = [
  { path: "/dashboard", roles: ["user"], notes: "Renter session required" },
  { path: "/post", roles: ["user"], notes: "Verified email required" },
  { path: "/matches/*", roles: ["user"], notes: "Match must belong to user" },
  { path: "/broker/*", roles: ["broker"], notes: "KYC-approved broker only" },
  { path: "/admin/*", roles: ["admin"], notes: "TOTP 2FA enforced" },
  { path: "/architecture", roles: ["public"], notes: "Public read-only reference" },
];

const SENSITIVE = [
  { field: "user.phone", visibility: "Self + admin", trigger: "Shared with broker only on user approval" },
  { field: "user.email", visibility: "Self + admin", trigger: "Never sent to brokers" },
  { field: "broker.kyc_documents", visibility: "Admin only", trigger: "Signed URLs, 15-min expiry" },
  { field: "match.broker_contact", visibility: "Masked until approved", trigger: "Shown 14 days after approval" },
  { field: "audit_logs", visibility: "Admin read-only", trigger: "Append-only, no UPDATE/DELETE" },
];

export default function SecurityDocs() {
  return (
    <DocsShell title="Security Architecture" eyebrow="Trust by design" description="Access control, protected routes, sensitive data handling and the controls that protect them.">
      <Helmet><title>Security Architecture — RentSaathi</title></Helmet>
      <Section title="Access control">
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { i: KeyRound, l: "Renter", d: "Email/password + optional OTP. Can manage own requirements and approvals." },
            { i: Lock, l: "Broker", d: "Same auth + KYC verification gate. Cannot list until approved." },
            { i: Eye, l: "Admin", d: "Email + TOTP 2FA. Every action stored in immutable audit log." },
          ].map((r) => (
            <Card key={r.l}>
              <r.i className="size-5 text-accent" />
              <div className="mt-3 font-semibold text-sm">{r.l}</div>
              <div className="text-xs text-muted-foreground mt-1">{r.d}</div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Protected routes">
        <Card>
          <div className="divide-y divide-border">
            {PROTECTED.map((p) => (
              <div key={p.path} className="py-3 grid md:grid-cols-[180px_180px_1fr] gap-3 items-start text-sm">
                <code className="font-mono text-foreground">{p.path}</code>
                <div className="flex gap-1 flex-wrap">
                  {p.roles.map((r) => <span key={r} className="text-[10px] px-2 py-0.5 rounded bg-secondary text-foreground">{r}</span>)}
                </div>
                <span className="text-xs text-muted-foreground">{p.notes}</span>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section title="Sensitive data">
        <Card>
          <div className="divide-y divide-border">
            {SENSITIVE.map((s) => (
              <div key={s.field} className="py-3 grid md:grid-cols-[220px_180px_1fr] gap-3 items-start text-sm">
                <code className="font-mono text-foreground inline-flex items-center gap-2"><EyeOff className="size-3.5 text-muted-foreground" />{s.field}</code>
                <span className="text-xs text-foreground">{s.visibility}</span>
                <span className="text-xs text-muted-foreground">{s.trigger}</span>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section title="Operational controls">
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { t: "Rate limiting", d: "10 req/s/user, 60/min on /auth/* with IP backoff." },
            { t: "Secrets", d: "All env vars stored encrypted; never committed; rotated quarterly." },
            { t: "Backups", d: "Daily Postgres snapshots, 30-day retention; restore tested monthly." },
            { t: "Pen testing", d: "External audit before public launch; quarterly reviews thereafter." },
          ].map((o) => (
            <Card key={o.t}>
              <div className="text-sm font-semibold">{o.t}</div>
              <div className="text-xs text-muted-foreground mt-1">{o.d}</div>
            </Card>
          ))}
        </div>
      </Section>
    </DocsShell>
  );
}
