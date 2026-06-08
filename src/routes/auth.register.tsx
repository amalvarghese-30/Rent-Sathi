import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { AuthShell, Field, Input, PrimaryButton } from "@/components/auth/AuthShell";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const errs = {
    name: touched && name.trim().length < 2 ? "Tell us your name (min 2 characters)" : "",
    email: touched && !/^\S+@\S+\.\S+$/.test(email) ? "Enter a valid email address" : "",
    phone: touched && !/^[6-9]\d{9}$/.test(phone) ? "Enter a 10-digit Indian mobile number" : "",
    password: touched && password.length < 8 ? "Use at least 8 characters" : "",
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (Object.values(errs).some(Boolean) || !name || !email || !phone || !password) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      await register({ email, password, full_name: name, phone });
      setStatus("success");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (detail?.includes("already exists")) {
        setErrorMsg("An account with this email already exists. Try signing in instead.");
      } else if (err.response?.status === 429) {
        setErrorMsg("Too many attempts. Please wait a moment.");
      } else {
        setErrorMsg(detail || "Something went wrong. Please try again.");
      }
      setStatus("error");
    }
  };

  return (
    <AuthShell
      eyebrow="Get matched"
      title="Create your RentSaathi account"
      subtitle="Post requirements once. Receive verified broker matches privately."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/auth/login" className="text-foreground font-medium underline underline-offset-4">Sign in</Link>
        </>
      }
    >
      <Helmet><title>Create account — RentSaathi</title></Helmet>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Full name" error={errs.name}>
          <Input value={name} onChange={(e) => setName(e.target.value)} invalid={!!errs.name} placeholder="Priya Sharma" />
        </Field>
        <Field label="Email" error={errs.email}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} invalid={!!errs.email} placeholder="priya@example.com" />
        </Field>
        <Field label="Mobile number" error={errs.phone} hint="Stays private — never shared without your approval.">
          <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} invalid={!!errs.phone} placeholder="98XXXXXXXX" />
        </Field>
        <Field label="Password" error={errs.password} hint="Minimum 8 characters.">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} invalid={!!errs.password} placeholder="••••••••" />
        </Field>

        {status === "error" && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm p-3">{errorMsg}</div>
        )}

        {status === "success" ? (
          <div className="rounded-xl border border-success/30 bg-success/5 text-success text-sm p-4 flex items-start gap-2">
            <CheckCircle2 className="size-4 mt-0.5" />
            <div>
              <div className="font-medium">Account created</div>
              <div className="text-success/80 text-xs mt-1">
                {email} is now registered.{" "}
                <button onClick={() => navigate("/auth/login")} className="underline font-medium">Sign in now</button>
              </div>
            </div>
          </div>
        ) : (
          <PrimaryButton disabled={status === "loading"}>
            {status === "loading" ? (
              <span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Creating account…</span>
            ) : "Create account"}
          </PrimaryButton>
        )}

        <p className="text-[11px] text-muted-foreground text-center">
          By continuing you agree to RentSaathi's Terms and privacy-first contact policy.
        </p>
      </form>
    </AuthShell>
  );
}
