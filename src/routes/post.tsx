import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/site/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Wallet, BedDouble, Calendar, Sparkles, ShieldCheck, Lock, Wifi, Car, Dumbbell, Trees, Refrigerator, WashingMachine, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import api from "@/lib/api";

type State = {
  city: string;
  area: string;
  type: string;
  budgetMin: number;
  budgetMax: number;
  moveIn: string;
  tenant: string;
  amenities: string[];
};

const cities = ["Mumbai", "Bengaluru", "Pune", "Delhi NCR", "Hyderabad"];
const types = ["Studio", "1 BHK", "2 BHK", "3 BHK", "PG / Co-living"];
const tenantTypes = ["Bachelor", "Family", "Student", "Working professional"];
const amenityOptions = [
  { id: "wifi", label: "Wi-Fi", icon: Wifi },
  { id: "parking", label: "Parking", icon: Car },
  { id: "gym", label: "Gym", icon: Dumbbell },
  { id: "garden", label: "Garden", icon: Trees },
  { id: "fridge", label: "Fridge", icon: Refrigerator },
  { id: "laundry", label: "Laundry", icon: WashingMachine },
];

const steps = [
  { key: "location", title: "Where do you want to live?", sub: "Pick a city and the area you prefer." },
  { key: "type", title: "What kind of home?", sub: "Choose the property type that fits your life." },
  { key: "budget", title: "What's your budget?", sub: "We'll match against properties in this range." },
  { key: "movein", title: "When do you want to move in?", sub: "Brokers prioritize requirements with a clear move-in." },
  { key: "amenities", title: "Pick a few must-haves.", sub: "We use these to score the matches." },
  { key: "review", title: "Review your requirement.", sub: "You can edit anything before posting." },
];

export default function PostRequirementPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<State>({
    city: "Mumbai", area: "", type: "1 BHK",
    budgetMin: 15000, budgetMax: 25000,
    moveIn: "", tenant: "Working professional",
    amenities: ["wifi", "parking"],
  });

  const progress = ((step + 1) / steps.length) * 100;
  const canNext = useMemo(() => {
    if (step === 0) return data.city && data.area.trim().length > 1;
    if (step === 3) return !!data.moveIn;
    return true;
  }, [step, data]);

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const { data: created } = await api.post("/requirements", {
        area: data.area,
        city: data.city,
        property_type: data.type,
        budget_min: data.budgetMin,
        budget_max: data.budgetMax,
        move_in: data.moveIn || undefined,
        tenant_type: data.tenant,
        amenities: data.amenities,
      });
      navigate(`/requirements/${created.id}`, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create requirement. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Post your requirement — RentSaathi</title></Helmet>
      <Navbar />
      <main className="container-rs py-10 md:py-14 max-w-3xl">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to dashboard
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Step {step + 1} of {steps.length}</div>
          <div className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
            <motion.div className="h-full bg-accent" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="mt-8">
            <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight text-balance">{steps[step].title}</h1>
            <p className="mt-2 text-muted-foreground">{steps[step].sub}</p>

            <div className="mt-8 rounded-3xl border border-border bg-surface p-6 md:p-8 shadow-card-rs">
              {step === 0 && (
                <div className="space-y-6">
                  <Field label="City" icon={<MapPin className="size-3.5" />}>
                    <div className="flex flex-wrap gap-2">
                      {cities.map((c) => (
                        <Chip key={c} active={data.city === c} onClick={() => setData({ ...data, city: c })}>{c}</Chip>
                      ))}
                    </div>
                  </Field>
                  <Field label="Preferred area or locality" icon={<MapPin className="size-3.5" />}>
                    <input value={data.area} onChange={(e) => setData({ ...data, area: e.target.value })} maxLength={100}
                      placeholder="e.g. Nerul Sector 10, near station"
                      className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-accent transition" />
                  </Field>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <Field label="Property type" icon={<BedDouble className="size-3.5" />}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {types.map((t) => (
                        <button key={t} onClick={() => setData({ ...data, type: t })}
                          className={`h-14 rounded-xl border text-sm font-medium transition-all ${data.type === t ? "bg-primary text-primary-foreground border-primary shadow-elegant" : "bg-surface border-border hover:border-accent/40"}`}>{t}</button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Tenant profile">
                    <div className="flex flex-wrap gap-2">
                      {tenantTypes.map((t) => (
                        <Chip key={t} active={data.tenant === t} onClick={() => setData({ ...data, tenant: t })}>{t}</Chip>
                      ))}
                    </div>
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-secondary/50 p-5">
                    <div className="text-xs text-muted-foreground">Monthly budget</div>
                    <div className="mt-1 font-display font-bold text-3xl tracking-tight">₹{data.budgetMin.toLocaleString("en-IN")} – ₹{data.budgetMax.toLocaleString("en-IN")}</div>
                  </div>
                  <Field label="Minimum" icon={<Wallet className="size-3.5" />}>
                    <input type="range" min={5000} max={100000} step={1000} value={data.budgetMin}
                      onChange={(e) => setData({ ...data, budgetMin: Math.min(Number(e.target.value), data.budgetMax - 1000) })}
                      className="w-full accent-accent" aria-label={`Minimum budget: ₹${data.budgetMin.toLocaleString("en-IN")}`} />
                  </Field>
                  <Field label="Maximum" icon={<Wallet className="size-3.5" />}>
                    <input type="range" min={5000} max={150000} step={1000} value={data.budgetMax}
                      onChange={(e) => setData({ ...data, budgetMax: Math.max(Number(e.target.value), data.budgetMin + 1000) })}
                      className="w-full accent-accent" aria-label={`Maximum budget: ₹${data.budgetMax.toLocaleString("en-IN")}`} />
                  </Field>
                </div>
              )}

              {step === 3 && (
                <Field label="Move-in date" icon={<Calendar className="size-3.5" />}>
                  <input type="date" value={data.moveIn}
                    onChange={(e) => setData({ ...data, moveIn: e.target.value })}
                    className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-accent transition" />
                  <div className="mt-3 text-xs text-muted-foreground">Flexible? Pick the earliest date you can move.</div>
                </Field>
              )}

              {step === 4 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {amenityOptions.map((a) => {
                    const active = data.amenities.includes(a.id);
                    return (
                      <button key={a.id}
                        onClick={() => setData({ ...data, amenities: active ? data.amenities.filter((x) => x !== a.id) : [...data.amenities, a.id] })}
                        className={`h-20 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-medium transition-all ${active ? "bg-accent/10 border-accent/40 text-accent" : "bg-surface border-border text-foreground/70 hover:border-accent/30"}`}>
                        <a.icon className="size-5" />{a.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {step === 5 && (
                <div>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <Review icon={<MapPin className="size-3.5" />} label="Location" value={`${data.area || "—"}, ${data.city}`} />
                    <Review icon={<BedDouble className="size-3.5" />} label="Property" value={`${data.type} · ${data.tenant}`} />
                    <Review icon={<Wallet className="size-3.5" />} label="Budget" value={`₹${data.budgetMin / 1000}k – ₹${data.budgetMax / 1000}k`} />
                    <Review icon={<Calendar className="size-3.5" />} label="Move-in" value={data.moveIn || "Flexible"} />
                  </div>
                  <div className="mt-4 rounded-xl bg-secondary/50 p-4">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Amenities</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {data.amenities.length === 0 && <span className="text-xs text-muted-foreground">None selected</span>}
                      {data.amenities.map((id) => {
                        const a = amenityOptions.find((x) => x.id === id)!;
                        return <span key={id} className="text-[11px] px-2 py-0.5 rounded-full bg-surface border border-border">{a.label}</span>;
                      })}
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><Lock className="size-3.5 text-accent" /> Your number stays hidden.</span>
                    <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-accent" /> Only verified brokers can match.</span>
                  </div>
                  {error && (
                    <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm p-3">{error}</div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="text-sm font-medium px-4 h-11 rounded-full border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5">
                <ArrowLeft className="size-4" /> Back
              </button>
              {step < steps.length - 1 ? (
                <button disabled={!canNext} onClick={() => setStep((s) => s + 1)}
                  className="text-sm font-medium px-5 h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 shadow-elegant disabled:opacity-50 disabled:cursor-not-allowed">
                  Continue <ArrowRight className="size-4" />
                </button>
              ) : (
                <button onClick={submit} disabled={submitting}
                  className="text-sm font-medium px-5 h-11 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 inline-flex items-center gap-1.5 shadow-elegant disabled:opacity-60">
                  {submitting ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  {submitting ? "Posting..." : "Post requirement"}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return <div><div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium inline-flex items-center gap-1.5 mb-2">{icon}{label}</div>{children}</div>;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`text-sm px-3.5 py-2 rounded-full border transition-all ${active ? "bg-primary text-primary-foreground border-primary shadow-elegant" : "bg-surface border-border text-foreground/70 hover:border-accent/40 hover:text-foreground"}`}>{children}</button>;
}

function Review({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-xl border border-border bg-surface p-4"><div className="text-[11px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">{icon}{label}</div><div className="mt-1 font-display font-semibold">{value}</div></div>;
}
