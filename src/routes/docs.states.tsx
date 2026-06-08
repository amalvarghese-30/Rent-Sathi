import { Helmet } from "react-helmet-async";
import { DocsShell, Section, Card, StateRow } from "@/components/docs/DocsShell";

const SCREENS = [
  { name: "Dashboard / Requirements", rows: [
    { state: "Loading" as const, copy: "Skeleton cards while requirements load", tone: "neutral" as const },
    { state: "Empty" as const, copy: "No requirements yet — onboarding CTA to /post", tone: "warn" as const },
    { state: "Error" as const, copy: "Couldn't load your requirements. Retry button.", tone: "danger" as const },
    { state: "Success" as const, copy: "Cards rendered with live status pills", tone: "ok" as const },
  ]},
  { name: "Matches list", rows: [
    { state: "Loading" as const, copy: "Match ring placeholders animate in", tone: "neutral" as const },
    { state: "Empty" as const, copy: "No matches yet. We're actively notifying brokers.", tone: "warn" as const },
    { state: "Error" as const, copy: "Unable to fetch matches. Status: 503", tone: "danger" as const },
    { state: "Success" as const, copy: "Sorted by score; new matches pulse for 24h", tone: "ok" as const },
  ]},
  { name: "Match detail · approval", rows: [
    { state: "Loading" as const, copy: "Skeleton for broker card + breakdown", tone: "neutral" as const },
    { state: "Empty" as const, copy: "Match was withdrawn by the broker.", tone: "warn" as const },
    { state: "Error" as const, copy: "Couldn't approve contact. Try again.", tone: "danger" as const },
    { state: "Success" as const, copy: "Contact shared securely · timer visible", tone: "ok" as const },
  ]},
  { name: "Broker dashboard", rows: [
    { state: "Loading" as const, copy: "Lead skeletons, stats shimmer", tone: "neutral" as const },
    { state: "Empty" as const, copy: "No leads yet. List a property to start matching.", tone: "warn" as const },
    { state: "Error" as const, copy: "Leads unavailable. Engineering notified.", tone: "danger" as const },
    { state: "Success" as const, copy: "High-intent leads ranked by score", tone: "ok" as const },
  ]},
  { name: "Admin queues", rows: [
    { state: "Loading" as const, copy: "Queue counts pulse", tone: "neutral" as const },
    { state: "Empty" as const, copy: "Inbox zero — no pending reviews", tone: "warn" as const },
    { state: "Error" as const, copy: "Queue stale > 5 min. Reconnecting.", tone: "danger" as const },
    { state: "Success" as const, copy: "Verifications progressing", tone: "ok" as const },
  ]},
  { name: "File uploads", rows: [
    { state: "Loading" as const, copy: "Per-file progress bar", tone: "neutral" as const },
    { state: "Empty" as const, copy: "Drop files here or browse", tone: "warn" as const },
    { state: "Error" as const, copy: "File too large / wrong format", tone: "danger" as const },
    { state: "Success" as const, copy: "Uploaded · awaiting review", tone: "ok" as const },
  ]},
  { name: "Notifications inbox", rows: [
    { state: "Loading" as const, copy: "Row skeletons", tone: "neutral" as const },
    { state: "Empty" as const, copy: "You're all caught up.", tone: "warn" as const },
    { state: "Error" as const, copy: "Can't load notifications", tone: "danger" as const },
    { state: "Success" as const, copy: "Unread bold, read muted", tone: "ok" as const },
  ]},
];

export default function StatesDocs() {
  return (
    <DocsShell title="System States Audit" eyebrow="Quality" description="Every screen must answer four questions: what does it look like loading, empty, in error, and on success?">
      <Helmet><title>System States — RentSaathi</title></Helmet>
      {SCREENS.map((s) => (
        <Section key={s.name} title={s.name}>
          <Card className="py-2">
            {s.rows.map((r) => <StateRow key={r.state} {...r} />)}
          </Card>
        </Section>
      ))}
    </DocsShell>
  );
}
