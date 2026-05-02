import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password — Gold Empire Investment" }] }),
  component: ForgotPasswordPage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setSuccess(true);
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
            <Link to="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-white transition-colors mb-6">
              <ArrowLeft size={14} /> Back to login
            </Link>
            <h1 className="font-display text-3xl">Reset Password</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </motion.div>

          {success ? (
            <motion.div variants={fadeUp} className="mt-8 p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <p className="text-sm font-medium text-white">Check your email</p>
              <p className="text-xs text-muted-foreground mt-1">
                We've sent a password reset link to <span className="font-semibold text-primary">{email}</span>.
              </p>
            </motion.div>
          ) : (
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
              
              <motion.div variants={fadeUp} className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-all hover:scale-[1.02] hover:shadow-[0_20px_60px_-15px_oklch(0.78_0.13_85/50%)] disabled:opacity-60 disabled:hover:scale-100"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {submitting ? "Sending..." : "Send reset link"}
                </button>
              </motion.div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
