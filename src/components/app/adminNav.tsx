import { LayoutGrid, ShieldCheck, Building2, Sparkles, Flag, ScrollText, Database, Gauge } from "lucide-react";
import type { NavItem } from "./AppShell";

export const adminNav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutGrid },
  { to: "/admin/ops", label: "Founder Ops", icon: Gauge },
  { to: "/admin/matches", label: "Match Queue", icon: Sparkles },
  { to: "/admin/complaints", label: "Complaints", icon: Flag },
  { to: "/admin/audit", label: "Audit Log", icon: ScrollText },
  { to: "/admin/schema", label: "Architecture", icon: Database },
];
