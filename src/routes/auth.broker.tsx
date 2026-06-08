import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { AuthShell, Field, Input, PrimaryButton } from "@/components/auth/AuthShell";
import { Building2, ShieldCheck, Upload, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type Step = "register" | "done";

export default function BrokerAuthPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState<Step>("register");
  const [form, setForm] = useState({ name: "", agency: "", email: "", phone: "", rera: "" });
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const errs = {
    name: touched && !form.name ? "Required" : "",
    email: touched && !/^\S+@\S+\.\S+$/.test(form.email) ? "Enter a valid work email" : "",
    phone: touched && !/^[6-9]\d{9}$/.test(form.phone) ? "10-digit mobile required" : "",
    rera: touched && form.rera.length < 6 ? "RERA ID looks too short" : "",
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (Object.values(errs).some(Boolean)) return;
    setLoading(true);
    setError("");
    try {
      await register({
        email: form.email,
        password: "TempBroker@123", // broker sets real password after approval
        full_name: form.name,
        phone: form.phone,
        role: "broker",
      });
      setStep("done");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <AuthShell
        eyebrow="For brokers"
        title="Application submitted"
        subtitle="Your broker account is under review."
        footer={<Link to="/auth/login" className="text-foreground font-medium underline underline-offset-4">Sign in</Link>}
      >
        <Helmet><title>Broker access — RentSaathi</title></Helmet>
        <div className="rounded-2xl border border-success/30 bg-success/5 p-6 text-center">
          <div className="mx-auto size-12 rounded-full bg-success/15 text-success grid place-items-center">
            <Building2 className="size-5" />
          </div>
          <div className="mt-3 font-display font-semibold text-lg text-foreground">Verification pending</div>
          <p className="text-sm text-muted-foreground mt-1">
            Our review team checks broker applications within 24 hours. You'll get an email at {form.email} once approved.
          </p>
          <Link to="/auth/login" className="inline-flex mt-4 h-10 px-4 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
            Go to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="For brokers"
      title="Register as a broker"
      subtitle="List properties and connect with verified renters."
      footer={<><>Already verified?</> <Link to="/auth/login" className="text-foreground font-medium underline underline-offset-4">Sign in</Link></>}
    >
      <Helmet><title>Broker access — RentSaathi</title></Helmet>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Your name" error={errs.name}>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} invalid={!!errs.name} />
        </Field>
        <Field label="Agency / firm">
          <Input value={form.agency} onChange={(e) => setForm({ ...form, agency: e.target.value })} placeholder="Optional" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Work email" error={errs.email}>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} invalid={!!errs.email} />
          </Field>
          <Field label="Mobile" error={errs.phone}>
            <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} invalid={!!errs.phone} />
          </Field>
        </div>
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm p-3">{error}</div>
        )}
        <PrimaryButton disabled={loading}>
          {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Submitting…</span> : "Submit broker application"}
        </PrimaryButton>
        <p className="text-[11px] text-muted-foreground">
          You'll need to provide PAN, Aadhaar, and RERA documents once your account is active.
        </p>
      </form>
    </AuthShell>
  );
}
