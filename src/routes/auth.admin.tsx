import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { AuthShell, Field, Input, PrimaryButton } from "@/components/auth/AuthShell";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Enter both email and password");
      return;
    }
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.needsVerification) {
        setError("This account is not yet verified.");
      } else {
        navigate("/admin", { replace: true });
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (detail === "Invalid credentials") {
        setError("Incorrect email or password.");
      } else if (err.response?.status === 403) {
        setError("Access denied. This account does not have admin privileges.");
      } else {
        setError(detail || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Restricted access"
      title="Operations sign in"
      subtitle="Authenticate to access the admin control panel."
      footer={<Link to="/auth/login" className="text-foreground underline underline-offset-4">Renter or broker login</Link>}
    >
      <Helmet><title>Admin sign in — RentSaathi</title></Helmet>
      <div className="rounded-xl border border-accent/20 bg-accent/10 p-3 text-xs text-foreground flex items-start gap-2 mb-5">
        <ShieldCheck className="size-4 text-accent mt-0.5" />
        <div>This area is monitored. Every action is recorded in the immutable audit log.</div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Field label="Admin email" error={""}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@rentsaathi.com" autoComplete="email" />
        </Field>
        <Field label="Password">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password" />
        </Field>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm p-3">{error}</div>
        )}

        <PrimaryButton disabled={loading}>
          {loading ? (
            <span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Signing in…</span>
          ) : "Sign in to operations"}
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}
