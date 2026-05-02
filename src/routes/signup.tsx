import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { CountryPicker } from "@/components/CountryPicker";
import { Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
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
  const { user, loading } = useAuth();
  const [show, setShow] = useState(false);
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setReferredBy(ref);
  }, []);

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
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    
    setSubmitting(true);
    try {
      // 1. Generate 6-digit OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60000).toISOString(); // 10 mins

      // 2. Store in DB
      const { error: dbError } = await supabase
        .from("otp_verifications")
        .upsert({ email, code, expires_at: expiresAt });

      if (dbError) throw dbError;

      // 3. Send Email
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "send_otp",
          user_id: email, // Passing email as user_id for the handler
          code
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to send verification email");
      }

      setOtpSent(true);
      toast.success("Verification code sent to your email!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const verifyAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.length !== 6) return toast.error("Please enter the 6-digit code");

    setVerifying(true);
    try {
      // 1. Check OTP in DB
      const { data, error } = await supabase
        .from("otp_verifications")
        .select("*")
        .eq("email", email)
        .eq("code", otpInput)
        .gte("expires_at", new Date().toISOString())
        .maybeSingle();

      if (error || !data) throw new Error("Invalid or expired verification code");

      // 2. Clear OTP
      await supabase.from("otp_verifications").delete().eq("email", email);

      const userData: any = {
        full_name: fullName,
        username: username,
        country: country,
        phone: phone,
      };
      
      if (referredBy.trim() !== "") {
        userData.referred_by = referredBy.trim();
      }

      // 3. Create User in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (authError) throw authError;

      toast.success("Account created successfully!");
      if (authData.session) {
        navigate({ to: "/dashboard", replace: true });
      } else {
        navigate({ to: "/login", replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
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
          className="mt-8 rounded-3xl glass p-8 shadow-emerald min-h-[400px] flex flex-col justify-center"
        >
          {!otpSent ? (
            <>
              <motion.div variants={fadeUp}>
                <h1 className="font-display text-3xl">Open your account</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Join 84,000+ investors compounding wealth daily.
                </p>
              </motion.div>

              <form onSubmit={onSubmit} className="mt-8 space-y-5">
                <motion.div variants={fadeUp}>
                  <Field label="Full name">
                    <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className={inputCls} />
                  </Field>
                </motion.div>
                <motion.div variants={fadeUp}>
                  <Field label="Username">
                    <input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johndoe" className={inputCls} />
                  </Field>
                </motion.div>
                <motion.div variants={fadeUp}>
                  <Field label="Email">
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={inputCls} />
                  </Field>
                </motion.div>
                <motion.div variants={fadeUp}>
                  <Field label="Password">
                    <div className="relative">
                      <input required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} type={show ? "text" : "password"} placeholder="••••••••" className={inputCls} />
                      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
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
                    <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" className={inputCls} />
                  </Field>
                </motion.div>
                <motion.div variants={fadeUp}>
                  <Field label="Referred by (Optional)">
                    <input value={referredBy} onChange={(e) => setReferredBy(e.target.value)} placeholder="Username of referrer" className={inputCls} />
                  </Field>
                </motion.div>

                <motion.div variants={fadeUp} className="pt-2">
                  <button disabled={submitting} type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold py-3.5 text-sm font-semibold text-primary-foreground shadow-gold">
                    {submitting && <Loader2 size={14} className="animate-spin" />}
                    {submitting ? "Sending code…" : "Create account"}
                  </button>
                </motion.div>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
              <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="font-display text-2xl">Verify your email</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We've sent a 6-digit code to <br /><b className="text-foreground">{email}</b>
              </p>

              <form onSubmit={verifyAndCreate} className="mt-8 space-y-6">
                <input
                  required
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="000 000"
                  className="w-full bg-transparent text-center font-display text-4xl tracking-[0.5em] outline-none placeholder:text-muted-foreground/20"
                  autoFocus
                />
                
                <div className="space-y-3">
                  <button disabled={verifying} type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-gold">
                    {verifying && <Loader2 size={14} className="animate-spin" />}
                    {verifying ? "Verifying…" : "Verify & Create Account"}
                  </button>
                  <button type="button" onClick={() => setOtpSent(false)} className="flex w-full items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                    <ArrowLeft size={12} /> Edit email or details
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          <motion.p variants={fadeUp} className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
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
