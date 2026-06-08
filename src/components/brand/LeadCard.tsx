import { MapPin, Wallet, Flame, Clock } from "lucide-react";
import { MatchRing } from "./MatchRing";

export interface Lead {
  name: string;
  area: string;
  budget: string;
  score: number;
  intent: "High" | "Medium" | "Warm";
  posted: string;
  bhk: string;
}

const intentStyle: Record<Lead["intent"], string> = {
  High: "bg-accent/10 text-accent",
  Medium: "bg-amber-500/10 text-amber-600",
  Warm: "bg-secondary text-secondary-foreground",
};

export function LeadCard({ l }: { l: Lead }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 hover:shadow-elegant transition-all">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${intentStyle[l.intent]}`}>
            <Flame className="size-3" />{l.intent} intent
          </span>
          <div className="mt-2 font-display font-semibold text-base">{l.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{l.bhk} requirement</div>
        </div>
        <MatchRing value={l.score} size={64} />
      </div>
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1 text-muted-foreground"><MapPin className="size-3" />{l.area}</span>
        <span className="inline-flex items-center gap-1 font-semibold"><Wallet className="size-3" />{l.budget}</span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1"><Clock className="size-3" />{l.posted}</span>
        <button className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">Request match</button>
      </div>
    </div>
  );
}
