import { createFileRoute } from "@tanstack/react-router";
import { Mail, Globe, CalendarDays, Shield, Wallet, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({ meta: [{ title: "Profile — Gold Empire" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth();
  const [updating, setUpdating] = useState(false);
  
  if (!profile) return null;
  const initials = (profile.full_name || profile.email || "U").split(" ").map(n => n[0]).slice(0, 2).join("");

  const [form, setForm] = useState({
    full_name: profile.full_name || "",
    username: profile.username || "",
    phone: profile.phone || "",
    country: profile.country || ""
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdating(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          username: form.username,
          phone: form.phone,
          country: form.country
        })
        .eq("id", user.id);

      if (error) throw error;
      
      await refreshProfile();
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl lg:text-4xl">Your profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and security.</p>
      </div>

      <div className="rounded-3xl bg-gradient-emerald p-1 shadow-emerald">
        <div className="rounded-[calc(1.5rem-4px)] glass p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-gold font-display text-3xl text-primary-foreground shadow-gold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-2xl">{profile.full_name || "—"}</h2>
              <div className="text-sm text-muted-foreground">{profile.email}</div>
              <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-0.5 text-[11px] font-semibold text-success">
                <Shield size={11} /> Verified
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Total balance</div>
              <div className="font-display text-2xl text-gradient-gold">{formatCurrency((profile.total_invested || 0) + (profile.profit_balance || 0))}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { icon: Mail, label: "Email", value: profile.email || "—" },
          { icon: Globe, label: "Country", value: profile.country || "—" },
          { icon: CalendarDays, label: "Account created on", value: new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
          { icon: Wallet, label: "Total invested", value: formatCurrency(profile.total_invested) },
        ].map((f) => (
          <div key={f.label} className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card/40 p-4 backdrop-blur hover:bg-card/60 transition-colors">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary"><f.icon size={18} /></div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.label}</div>
              <div className="mt-0.5 text-sm font-semibold">{f.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl glass p-6 lg:p-8">
        <h3 className="font-display text-2xl">Profile Settings</h3>
        <p className="mt-1 text-sm text-muted-foreground">Update your personal information.</p>
        
        <form onSubmit={handleUpdate} className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-foreground/85">Full name</label>
            <input required type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="mt-1.5 w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background/90" />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground/85">Username</label>
            <input required type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="mt-1.5 w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background/90" />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground/85">Email address</label>
            <input readOnly type="email" value={profile.email} className="mt-1.5 w-full rounded-xl border border-border bg-background/30 px-4 py-3 text-sm text-muted-foreground outline-none cursor-not-allowed" />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground/85">Phone number</label>
            <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="mt-1.5 w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background/90" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-foreground/85">Country</label>
            <input type="text" value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="mt-1.5 w-full max-w-sm rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background/90" />
          </div>
          <div className="sm:col-span-2">
            <button disabled={updating} className="flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold disabled:opacity-60">
              {updating && <Loader2 size={14} className="animate-spin" />}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

