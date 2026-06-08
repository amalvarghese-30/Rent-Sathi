import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { AppShell, type NavItem } from "@/components/app/AppShell";
import { LayoutGrid, FileText, Sparkles, Bell, ShieldCheck, BadgeCheck, Phone, Home, Inbox, Loader2, AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/brand/EmptyState";
import api from "@/lib/api";

interface Notification {
  id: string;
  title: string;
  body: string;
  category: string;
  read: boolean;
  created_at: string;
}

const nav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/requirements/new", label: "Post Requirement", icon: FileText },
  { to: "/matches", label: "Matches", icon: Sparkles },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

const categoryIcon: Record<string, typeof Sparkles> = {
  match: Sparkles,
  verification: ShieldCheck,
  contact: Phone,
  property: Home,
  system: BadgeCheck,
};
const categoryTint: Record<string, string> = {
  match: "bg-accent/15 text-accent",
  verification: "bg-success/15 text-success",
  contact: "bg-primary/10 text-primary",
  property: "bg-accent/15 text-accent",
  system: "bg-secondary text-foreground",
};

const filters = ["All", "match", "verification", "contact", "property"] as const;

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [active, setActive] = useState<(typeof filters)[number]>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = () => {
    api.get("/notifications")
      .then(({ data }) => { setItems(data); setLoading(false); })
      .catch((err) => { setError(err.response?.data?.detail || "Failed to load notifications"); setLoading(false); });
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAll = async () => {
    try {
      await api.post("/notifications/mark-all-read");
      setItems(items.map((i) => ({ ...i, read: true })));
    } catch {}
  };

  const markOne = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setItems(items.map((i) => (i.id === id ? { ...i, read: true } : i)));
    } catch {}
  };

  const visible = active === "All" ? items : items.filter((n) => n.category === active);
  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <AppShell nav={nav} title="Notifications" subtitle={`${unreadCount} unread`} accentLabel="Inbox" showLogout>
      <Helmet><title>Notifications — RentSaathi</title></Helmet>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-6 flex items-center gap-3 text-destructive">
          <AlertTriangle className="size-5" />
          <div className="text-sm">{error}</div>
          <button onClick={fetchNotifications} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button key={f} onClick={() => setActive(f)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${active === f ? "bg-primary text-primary-foreground border-primary" : "bg-surface border-border text-muted-foreground hover:text-foreground"}`}>{f === "All" ? "All" : f}</button>
              ))}
            </div>
            <button onClick={markAll} className="text-xs text-muted-foreground hover:text-foreground">Mark all as read</button>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-surface overflow-hidden">
            {visible.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={Inbox} title="No notifications yet" description="As soon as matches or verifications happen, you'll see them here." />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {visible.map((n) => {
                  const Icon = categoryIcon[n.category] || Bell;
                  const tint = categoryTint[n.category] || "bg-secondary text-foreground";
                  const time = n.created_at ? new Date(n.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
                  return (
                    <li key={n.id} className={`flex items-start gap-4 p-5 cursor-pointer ${!n.read ? "bg-accent/[0.03]" : ""}`} onClick={() => !n.read && markOne(n.id)}>
                      <div className={`size-10 rounded-xl grid place-items-center ${tint}`}><Icon className="size-5" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold truncate">{n.title || n.category}</div>
                          {!n.read && <span className="size-1.5 rounded-full bg-accent" />}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>
                      </div>
                      <div className="text-[11px] text-muted-foreground whitespace-nowrap">{time}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
