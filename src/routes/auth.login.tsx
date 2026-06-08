import { Link, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { AuthShell, Field, Input, PrimaryButton } from "@/components/auth/AuthShell";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = (location.state as { from?: string })?.from;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [touched, setTouched] = useState(false);

  const emailError = touched && !/^\S+@\S+\.\S+$/.test(email) ? "Enter a valid email address" : "";
  const passError = touched && password.length < 8 ? "Password must be at least 8 characters" : "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (emailError || passError || !email || !password) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const result = await login(email, password);
      if (result.needsVerification) {
        setErrorMsg("Your email is not yet verified. Please check your inbox or contact support.");
        setStatus("error");
      } else {
        const role = result.user?.role;
        const roleRedirects: Record<string, string> = { admin: "/admin", broker: "/broker", renter: "/dashboard" };
        const to = from || roleRedirects[role || ""] || "/dashboard";
        navigate(to, { replace: true });
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (detail === "Account locked") {
        setErrorMsg("Account locked after too many failed attempts. Try again later or reset your password.");
      } else if (detail === "Invalid credentials") {
        setErrorMsg("Wrong email or password. Please try again.");
      } else if (err.response?.status === 429) {
        setErrorMsg("Too many attempts. Please wait a moment before trying again.");
      } else {
        setErrorMsg(detail || "We couldn't sign you in. Please check your connection and try again.");
      }
      setStatus("error");
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to RentSaathi"
      subtitle="Access your requirements, matches and approved connections."
      footer={
        <>
          New here?{" "}
          <Link to="/auth/register" className="text-foreground font-medium underline underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      <Helmet><title>Sign in — RentSaathi</title></Helmet>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email" error={emailError}>
          <Input type="email" placeholder="you@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)} invalid={!!emailError} autoComplete="email" />
        </Field>
        <Field label="Password" error={passError}
          hint={<Link to="/auth/forgot" className="text-accent hover:underline">Forgot password?</Link>}>
          <Input type="password" placeholder="••••••••" value={password}
            onChange={(e) => setPassword(e.target.value)} invalid={!!passError} autoComplete="current-password" />
        </Field>

        {status === "error" && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm p-3">
            {errorMsg}
          </div>
        )}

        <PrimaryButton disabled={status === "loading"}>
          {status === "loading" ? (
            <span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Signing in…</span>
          ) : "Sign in"}
        </PrimaryButton>

        <div className="text-center text-xs text-muted-foreground">
          Broker?{" "}
          <Link to="/auth/broker" className="text-foreground underline underline-offset-4">Broker access</Link>
          {" · "}
          <Link to="/auth/admin" className="text-foreground underline underline-offset-4">Admin</Link>
        </div>
      </form>
    </AuthShell>
  );
}
