import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { TrustBadge } from "@/components/brand/TrustBadge";
import { ArrowLeft, ArrowRight, Building2, MapPin, Wallet, X, ShieldCheck, Check, UploadCloud, Loader2 } from "lucide-react";
import api from "@/lib/api";

const types = ["Studio", "1 BHK", "2 BHK", "3 BHK", "PG"];
type Step = 0 | 1 | 2 | 3;

export default function AddPropertyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [type, setType] = useState("1 BHK");
  const [rent, setRent] = useState(20000);
  const [deposit, setDeposit] = useState(40000);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const next = () => setStep((s) => Math.min(3, s + 1) as Step);
  const prev = () => setStep((s) => Math.max(0, s - 1) as Step);
  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).slice(0, 6 - images.length).map((f) => URL.createObjectURL(f));
    setImages([...images, ...urls]);
  };

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await api.post("/properties", {
        title: name,
        area,
        city,
        property_type: type,
        rent,
        deposit,
        amenities: [],
      });
      navigate("/broker", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create property. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels = ["Details", "Pricing", "Photos", "Review"];

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Add property — RentSaathi</title></Helmet>
      <Navbar />
      <main className="container-rs py-10 md:py-14 max-w-3xl">
        <Link to="/broker" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to broker workspace
        </Link>

        <div className="mt-6 flex items-center gap-2">
          {stepLabels.map((l, i) => (
            <div key={l} className="flex items-center gap-2">
              <div className={`size-6 rounded-full grid place-items-center text-[11px] font-semibold ${i < step ? "bg-success/15 text-success" : i === step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {i < step ? <Check className="size-3.5" /> : i + 1}
              </div>
              <span className={`text-xs ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>{l}</span>
              {i < stepLabels.length - 1 && <div className="w-6 h-px bg-border" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="mt-8 rounded-3xl border border-border bg-surface p-6 md:p-8 shadow-card-rs">
            {step === 0 && (
              <div className="space-y-6">
                <h1 className="font-display font-bold text-2xl tracking-tight">Property details</h1>
                <Field label="Property name" icon={<Building2 className="size-3.5" />}>
                  <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="e.g. Skyline Heights, Tower B"
                    className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-accent" />
                </Field>
                <Field label="Area" icon={<MapPin className="size-3.5" />}>
                  <input value={area} onChange={(e) => setArea(e.target.value)} maxLength={150} placeholder="e.g. Nerul Sector 11"
                    className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-accent" />
                </Field>
                <Field label="City">
                  <div className="flex flex-wrap gap-2">
                    {["Mumbai", "Bengaluru", "Pune", "Delhi NCR", "Hyderabad"].map((c) => (
                      <button key={c} onClick={() => setCity(c)}
                        className={`text-sm px-3.5 py-2 rounded-full border transition-all ${city === c ? "bg-primary text-primary-foreground border-primary" : "bg-surface border-border hover:border-accent/40"}`}>{c}</button>
                    ))}
                  </div>
                </Field>
                <Field label="Type">
                  <div className="flex flex-wrap gap-2">
                    {types.map((t) => (
                      <button key={t} onClick={() => setType(t)}
                        className={`text-sm px-3.5 py-2 rounded-full border transition-all ${type === t ? "bg-primary text-primary-foreground border-primary" : "bg-surface border-border hover:border-accent/40"}`}>{t}</button>
                    ))}
                  </div>
                </Field>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <h1 className="font-display font-bold text-2xl tracking-tight">Pricing</h1>
                <Field label="Monthly rent (₹)" icon={<Wallet className="size-3.5" />}>
                  <div className="rounded-xl bg-secondary/50 p-4">
                    <div className="font-display font-bold text-2xl tracking-tight">₹{rent.toLocaleString("en-IN")}</div>
                    <input type="range" min={5000} max={150000} step={1000} value={rent} onChange={(e) => setRent(Number(e.target.value))} className="mt-3 w-full accent-accent" />
                  </div>
                </Field>
                <Field label="Security deposit (₹)" icon={<Wallet className="size-3.5" />}>
                  <div className="rounded-xl bg-secondary/50 p-4">
                    <div className="font-display font-bold text-2xl tracking-tight">₹{deposit.toLocaleString("en-IN")}</div>
                    <input type="range" min={0} max={500000} step={5000} value={deposit} onChange={(e) => setDeposit(Number(e.target.value))} className="mt-3 w-full accent-accent" />
                  </div>
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h1 className="font-display font-bold text-2xl tracking-tight">Photos</h1>
                <label className="block rounded-2xl border-2 border-dashed border-border bg-background hover:border-accent/40 transition cursor-pointer p-10 text-center">
                  <UploadCloud className="size-8 mx-auto text-accent" />
                  <div className="mt-3 text-sm font-medium">Drop photos here, or click to upload</div>
                  <div className="text-xs text-muted-foreground mt-1">JPG or PNG · up to 6 photos · max 10MB each</div>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
                </label>
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((src, i) => (
                      <div key={src + i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                        <img src={src} alt={`Property ${i + 1}`} className="w-full h-full object-cover" />
                        <button onClick={() => setImages(images.filter((x) => x !== src))} className="absolute top-1.5 right-1.5 size-6 rounded-full bg-background/80 backdrop-blur grid place-items-center opacity-0 group-hover:opacity-100 transition">
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h1 className="font-display font-bold text-2xl tracking-tight">Review & submit</h1>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <Review label="Name" value={name || "—"} />
                  <Review label="Location" value={`${area || "—"}, ${city}`} />
                  <Review label="Type" value={type} />
                  <Review label="Rent" value={`₹${rent.toLocaleString("en-IN")}/mo`} />
                  <Review label="Deposit" value={`₹${deposit.toLocaleString("en-IN")}`} />
                  <Review label="Photos" value={`${images.length} uploaded`} />
                </div>
                <div className="rounded-2xl border border-accent/20 bg-accent/[0.04] p-5">
                  <div className="flex items-center gap-2 font-medium text-sm">
                    <ShieldCheck className="size-4 text-accent" /> Verification pending
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    Our team reviews every listing. Most properties are approved within 6 hours.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <TrustBadge kind="human" />
                    <TrustBadge kind="kyc" />
                  </div>
                </div>
                {error && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm p-3">{error}</div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button disabled={step === 0} onClick={prev}
            className="text-sm font-medium px-4 h-11 rounded-full border border-border hover:bg-secondary disabled:opacity-40 inline-flex items-center gap-1.5">
            <ArrowLeft className="size-4" /> Back
          </button>
          {step < 3 ? (
            <button onClick={next}
              className="text-sm font-medium px-5 h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 shadow-elegant">
              Continue <ArrowRight className="size-4" />
            </button>
          ) : (
            <button onClick={submit} disabled={submitting}
              className="text-sm font-medium px-5 h-11 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 inline-flex items-center gap-1.5 shadow-elegant disabled:opacity-60">
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {submitting ? "Submitting..." : "Submit for verification"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return <div><div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium inline-flex items-center gap-1.5 mb-2">{icon}{label}</div>{children}</div>;
}

function Review({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-border bg-background p-4"><div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div><div className="mt-1 font-display font-semibold">{value}</div></div>;
}
