import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { adminNav } from "@/components/app/adminNav";
import { MatchRing } from "@/components/brand/MatchRing";
import { CheckCircle2, XCircle, MapPin, Wallet, BedDouble, Filter, ArrowUpRight, Loader2, AlertTriangle, User, Phone, Mail, IndianRupee, Calendar, Users, Star, Building2, ShieldCheck } from "lucide-react";
import type { MatchStatus } from "@/lib/matching";
import api from "@/lib/api";

interface MatchRow {
  id: string;
  requirement_id: string;
  property_id: string;
  score_breakdown: { location: number; budget: number; property: number; amenities: number };
  status: string;
  admin_approved: boolean;
  user_approved: boolean;
  created_at: string;
  requirement_area: string;
  property_title: string;
  renter?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
  requirement?: {
    area: string;
    city: string;
    property_type: string;
    budget_min: number;
    budget_max: number;
    tenant_type: string;
    amenities: string[];
    status: string;
    move_in_date: string | null;
  };
  broker?: {
    id: string;
    full_name: string;
    agency_name: string;
    trust_score: number;
  };
}

const filters = ["Pending Admin", "Pending User", "Approved", "Rejected"] as const;

export default function MatchQueue() {
  const [rows, setRows] = useState<MatchRow[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]>("Pending Admin");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchMatches = () => {
    setLoading(true);
    api.get("/admin/matches/pending")
      .then(({ data }) => { setRows(data); setLoading(false); })
      .catch((err) => { setError(err.response?.data?.detail || "Failed to load matches"); setLoading(false); });
  };

  useEffect(() => { fetchMatches(); }, []);

  const visible = rows.filter((r) => {
    if (filter === "Pending Admin") return !r.admin_approved && r.status === "Pending Admin";
    if (filter === "Pending User") return r.admin_approved && !r.user_approved && (r.status === "Pending User" || r.status === "Pending Admin");
    if (filter === "Approved") return r.status === "Approved" || r.status === "Connected";
    if (filter === "Rejected") return r.status === "Rejected";
    return true;
  });

  const decide = async (id: string, decision: "approve" | "reject") => {
    setActing(id);
    try {
      await api.post(`/admin/matches/${id}/${decision}`);
      setRows(rows.filter((r) => r.id !== id));
      await fetchMatches();
    } catch (err: any) {
      alert(err.response?.data?.detail || `Failed to ${decision} match`);
    } finally {
      setActing(null);
    }
  };

  const getScore = (breakdown: MatchRow["score_breakdown"]) => {
    if (!breakdown) return 0;
    return (breakdown.location || 0) + (breakdown.budget || 0) + (breakdown.property || 0) + (breakdown.amenities || 0);
  };

  const formatBudget = (min: number, max: number) => {
    const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(0)}k` : `₹${n}`;
    return `${fmt(min)} – ${fmt(max)}`;
  };

  return (
    <AppShell nav={adminNav} title="Match queue" subtitle="Admin step in the double-consent flow." accentLabel="Trust" theme="dark" showLogout>
      <Helmet><title>Match Queue — Admin</title></Helmet>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-6 flex items-center gap-3 text-destructive">
          <AlertTriangle className="size-5 shrink-0" />
          <div>
            <div className="text-sm font-medium">Failed to load matches</div>
            <div className="text-xs opacity-80 mt-0.5">{error}</div>
          </div>
          <button onClick={fetchMatches} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    filter === f ? "bg-accent text-accent-foreground border-accent" : "bg-white/5 border-white/10 text-primary-foreground/70 hover:text-primary-foreground"
                  }`}>{f} <span className="opacity-60">· {rows.filter((r) => {
                    if (f === "Pending Admin") return !r.admin_approved && r.status === "Pending Admin";
                    if (f === "Pending User") return r.admin_approved && !r.user_approved && (r.status === "Pending User" || r.status === "Pending Admin");
                    if (f === "Approved") return r.status === "Approved" || r.status === "Connected";
                    if (f === "Rejected") return r.status === "Rejected";
                    return false;
                  }).length}</span></button>
              ))}
            </div>
            <span className="text-[11px] text-primary-foreground/50 inline-flex items-center gap-1"><Filter className="size-3" /> SLA: review within 6 hours</span>
          </div>

          <div className="mt-6 space-y-4">
            {visible.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-primary-foreground/60">
                Queue is clear. Nicely done.
              </div>
            )}
            {visible.map((r) => {
              const bd = r.score_breakdown || { location: 0, budget: 0, property: 0, amenities: 0 };
              const score = getScore(r.score_breakdown);
              const isExpanded = expanded === r.id;
              return (
                <div key={r.id} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                  {/* Top bar — score + summary + actions */}
                  <div className="p-5 grid gap-4 md:grid-cols-[80px_1fr_1fr_auto] items-center">
                    <div className="bg-white/[0.04] rounded-2xl p-1 border border-white/10 w-fit">
                      <MatchRing value={score} size={72} />
                    </div>

                    {/* Renter summary */}
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] uppercase tracking-wider text-primary-foreground/50">Renter</div>
                        {r.renter && (
                          <span className="text-xs text-primary-foreground/80 font-medium">{r.renter.full_name}</span>
                        )}
                      </div>
                      <div className="text-xs text-primary-foreground/60 inline-flex items-center gap-1 mt-1">
                        <MapPin className="size-3" /> {r.requirement?.area}, {r.requirement?.city}
                        <span className="mx-1 opacity-30">|</span>
                        <BedDouble className="size-3" /> {r.requirement?.property_type}
                        <span className="mx-1 opacity-30">|</span>
                        <IndianRupee className="size-3" /> {r.requirement ? formatBudget(r.requirement.budget_min, r.requirement.budget_max) : "—"}
                      </div>
                      <div className="mt-3 grid grid-cols-4 gap-2 text-[10px]">
                        {[
                          { l: "Loc", v: bd.location, max: 40 }, { l: "Bud", v: bd.budget, max: 30 },
                          { l: "Type", v: bd.property, max: 20 }, { l: "Amn", v: bd.amenities, max: 10 },
                        ].map((b) => (
                          <div key={b.l} className="rounded-lg bg-white/5 p-2">
                            <div className="text-primary-foreground/50">{b.l}</div>
                            <div className="mt-0.5 font-semibold">{b.v}/{b.max}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Property summary */}
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] uppercase tracking-wider text-primary-foreground/50">Property</div>
                        {r.broker && (
                          <span className="text-xs text-primary-foreground/80 font-medium">{r.broker.full_name}</span>
                        )}
                      </div>
                      <div className="mt-0.5 font-medium">{r.property_title || `Property #${r.property_id?.slice(0, 8)}`}</div>
                      {r.broker && r.broker.agency_name && (
                        <div className="text-xs text-primary-foreground/50">{r.broker.agency_name}</div>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <Link to={`/admin/properties/${r.property_id}`} className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline">
                          Review property <ArrowUpRight className="size-3" />
                        </Link>
                        <button
                          onClick={() => setExpanded(isExpanded ? null : r.id)}
                          className="inline-flex items-center gap-1 text-[11px] text-primary-foreground/60 hover:text-primary-foreground"
                        >
                          {isExpanded ? "Hide details" : "View full details"}
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2 md:w-36">
                      <button onClick={() => decide(r.id, "approve")} disabled={acting === r.id}
                        className="flex-1 h-10 rounded-full bg-success/20 text-success hover:bg-success/30 text-sm font-medium inline-flex items-center justify-center gap-1.5 disabled:opacity-50">
                        {acting === r.id ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                        Approve
                      </button>
                      <button onClick={() => decide(r.id, "reject")} disabled={acting === r.id}
                        className="flex-1 h-10 rounded-full bg-destructive/15 text-destructive hover:bg-destructive/25 text-sm font-medium inline-flex items-center justify-center gap-1.5 disabled:opacity-50">
                        <XCircle className="size-4" /> Reject
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail panel */}
                  {isExpanded && (
                    <div className="border-t border-white/10 px-5 py-4 grid gap-5 md:grid-cols-2">
                      {/* Renter detail card */}
                      <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <User className="size-4 text-accent" />
                          <div className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">Renter Details</div>
                        </div>
                        {r.renter ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="size-3.5 text-primary-foreground/40" />
                              <span className="font-medium">{r.renter.full_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-primary-foreground/60">
                              <Mail className="size-3.5" />
                              <span>{r.renter.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-primary-foreground/60">
                              <Phone className="size-3.5" />
                              <span>{r.renter.phone}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-primary-foreground/40">Renter info unavailable</div>
                        )}

                        <div className="flex items-center gap-2 mt-5 mb-3">
                          <ShieldCheck className="size-4 text-accent" />
                          <div className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">Requirement</div>
                        </div>
                        {r.requirement ? (
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <div className="text-[10px] uppercase text-primary-foreground/40">Location</div>
                              <div className="flex items-center gap-1"><MapPin className="size-3 text-primary-foreground/50" /> {r.requirement.area}, {r.requirement.city}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase text-primary-foreground/40">Property Type</div>
                              <div className="flex items-center gap-1"><BedDouble className="size-3 text-primary-foreground/50" /> {r.requirement.property_type}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase text-primary-foreground/40">Budget</div>
                              <div className="flex items-center gap-1"><IndianRupee className="size-3 text-primary-foreground/50" /> {formatBudget(r.requirement.budget_min, r.requirement.budget_max)}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase text-primary-foreground/40">Tenant Type</div>
                              <div className="flex items-center gap-1"><Users className="size-3 text-primary-foreground/50" /> {r.requirement.tenant_type || "Any"}</div>
                            </div>
                            {r.requirement.move_in_date && (
                              <div>
                                <div className="text-[10px] uppercase text-primary-foreground/40">Move-in Date</div>
                                <div className="flex items-center gap-1"><Calendar className="size-3 text-primary-foreground/50" /> {r.requirement.move_in_date}</div>
                              </div>
                            )}
                            <div>
                              <div className="text-[10px] uppercase text-primary-foreground/40">Status</div>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                r.requirement.status === "Matched" ? "bg-success/15 text-success" :
                                r.requirement.status === "Active" ? "bg-accent/15 text-accent" :
                                "bg-white/10 text-primary-foreground/60"
                              }`}>{r.requirement.status}</span>
                            </div>
                            {r.requirement.amenities?.length > 0 && (
                              <div className="col-span-2">
                                <div className="text-[10px] uppercase text-primary-foreground/40 mb-1">Amenities</div>
                                <div className="flex flex-wrap gap-1.5">
                                  {r.requirement.amenities.map((a: string) => (
                                    <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-primary-foreground/60">{a.replace(/_/g, " ")}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-primary-foreground/40">Requirement info unavailable</div>
                        )}
                      </div>

                      {/* Broker & Property detail card */}
                      <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Building2 className="size-4 text-accent" />
                          <div className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">Broker & Property</div>
                        </div>
                        {r.broker ? (
                          <div className="space-y-2 text-sm mb-4">
                            <div className="flex items-center gap-2">
                              <User className="size-3.5 text-primary-foreground/40" />
                              <span className="font-medium">{r.broker.full_name}</span>
                            </div>
                            {r.broker.agency_name && (
                              <div className="flex items-center gap-2 text-primary-foreground/60">
                                <Building2 className="size-3.5" />
                                <span>{r.broker.agency_name}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Star className="size-3.5 text-amber-400" />
                              <span className="text-primary-foreground/60">Trust Score: <span className="text-amber-400 font-medium">{r.broker.trust_score}</span></span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-primary-foreground/40 mb-4">Broker info unavailable</div>
                        )}

                        <div className="flex items-center gap-2 mt-5 mb-3">
                          <ShieldCheck className="size-4 text-accent" />
                          <div className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">Property</div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="font-medium">{r.property_title}</div>
                          {r.requirement && (
                            <div className="flex items-center gap-1 text-primary-foreground/60">
                              <MapPin className="size-3" /> {r.requirement.area}, {r.requirement.city}
                            </div>
                          )}
                          <Link to={`/admin/properties/${r.property_id}`} className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-2">
                            Open full property review <ArrowUpRight className="size-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </AppShell>
  );
}
