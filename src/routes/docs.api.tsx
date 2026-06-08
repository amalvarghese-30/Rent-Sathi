import { Helmet } from "react-helmet-async";
import { DocsShell, Section, Card, Code } from "@/components/docs/DocsShell";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

const GROUPS: Array<{
  name: string;
  endpoints: Array<{ m: Method; path: string; auth: string; body?: string; res: string }>;
}> = [
  {
    name: "Authentication",
    endpoints: [
      { m: "POST", path: "/auth/register", auth: "public", body: `{ name, email, phone, password }`, res: `{ user_id, session }` },
      { m: "POST", path: "/auth/login", auth: "public", body: `{ email, password }`, res: `{ session }` },
      { m: "POST", path: "/auth/logout", auth: "user", res: `204` },
      { m: "POST", path: "/auth/forgot", auth: "public", body: `{ email }`, res: `204` },
      { m: "POST", path: "/auth/reset", auth: "token", body: `{ token, password }`, res: `{ ok: true }` },
    ],
  },
  {
    name: "Requirements",
    endpoints: [
      { m: "POST", path: "/requirements", auth: "user", body: `{ area, bhk, budget_min, budget_max, move_in, amenities[] }`, res: `{ id, status: "matching" }` },
      { m: "GET", path: "/requirements", auth: "user", res: `Requirement[]` },
      { m: "GET", path: "/requirements/:id", auth: "user", res: `{ requirement, timeline, matches[] }` },
      { m: "DELETE", path: "/requirements/:id", auth: "user", res: `204` },
    ],
  },
  {
    name: "Broker · Properties",
    endpoints: [
      { m: "POST", path: "/broker/properties", auth: "broker", body: `{ area, bhk, price, amenities[], photos[] }`, res: `{ id, status: "pending_review" }` },
      { m: "GET", path: "/broker/properties", auth: "broker", res: `Property[]` },
      { m: "GET", path: "/broker/leads", auth: "broker", res: `MaskedLead[]` },
    ],
  },
  {
    name: "Matching",
    endpoints: [
      { m: "GET", path: "/matches", auth: "user", res: `Match[]` },
      { m: "GET", path: "/matches/:id", auth: "user", res: `{ match, broker(masked), property }` },
      { m: "POST", path: "/matches/:id/approve", auth: "user", res: `{ contact_share_id }` },
      { m: "POST", path: "/matches/:id/decline", auth: "user", body: `{ reason? }`, res: `204` },
    ],
  },
  {
    name: "Admin",
    endpoints: [
      { m: "GET", path: "/admin/queue", auth: "admin", res: `{ brokers, properties, matches, complaints }` },
      { m: "POST", path: "/admin/brokers/:id/verify", auth: "admin", body: `{ decision: "approve"|"reject", note }`, res: `{ broker }` },
      { m: "POST", path: "/admin/properties/:id/verify", auth: "admin", body: `{ decision, note }`, res: `{ property }` },
      { m: "POST", path: "/admin/complaints/:id/resolve", auth: "admin", body: `{ action: "warn"|"suspend"|"dismiss" }`, res: `{ complaint }` },
      { m: "GET", path: "/admin/audit", auth: "admin", res: `AuditEvent[]` },
    ],
  },
  {
    name: "Notifications",
    endpoints: [
      { m: "GET", path: "/notifications", auth: "user", res: `Notification[]` },
      { m: "POST", path: "/notifications/:id/read", auth: "user", res: `204` },
    ],
  },
];

const methodTone: Record<Method, string> = {
  GET: "bg-accent/10 text-accent",
  POST: "bg-primary text-primary-foreground",
  PATCH: "bg-secondary text-foreground",
  DELETE: "bg-destructive/10 text-destructive",
};

export default function ApiDocs() {
  return (
    <DocsShell title="API Reference" eyebrow="Contract design" description="HTTP shape for every endpoint. Use this as the source of truth for backend implementation. All responses are JSON; errors use { code, message, details? }.">
      <Helmet><title>API Reference — RentSaathi</title></Helmet>
      {GROUPS.map((g) => (
        <Section key={g.name} title={g.name}>
          <Card>
            <div className="divide-y divide-border">
              {g.endpoints.map((e) => (
                <div key={e.path + e.m} className="py-4 grid md:grid-cols-[80px_1fr_120px] gap-3 items-start">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md w-fit ${methodTone[e.m]}`}>{e.m}</span>
                  <div className="space-y-2 min-w-0">
                    <code className="font-mono text-sm text-foreground break-all">{e.path}</code>
                    {e.body && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Body</div>
                        <Code>{e.body}</Code>
                      </div>
                    )}
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Response</div>
                      <Code>{e.res}</Code>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground self-start md:text-right">{e.auth}</span>
                </div>
              ))}
            </div>
          </Card>
        </Section>
      ))}

      <Section title="Error envelope">
        <Code>{`{
  "code": "REQUIREMENT_INVALID_BUDGET",
  "message": "Budget must be greater than ₹5,000",
  "details": { "field": "budget_min", "min": 5000 }
}`}</Code>
      </Section>
    </DocsShell>
  );
}
