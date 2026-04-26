import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/admin-login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (email !== "adminexpert@invest.com") {
        toast.error("Unauthorized access attempt. Access denied.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Double check role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        await supabase.auth.signOut();
        toast.error("Account does not have administrative privileges.");
      } else {
        toast.success("Identity verified. Welcome, Commander.");
        navigate({ to: "/admin" });
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#020807] p-4 font-sans text-foreground">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] h-[50%] w-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-[25%] -right-[10%] h-[50%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center mb-10">
          <div className="mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-white/[0.03] border border-white/10 shadow-2xl">
            <Logo size={48} withText={false} />
          </div>
          <h1 className="font-display text-3xl tracking-tight text-white">Security Gateway</h1>
          <p className="mt-2 text-sm text-muted-foreground uppercase tracking-[0.3em] font-bold">Admin Console</p>
        </div>

        <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/40 p-8 backdrop-blur-2xl shadow-gold-lg">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Administrative Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Mail size={16} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@expert-invest.com"
                  className="w-full rounded-2xl border border-white/5 bg-white/5 px-12 py-4 text-sm outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Access Passcode</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Lock size={16} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/5 bg-white/5 px-12 py-4 text-sm outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-gold py-4 text-xs font-bold uppercase tracking-[0.3em] text-primary-foreground shadow-gold hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              <span className="relative flex items-center justify-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                {loading ? "Authenticating..." : "Authorize Access"}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">
          Authorized personnel only. <br />
          Unauthorized access attempts are logged and monitored.
        </p>
      </div>
    </div>
  );
}
