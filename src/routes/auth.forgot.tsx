import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { AuthShell, Field, Input, PrimaryButton } from "@/components/auth/AuthShell";
import { Mail, Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fieldError = touched && !/^\S+@\S+\.\S+$/.test(email) ? "Enter the email used to register" : "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (fieldError || !email) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Forgot your password?"
      subtitle="We'll email you a secure link to set a new one."
      footer={<><>Remembered it?</> <Link to="/auth/login" className="text-foreground font-medium underline underline-offset-4">Back to sign in</Link></>}
    >
      <Helmet><title>Reset password — RentSaathi</title></Helmet>
      {sent ? (
        <div className="rounded-2xl border border-border bg-surface p-6 text-center">
          <div className="mx-auto size-12 rounded-full bg-success/10 text-success grid place-items-center">
            <Mail className="size-5" />
          </div>
          <div className="mt-4 font-display font-semibold text-lg">Check your inbox</div>
          <p className="text-sm text-muted-foreground mt-1">
            If <span className="text-foreground font-medium">{email}</span> matches an account, a reset link is on its way.
          </p>
          <p className="text-xs text-muted-foreground mt-3">The link expires in 30 minutes.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Email" error={fieldError || error}>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} invalid={!!(fieldError || error)} placeholder="you@example.com" />
          </Field>
          <PrimaryButton disabled={loading}>
            {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Sending…</span> : "Send reset link"}
          </PrimaryButton>
        </form>
      )}
    </AuthShell>
  );
}
