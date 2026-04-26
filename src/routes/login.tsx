import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Gold Empire Investment" }] }),
  component: LoginPage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [user, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Successfully logged in");
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
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
          className="mt-8 rounded-3xl glass p-8 shadow-emerald"
        >
          <motion.div variants={fadeUp}>
            <h1 className="font-display text-3xl">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to access your portfolio.
            </p>
          </motion.div>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <motion.div variants={fadeUp}>
              <label className="text-xs font-medium text-foreground/85">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="mt-1.5 w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background/90 focus:ring-4 focus:ring-primary/10"
              />
            </motion.div>
            
            <motion.div variants={fadeUp}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground/85">Password</label>
                <button type="button" onClick={() => toast.info("Check your email for reset instructions")} className="text-[10px] font-semibold text-primary hover:underline">Forgot password?</button>
              </div>
              <div className="relative mt-1.5">
                <input
                  required
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background/90 focus:ring-4 focus:ring-primary/10"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-all hover:scale-[1.02] hover:shadow-[0_20px_60px_-15px_oklch(0.78_0.13_85/50%)] disabled:opacity-60 disabled:hover:scale-100"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {submitting ? "Signing in…" : "Sign in"}
              </button>
            </motion.div>
          </form>

          <motion.p variants={fadeUp} className="mt-6 text-center text-xs text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Open an account
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
