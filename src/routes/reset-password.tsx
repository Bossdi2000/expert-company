import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set New Password — Gold Empire Investment" }] }),
  component: ResetPasswordPage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if the user is here with a valid recovery session
    // Supabase will automatically log them in via the hash in the URL
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // Not a valid recovery state
        toast.error("Invalid or expired password reset link.");
        navigate({ to: "/login", replace: true });
      }
    };
    checkSession();
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password updated successfully!");
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
          <div className="inline-block">
            <Logo size={48} />
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="mt-8 rounded-3xl glass p-8 shadow-emerald"
        >
          <motion.div variants={fadeUp}>
            <h1 className="font-display text-3xl">Set New Password</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter a new password for your account.
            </p>
          </motion.div>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <motion.div variants={fadeUp}>
              <label className="text-xs font-medium text-foreground/85">New Password</label>
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
                {submitting ? "Updating..." : "Update Password"}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
