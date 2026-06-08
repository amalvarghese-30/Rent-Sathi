import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { AuthShell, Field, Input, PrimaryButton } from "@/components/auth/AuthShell";
import { CheckCircle2, Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tooShort = touched && p1.length < 8 ? "Use at least 8 characters" : "";
  const mismatch = touched && p2 && p1 !== p2 ? "Passwords don't match" : "";

  const strength = p1.length >= 12 ? "Strong" : p1.length >= 8 ? "Good" : p1.length > 0 ? "Weak" : "";
  const strengthTone = strength === "Strong" ? "text-success" : strength === "Good" ? "text-accent" : "text-destructive";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (tooShort || mismatch || !p1 || !p2) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/reset-password", { token, new_password: p1 });
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell eyebrow="Reset password" title="Set a new password" subtitle="Choose something memorable but hard to guess.">
      <Helmet><title>Set new password — RentSaathi</title></Helmet>
      {done ? (
        <div className="rounded-2xl border border-success/30 bg-success/5 text-success p-6 text-center">
          <CheckCircle2 className="size-8 mx-auto" />
          <div className="mt-3 font-display font-semibold text-lg text-foreground">Password updated</div>
          <p className="text-sm text-muted-foreground mt-1">You can now sign in with your new password.</p>
          <Link to="/auth/login" className="inline-flex mt-4 h-10 px-4 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
            Go to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="New password" error={tooShort}
            hint={strength ? <span className={strengthTone}>Strength: {strength}</span> : undefined}>
            <Input type="password" value={p1} onChange={(e) => setP1(e.target.value)} invalid={!!tooShort} />
          </Field>
          <Field label="Confirm password" error={mismatch || error}>
            <Input type="password" value={p2} onChange={(e) => setP2(e.target.value)} invalid={!!(mismatch || !!error)} />
          </Field>
          <PrimaryButton disabled={loading}>
            {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Updating…</span> : "Update password"}
          </PrimaryButton>
        </form>
      )}
    </AuthShell>
  );
}
