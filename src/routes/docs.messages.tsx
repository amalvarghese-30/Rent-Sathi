import { Helmet } from "react-helmet-async";
import { DocsShell, Section, Card } from "@/components/docs/DocsShell";
import { ShieldCheck, Send } from "lucide-react";

const CONVOS = [
  { name: "Priya S.", last: "Yes, the apartment is still available.", time: "2m", unread: 2, status: "shared" as const },
  { name: "Anand R.", last: "Can we schedule a visit on Saturday?", time: "1h", unread: 0, status: "shared" as const },
  { name: "Megha T.", last: "Pending approval — contact masked", time: "Yesterday", unread: 0, status: "masked" as const },
];

export default function MsgDocs() {
  return (
    <DocsShell title="Messages (design only)" eyebrow="Post-MVP" description="Chat is not built yet. This page locks the design contract so engineering can implement it later without re-discovery.">
      <Helmet><title>Messages Design — RentSaathi</title></Helmet>
      <Section title="Conversation list">
        <Card className="p-0 overflow-hidden">
          {CONVOS.map((c, i) => (
            <div key={c.name} className={`flex items-center gap-3 px-5 py-4 ${i ? "border-t border-border" : ""}`}>
              <div className="size-10 rounded-full bg-secondary grid place-items-center font-semibold text-sm">{c.name[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">{c.name}</span>
                  {c.status === "masked" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">masked</span>}
                  {c.status === "shared" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success inline-flex items-center gap-1"><ShieldCheck className="size-3" />verified</span>}
                </div>
                <div className="text-xs text-muted-foreground truncate">{c.last}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground">{c.time}</div>
                {c.unread > 0 && <div className="mt-1 size-5 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold grid place-items-center ml-auto">{c.unread}</div>}
              </div>
            </div>
          ))}
        </Card>
      </Section>

      <Section title="Conversation detail">
        <Card>
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-full bg-secondary grid place-items-center font-semibold text-sm">P</div>
              <div>
                <div className="text-sm font-medium">Priya S.</div>
                <div className="text-[11px] text-success inline-flex items-center gap-1"><ShieldCheck className="size-3" />Contact shared · expires in 12 days</div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-1 rounded bg-secondary text-muted-foreground">Match #M-204</span>
          </div>
          <div className="space-y-3 py-5">
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-secondary px-4 py-2.5 text-sm">Hi Priya, the 1BHK in Nerul is available. Visits this weekend?</div>
            <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm ml-auto">Saturday afternoon works for me. 3pm?</div>
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-secondary px-4 py-2.5 text-sm">Perfect — I'll share the exact address.</div>
          </div>
          <div className="border-t border-border pt-4 flex items-center gap-2">
            <input disabled placeholder="Design preview — chat not yet implemented" className="flex-1 h-10 px-3 rounded-xl border border-border bg-background text-sm" />
            <button disabled className="size-10 rounded-xl bg-primary text-primary-foreground grid place-items-center opacity-50">
              <Send className="size-4" />
            </button>
          </div>
        </Card>
      </Section>

      <Section title="Shared contact state machine">
        <Card>
          <pre className="text-xs font-mono text-muted-foreground leading-relaxed">{`masked  ──user approves──▶  shared  ──14 days──▶  expired
   │                          │
   └──user declines──▶ closed └──user revokes──▶ revoked`}</pre>
        </Card>
      </Section>
    </DocsShell>
  );
}
