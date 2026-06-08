import { ShieldCheck, Lock, BadgeCheck, UserCheck, BellOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const map: Record<string, { icon: LucideIcon; label: string }> = {
  verified: { icon: BadgeCheck, label: "Verified broker" },
  kyc: { icon: ShieldCheck, label: "KYC checked" },
  privacy: { icon: Lock, label: "Contact protected" },
  human: { icon: UserCheck, label: "Human verified" },
  nospam: { icon: BellOff, label: "No spam calls" },
};

export function TrustBadge({ kind, label }: { kind: keyof typeof map; label?: string }) {
  const item = map[kind];
  const Icon = item.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/15">
      <Icon className="size-3" /> {label ?? item.label}
    </span>
  );
}
