import { MapPin, Wallet, User, Calendar, BedDouble } from "lucide-react";

export interface Requirement {
  bhk: string;
  area: string;
  budget: string;
  tenant: string;
  moveIn: string;
  status?: "Active" | "Matching" | "Paused";
}

export function RequirementCard({ r }: { r: Requirement }) {
  return (
    <div className="group rounded-2xl border border-border bg-surface p-5 hover:shadow-elegant transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-lg bg-accent/10 text-accent grid place-items-center"><BedDouble className="size-4" /></div>
          <div>
            <div className="font-display font-semibold text-base leading-tight">{r.bhk}</div>
            <div className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-0.5"><MapPin className="size-3" />{r.area}</div>
          </div>
        </div>
        {r.status && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">
            <span className="size-1 rounded-full bg-success animate-pulse" />{r.status}
          </span>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg bg-secondary/60 p-2">
          <div className="text-muted-foreground flex items-center gap-1"><Wallet className="size-3" />Budget</div>
          <div className="mt-1 font-semibold text-foreground">{r.budget}</div>
        </div>
        <div className="rounded-lg bg-secondary/60 p-2">
          <div className="text-muted-foreground flex items-center gap-1"><User className="size-3" />Tenant</div>
          <div className="mt-1 font-semibold text-foreground">{r.tenant}</div>
        </div>
        <div className="rounded-lg bg-secondary/60 p-2">
          <div className="text-muted-foreground flex items-center gap-1"><Calendar className="size-3" />Move-in</div>
          <div className="mt-1 font-semibold text-foreground">{r.moveIn}</div>
        </div>
      </div>
    </div>
  );
}
