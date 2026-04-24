import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { CountryPicker } from "@/components/CountryPicker";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Open Account — Gold Empire Investment" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [show, setShow] = useState(false);
  const [country, setCountry] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [user, loading, navigate]);

  // Auto-detect country from timezone
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const guess: Record<string, string> = {
        London: "GB", Paris: "FR", Berlin: "DE", Madrid: "ES", Rome: "IT",
        Amsterdam: "NL", Tokyo: "JP", Shanghai: "CN", Singapore: "SG",
        Dubai: "AE", Lagos: "NG", Cairo: "EG", Sao_Paulo: "BR", Mexico_City: "MX",
        Sydney: "AU", New_York: "US", Los_Angeles: "US", Chicago: "US",
        Toronto: "CA", Mumbai: "IN", Istanbul: "TR", Moscow: "RU",
      };
      const city = tz.split("/")[1];
      if (city && guess[city]) setCountry(guess[city]);
    } catch {}
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, country },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Sign up failed");
      return;
    }

    // Fire welcome email (non-blocking)
    if (data.user?.id) {
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "welcome", user_id: data.user.id }),
      }).catch(() => {});
    }

    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="min-h-screen bg-hero py-10">
      <div className="mx-auto max-w-md px-5">
        <Link to="/" className="inline-block">
          <Logo size={48} />
        </Link>

        <div className="mt-8 rounded-3xl glass p-7 shadow-emerald">
          <h1 className="font-display text-3xl">Open your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join 84,000+ investors compounding wealth daily.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field label="Full name">
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className={inputCls}
              />
            </Field>
            <Field label="Email">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className={inputCls}
              />
            </Field>
            <Field label="Password">
              <div className="relative">
                <input
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            <Field label="Country">
              <CountryPicker value={country} onChange={setCountry} />
            </Field>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold py-3 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-colors focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-foreground/85">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
