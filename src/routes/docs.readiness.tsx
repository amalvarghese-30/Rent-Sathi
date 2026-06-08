import { Helmet } from "react-helmet-async";
import { DocsShell, Section, Card } from "@/components/docs/DocsShell";
import { CheckCircle2, Circle, Clock } from "lucide-react";

type Status = "done" | "wip" | "todo";
const SECTIONS: Array<{ name: string; items: Array<{ label: string; owner: string; status: Status }> }> = [
  { name: "Authentication", items: [
    { label: "Renter sign up / sign in / reset", owner: "Frontend", status: "done" },
    { label: "Broker register + KYC flow", owner: "Frontend", status: "done" },
    { label: "Admin 2FA (TOTP)", owner: "Backend", status: "wip" },
    { label: "Session refresh + rotation", owner: "Backend", status: "todo" },
  ]},
  { name: "Authorization", items: [
    { label: "Role-based middleware", owner: "Backend", status: "todo" },
    { label: "Row-level security policies", owner: "Backend", status: "todo" },
    { label: "Permissions matrix locked", owner: "Product", status: "done" },
  ]},
  { name: "Verification", items: [
    { label: "Broker KYC review queue", owner: "Admin", status: "done" },
    { label: "Property verification flow", owner: "Admin", status: "done" },
    { label: "Reject / approve with reasons", owner: "Admin", status: "wip" },
  ]},
  { name: "Matching", items: [
    { label: "Score weights documented", owner: "Product", status: "done" },
    { label: "Match generation worker", owner: "Backend", status: "todo" },
    { label: "Double-consent contact share", owner: "Backend", status: "wip" },
  ]},
  { name: "Notifications", items: [
    { label: "Event catalog defined", owner: "Product", status: "done" },
    { label: "Email + SMS providers wired", owner: "Backend", status: "todo" },
    { label: "User preferences UI", owner: "Frontend", status: "todo" },
  ]},
  { name: "Complaints + Audit", items: [
    { label: "Complaint intake + screen", owner: "Admin", status: "done" },
    { label: "Append-only audit log", owner: "Backend", status: "wip" },
  ]},
  { name: "Mobile", items: [
    { label: "Per-route responsive audit", owner: "Frontend", status: "done" },
    { label: "Bottom nav on app routes", owner: "Frontend", status: "done" },
    { label: "Admin tables compact view", owner: "Frontend", status: "todo" },
  ]},
  { name: "Security", items: [
    { label: "Secrets management", owner: "Backend", status: "todo" },
    { label: "Rate limiting on /auth/*", owner: "Backend", status: "todo" },
    { label: "External pen-test", owner: "Founders", status: "todo" },
  ]},
  { name: "Deployment", items: [
    { label: "Staging mirrors prod", owner: "Backend", status: "todo" },
    { label: "Daily DB backups + restore drill", owner: "Backend", status: "todo" },
    { label: "Status page", owner: "Founders", status: "todo" },
  ]},
];

function statusEl(s: Status) {
  if (s === "done") return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success"><CheckCircle2 className="size-3.5" /> Done</span>;
  if (s === "wip") return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent"><Clock className="size-3.5" /> In progress</span>;
  return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground"><Circle className="size-3.5" /> Todo</span>;
}

export default function ReadinessDocs() {
  const total = SECTIONS.flatMap((s) => s.items).length;
  const done = SECTIONS.flatMap((s) => s.items).filter((i) => i.status === "done").length;
  const wip = SECTIONS.flatMap((s) => s.items).filter((i) => i.status === "wip").length;
  const pct = Math.round((done / total) * 100);

  return (
    <DocsShell title="Production Readiness" eyebrow="Launch checklist" description="Single source of truth for what's done, in progress, and pending before RentSaathi goes live.">
      <Helmet><title>Production Readiness — RentSaathi</title></Helmet>
      <div className="grid md:grid-cols-4 gap-3 mb-10">
        <Card><div className="text-xs text-muted-foreground">Overall</div><div className="font-display font-bold text-3xl mt-1">{pct}%</div></Card>
        <Card><div className="text-xs text-muted-foreground">Done</div><div className="font-display font-bold text-3xl mt-1 text-success">{done}</div></Card>
        <Card><div className="text-xs text-muted-foreground">In progress</div><div className="font-display font-bold text-3xl mt-1 text-accent">{wip}</div></Card>
        <Card><div className="text-xs text-muted-foreground">Total items</div><div className="font-display font-bold text-3xl mt-1">{total}</div></Card>
      </div>

      {SECTIONS.map((s) => (
        <Section key={s.name} title={s.name}>
          <Card>
            <div className="divide-y divide-border">
              {s.items.map((i) => (
                <div key={i.label} className="py-3 flex items-center gap-3">
                  <div className="flex-1 text-sm text-foreground">{i.label}</div>
                  <span className="text-[11px] text-muted-foreground w-24">{i.owner}</span>
                  {statusEl(i.status)}
                </div>
              ))}
            </div>
          </Card>
        </Section>
      ))}
    </DocsShell>
  );
}
