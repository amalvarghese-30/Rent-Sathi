import { Helmet } from "react-helmet-async";
import { DocsShell, Section, Card, Code } from "@/components/docs/DocsShell";
import { Bell, Mail, Smartphone, Webhook } from "lucide-react";

const EVENTS = [
  { audience: "Renter", type: "match.found", channels: ["in-app", "email"], copy: "A new broker matched your requirement in Nerul." },
  { audience: "Renter", type: "broker.verified", channels: ["in-app"], copy: "The broker on Match #M-204 is now verified." },
  { audience: "Renter", type: "contact.approved", channels: ["in-app", "email", "sms"], copy: "Contact shared. The broker will reach out within 24h." },
  { audience: "Broker", type: "lead.new_match", channels: ["in-app", "email"], copy: "New high-intent lead in Nerul (94% match)." },
  { audience: "Broker", type: "property.approved", channels: ["in-app"], copy: "Your property listing has been verified." },
  { audience: "Broker", type: "contact.shared", channels: ["in-app", "sms"], copy: "Renter approved contact for Match #M-204." },
  { audience: "Admin", type: "broker.pending", channels: ["in-app"], copy: "New broker awaiting verification." },
  { audience: "Admin", type: "property.pending", channels: ["in-app"], copy: "Property submitted for review." },
  { audience: "Admin", type: "complaint.received", channels: ["in-app", "email"], copy: "A renter raised a complaint against a broker." },
];

export default function NotifDocs() {
  return (
    <DocsShell title="Notifications" eyebrow="Event architecture" description="Every user-facing change emits a typed event. Channels are resolved per user preference; admin events fan out via email + in-app.">
      <Helmet><title>Notification Architecture — RentSaathi</title></Helmet>
      <Section title="Channels">
        <div className="grid md:grid-cols-4 gap-3">
          {[
            { i: Bell, l: "In-app", d: "Real-time toast + inbox" },
            { i: Mail, l: "Email", d: "Transactional via provider" },
            { i: Smartphone, l: "SMS", d: "Critical only (contact share)" },
            { i: Webhook, l: "Webhook", d: "For partner integrations" },
          ].map((c) => (
            <Card key={c.l}>
              <c.i className="size-5 text-accent" />
              <div className="mt-3 font-semibold text-sm">{c.l}</div>
              <div className="text-xs text-muted-foreground mt-1">{c.d}</div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Event catalog">
        <Card>
          <div className="divide-y divide-border">
            {EVENTS.map((e) => (
              <div key={e.type} className="py-3 grid md:grid-cols-[80px_1fr_180px] gap-3 items-start">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">{e.audience}</span>
                <div className="min-w-0">
                  <code className="font-mono text-sm text-foreground">{e.type}</code>
                  <div className="text-xs text-muted-foreground mt-1">{e.copy}</div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {e.channels.map((c) => (
                    <span key={c} className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-foreground">{c}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section title="Payload shape">
        <Code>{`{
  "id": "ntf_01HX...",
  "user_id": "usr_...",
  "type": "match.found",
  "payload": {
    "match_id": "M-204",
    "area": "Nerul",
    "score": 94
  },
  "read_at": null,
  "created_at": "2026-06-07T08:14:22Z"
}`}</Code>
      </Section>

      <Section title="Delivery rules">
        <Card>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>• <span className="text-foreground">Debouncing</span> — collapse multiple `match.found` within 10 min into a single email.</li>
            <li>• <span className="text-foreground">Quiet hours</span> — no SMS between 22:00–08:00 IST unless event is `contact.shared`.</li>
            <li>• <span className="text-foreground">User prefs</span> — per-channel opt-out except critical (auth, contact-share).</li>
            <li>• <span className="text-foreground">Failures</span> — retries with exponential backoff; surfaced to admin if &gt; 3 failures.</li>
          </ul>
        </Card>
      </Section>
    </DocsShell>
  );
}
