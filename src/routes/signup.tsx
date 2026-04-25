import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { CountryPicker } from "@/components/CountryPicker";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Open Account — Gold Empire Investment" }] }),
  component: SignupPage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function SignupPage() {
  const navigate = useNavigate();
  const { user, loading, mockLogin } = useAuth();
  const [show, setShow] = useState(false);
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
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
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Bypass Supabase and use mock login
    mockLogin(email, fullName, country, phone);
    
    setSubmitting(false);
    toast.success("Account created successfully");
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="min-h-screen bg-hero py-10 relative overflow-hidden">
      <div className="mx-auto max-w-md px-5 relative z-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <Link to="/" className="inline-block">
            <Logo size={48} />
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="mt-8 rounded-3xl glass p-8 shadow-emerald"
        >
          <motion.div variants={fadeUp}>
            <h1 className="font-display text-3xl">Open your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Join 84,000+ investors compounding wealth daily.
            </p>
          </motion.div>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <motion.div variants={fadeUp}>
              <Field label="Full name">
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className={inputCls}
                />
              </Field>
            </motion.div>
            <motion.div variants={fadeUp}>
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
            </motion.div>
            <motion.div variants={fadeUp}>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
            </motion.div>
            <motion.div variants={fadeUp} className="grid gap-5 sm:grid-cols-2">
              <Field label="Country">
                <CountryPicker value={country} onChange={setCountry} />
              </Field>
              <Field label="Phone number">
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 890"
                  className={inputCls}
                />
              </Field>
            </motion.div>

            <motion.div variants={fadeUp} className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-all hover:scale-[1.02] hover:shadow-[0_20px_60px_-15px_oklch(0.78_0.13_85/50%)] disabled:opacity-60 disabled:hover:scale-100"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {submitting ? "Creating account…" : "Create account"}
              </button>
            </motion.div>
          </form>

          <motion.p variants={fadeUp} className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background/90 focus:ring-4 focus:ring-primary/10";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-foreground/85">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
