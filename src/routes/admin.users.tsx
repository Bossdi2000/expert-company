import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Edit3, Trash2, X, Check, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
  component: AdminUsersPage,
});

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  country: string | null;
  balance: number;
  total_invested: number;
  total_profit: number;
  custom_roi_bonus: number;
  created_at: string;
};

function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<Profile[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [fundingId, setFundingId] = useState<string | null>(null);
  const [fundingType, setFundingType] = useState<"plan" | "reward">("plan");
  const [plans, setPlans] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fundUser = users.find((u) => u.id === fundingId);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }, { data: plansData }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("plans").select("*").eq("is_active", true),
    ]);
    setUsers((profiles as Profile[]) ?? []);
    setAdminIds(new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id)));
    setPlans(plansData || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = users.filter(
    (u) =>
      (u.full_name ?? "").toLowerCase().includes(q.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  const editUser = users.find((u) => u.id === editingId);

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this user profile? Auth account remains.")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("User profile deleted");
    setUsers(users.filter((u) => u.id !== id));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editUser) return;
    const fd = new FormData(e.currentTarget);
    const _balance = Number(fd.get("balance"));
    const _roi_bonus = Number(fd.get("roi_bonus"));
    const { error } = await supabase.rpc("admin_update_user", {
      _user_id: editUser.id,
      _balance,
      _roi_bonus,
    });
    if (error) return toast.error(error.message);
    toast.success("User updated");
    setEditingId(null);
    load();
  };

  const handleDirectFund = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fundUser) return;
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const amount = Number(fd.get("amount"));
    
    try {
      if (fundingType === "plan") {
        const planId = fd.get("plan_id") as string;
        const { error } = await supabase.rpc("admin_create_investment", {
          _user_id: fundUser.id,
          _plan_id: planId,
          _amount: amount
        });
        if (error) throw error;
        toast.success(`Plan successfully activated for ${fundUser.full_name}`);
      } else {
        const { error } = await supabase.rpc("admin_update_user", {
          _user_id: fundUser.id,
          _balance: fundUser.balance + amount,
          _roi_bonus: fundUser.custom_roi_bonus
        });
        if (error) throw error;
        toast.success(`Reward balance updated for ${fundUser.full_name}`);
      }
      setFundingId(null);
      load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl text-gradient-gold">Investor accounts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Managing {users.length} registered investors on the platform.
          </p>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={14} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search investors..."
            className="w-full sm:w-72 rounded-2xl border border-white/5 bg-white/5 px-10 py-3 text-sm outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                  <th className="px-6 py-4">Investor Identity</th>
                  <th className="px-6 py-4">Financial Status</th>
                  <th className="px-6 py-4">ROI Perks</th>
                  <th className="px-6 py-4 text-right">Administrative</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((u) => (
                  <tr key={u.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-muted-foreground uppercase font-display text-lg">
                          {u.full_name?.[0] || "?"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white group-hover:text-primary transition-colors">
                              {u.full_name || "Anonymous"}
                            </span>
                            {adminIds.has(u.id) && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary border border-primary/20">
                                <ShieldCheck size={9} /> Master Admin
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-mono text-sm font-bold text-gradient-gold">
                        {formatCurrency(u.balance)}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                        Invested: {formatCurrency(u.total_invested)}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">+{u.custom_roi_bonus}%</span>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Bonus</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setFundingId(u.id)}
                          className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider shadow-gold transition-all hover:scale-105 active:scale-95"
                        >
                          Direct Fund
                        </button>
                        <button
                          onClick={() => setEditingId(u.id)}
                          className="p-2 rounded-xl bg-white/5 text-muted-foreground hover:bg-primary/10 hover:text-primary border border-white/5 transition-all"
                          title="Manage Account"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-2 rounded-xl bg-white/5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive border border-white/5 transition-all"
                          title="Delete Account"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="px-6 py-20 text-center text-sm text-muted-foreground italic">
              No matching investor records found.
            </div>
          )}
        </div>
      )}

      {/* --- DIRECT FUNDING MODAL --- */}
      {fundUser && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/80 p-4 backdrop-blur-md sm:items-center">
          <form
            onSubmit={handleDirectFund}
            className="w-full max-w-md rounded-[2.5rem] border border-white/10 bg-[#050c0a] p-8 shadow-gold-lg animate-in zoom-in duration-300"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-display text-2xl text-white">Direct Funding</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Target: {fundUser.full_name || fundUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setFundingId(null)}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl mb-6">
              {(["plan", "reward"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFundingType(t)}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
                    fundingType === t ? "bg-primary text-primary-foreground shadow-gold" : "text-muted-foreground hover:bg-white/5"
                  }`}
                >
                  {t === "plan" ? "Activate Plan" : "Fund Reward Balance"}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {fundingType === "plan" && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Choose Plan</label>
                  <select
                    name="plan_id"
                    required
                    className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3.5 text-sm outline-none focus:border-primary transition-all appearance-none"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#050c0a]">
                        {p.name} ({p.daily_roi_pct}%)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
                  {fundingType === "plan" ? "Investment Amount ($)" : "Additional Reward ($)"}
                </label>
                <input
                  name="amount"
                  type="number"
                  required
                  placeholder="0.00"
                  className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3.5 text-sm font-display outline-none focus:border-primary transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-gradient-gold py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-gold hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {submitting ? <Loader2 size={14} className="animate-spin inline mr-2" /> : <ShieldCheck size={14} className="inline mr-2" />}
                {fundingType === "plan" ? "Activate Investment" : "Confirm Credit"}
              </button>
            </div>
          </form>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/80 p-4 backdrop-blur-md sm:items-center">
          <form
            onSubmit={handleSave}
            className="w-full max-w-md rounded-[2.5rem] border border-white/10 bg-[#050c0a] p-8 shadow-gold-lg animate-in zoom-in duration-300"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-display text-2xl text-white">Modify Portfolio</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{editUser.full_name || editUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Adjustable Balance ($)</label>
                <input
                  name="balance"
                  type="number"
                  step="0.01"
                  defaultValue={editUser.balance}
                  className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3.5 text-sm font-display outline-none focus:border-primary transition-all"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Loyalty ROI Bonus (%)</label>
                <input
                  name="roi_bonus"
                  type="number"
                  step="0.1"
                  defaultValue={editUser.custom_roi_bonus}
                  className="mt-2 w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3.5 text-sm font-display outline-none focus:border-primary transition-all"
                />
                <p className="mt-3 text-[10px] text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-3">
                  This bonus adds to the base ROI of all future investments initiated by this user.
                </p>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-gold py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-gold hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Check size={14} className="inline mr-2" /> Commit Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium">{label}</label>
      {children}
    </div>
  );
}
