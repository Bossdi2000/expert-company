import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { 
  Users, Wallet, TrendingUp, Bell, ArrowRight, Loader2, 
  ArrowUpCircle, Activity, Briefcase, ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

type RecentDeposit = {
  id: string;
  user_id: string;
  amount: number;
  token: string;
  status: string;
  created_at: string;
  profile?: { full_name: string | null; email: string | null };
};

function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    aum: 0,
    activeInvestments: 0,
    pendingDeps: 0,
    pendingWds: 0,
  });
  const [recent, setRecent] = useState<RecentDeposit[]>([]);

  useEffect(() => {
    (async () => {
      const [
        { count: usersCount },
        { data: profileSums },
        { count: invCount },
        { data: pendingDeps },
        { data: pendingWds },
        { data: recentDeps },
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("balance, total_invested"),
        supabase
          .from("investments")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        supabase.from("deposits").select("id").eq("status", "pending"),
        supabase.from("withdrawals").select("id").eq("status", "pending"),
        supabase
          .from("deposits")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const aum =
        (profileSums ?? []).reduce(
          (s, p: any) => s + Number(p.balance ?? 0) + Number(p.total_invested ?? 0),
          0,
        ) ?? 0;

      let merged: RecentDeposit[] = recentDeps ?? [];
      if (merged.length) {
        const ids = Array.from(new Set(merged.map((d) => d.user_id)));
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", ids);
        const map = new Map((profs ?? []).map((p) => [p.id, p]));
        merged = merged.map((d) => ({ ...d, profile: map.get(d.user_id) ?? undefined }));
      }

      setStats({
        users: usersCount ?? 0,
        aum,
        activeInvestments: invCount ?? 0,
        pendingDeps: pendingDeps?.length ?? 0,
        pendingWds: pendingWds?.length ?? 0,
      });
      setRecent(merged);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  const totalPending = stats.pendingDeps + stats.pendingWds;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">System Monitoring</p>
          <h1 className="mt-1 font-display text-4xl text-white">Platform Overview</h1>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/5 px-4 py-2 text-xs text-muted-foreground">
          <Activity size={14} className="text-success animate-pulse" />
          System Operational
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total Users" value={stats.users.toLocaleString()} icon={Users} gradient="from-blue-500/20 to-indigo-500/20" />
        <Kpi label="Total Assets" value={formatCurrency(stats.aum)} icon={Wallet} gradient="from-emerald-500/20 to-teal-500/20" />
        <Kpi label="Active Plans" value={stats.activeInvestments.toLocaleString()} icon={Briefcase} gradient="from-amber-500/20 to-orange-500/20" />
        <Kpi label="Avg. Balance" value={formatCurrency(stats.aum / (stats.users || 1))} icon={TrendingUp} gradient="from-purple-500/20 to-pink-500/20" />
      </div>

      {(stats.pendingDeps > 0 || stats.pendingWds > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {stats.pendingDeps > 0 && (
            <AlertCard 
              count={stats.pendingDeps} 
              label="Pending Deposits" 
              to="/admin/deposits" 
              icon={Bell}
              color="warning"
            />
          )}
          {stats.pendingWds > 0 && (
            <AlertCard 
              count={stats.pendingWds} 
              label="Pending Withdrawals" 
              to="/admin/withdrawals" 
              icon={ArrowUpCircle}
              color="primary"
            />
          )}
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-white">Recent Activity</h2>
          <Link to="/admin/history" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">View Ledger</Link>
        </div>
        
        <div className="overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <div className="divide-y divide-white/5">
            {recent.length === 0 ? (
              <div className="px-5 py-16 text-center text-sm text-muted-foreground italic">
                No recent transactions detected.
              </div>
            ) : (
              recent.map((d) => (
                <div key={d.id} className="group flex items-center justify-between gap-3 px-6 py-5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-muted-foreground group-hover:text-primary transition-colors">
                      <Wallet size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                        {d.profile?.full_name || "Anonymous User"}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {d.token} • {formatDateTime(d.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold text-gradient-gold">
                      {formatCurrency(d.amount)}
                    </div>
                    <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                      d.status === "received" ? "bg-success/10 text-success border border-success/20" : 
                      d.status === "rejected" ? "bg-destructive/10 text-destructive border border-destructive/20" : 
                      "bg-warning/10 text-warning border border-warning/20"
                    }`}>
                      {d.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, icon: Icon, gradient }: { label: string, value: string, icon: any, gradient: string }) {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04]">
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} blur-2xl opacity-50 group-hover:opacity-80 transition-opacity`} />
      <div className="relative">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-primary group-hover:scale-110 transition-transform">
          <Icon size={18} />
        </div>
        <div className="mt-5 font-display text-3xl text-white tracking-tight">{value}</div>
        <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">{label}</div>
      </div>
    </div>
  );
}

function AlertCard({ count, label, to, icon: Icon, color }: { count: number, label: string, to: string, icon: any, color: "warning" | "primary" }) {
  const colorCls = color === "warning" ? "text-warning bg-warning/10 border-warning/20" : "text-primary bg-primary/10 border-primary/20";
  return (
    <Link to={to} className={`flex items-center justify-between gap-4 rounded-[1.5rem] border p-5 transition-all hover:scale-[1.02] active:scale-95 ${colorCls}`}>
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
          <Icon size={24} />
        </div>
        <div>
          <div className="font-display text-xl">{count} {label}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">Awaiting your review</div>
        </div>
      </div>
      <ChevronRight size={20} />
    </Link>
  );
}
