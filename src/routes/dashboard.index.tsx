import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowDownToLine, ArrowUpToLine, Repeat, TrendingUp, Sparkles, ShieldCheck, Loader2, Briefcase, Wallet, History, Users, Activity, Clock, Shield, AlertTriangle
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

type Inv = {
  id: string;
  amount: number;
  daily_roi_percent: number;
  started_at: string;
  status: string;
  plans: { name: string } | null;
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function DashboardHome() {
  const { profile, user } = useAuth();
  const [investments, setInvestments] = useState<Inv[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);
  const [todayProfit, setTodayProfit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("investments")
        .select("*, plans(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading investments:", error);
      } else {
        setInvestments((data as any[]) || []);
      }

      // Load pending deposits
      const { data: depData } = await supabase
        .from("deposits")
        .select("*, plans:plan_id(name)")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      setPendingDeposits(depData || []);

      // Load today's profit drops (last 24h)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: txData } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", user.id)
        .eq("type", "roi_reward")
        .gte("created_at", twentyFourHoursAgo);
      
      const sum = (txData || []).reduce((acc, tx) => acc + Number(tx.amount), 0);
      setTodayProfit(sum);

      setLoading(false);
    };
    load();
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [user]);

  const dailyProfitExpected = investments.reduce((sum, i) => {
    if (i.status !== "active") return sum;
    return sum + (i.amount * (i.daily_roi_pct / 100));
  }, 0);

  const totalFund = (profile?.total_invested || 0) + (profile?.profit_balance || 0);
  const activeCapital = profile?.total_invested || 0;
  const currentProfit = profile?.profit_balance || 0;
  const refLink = `${window.location.origin}/signup?ref=${profile?.username || user?.id || ""}`;

  return (

    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl flex items-center gap-2">Overview <span className="animate-bounce">👋</span></h1>
          <p className="text-xs text-success font-medium">Performance at {dailyProfitExpected > 0 && activeCapital > 0 ? (dailyProfitExpected / activeCapital * 100).toFixed(1) : "0"}% Daily ROI</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Active Capital", value: activeCapital, icon: Briefcase, color: "text-primary" },
          { label: "Daily ROI Drop", value: todayProfit, icon: Sparkles, color: "text-amber-500" },
          { label: "Profit Earned", value: profile?.total_profit || 0, icon: TrendingUp, color: "text-success" },
          { label: "Wallet Balance", value: totalFund, icon: Wallet, color: "text-primary" },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            variants={fadeUp} 
            className="glass group relative overflow-hidden rounded-[2rem] p-5 border-white/5 bg-white/[0.02] shadow-xl transition-all hover:border-primary/20"
          >
            <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 ${stat.color}`}>
              <stat.icon size={18} />
            </div>
            <div className="font-display text-xl lg:text-2xl">
              {typeof stat.value === "number" ? formatCurrency(stat.value) : stat.value}
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground/80">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* --- PENDING SUBSCRIPTIONS --- */}
      {pendingDeposits.length > 0 && (
        <motion.section variants={fadeUp}>
          <div className="mb-4 flex items-center gap-2 px-1">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-warning/10 text-warning"><Activity size={16} /></div>
            <h2 className="font-display text-xl text-warning">Pending Subscriptions</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {pendingDeposits.map((dep) => (
              <div key={dep.id} className="glass rounded-3xl p-6 border-warning/20 bg-warning/5 relative overflow-hidden group">
                <div className="absolute top-3 right-3 animate-pulse bg-warning/20 text-warning text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-warning/30">
                  Awaiting Review
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm pb-3 border-b border-white/5">
                    <span className="text-muted-foreground">Requested Plan</span>
                    <span className="font-semibold text-warning">{dep.plans?.name || "New Subscription"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pb-3 border-b border-white/5">
                    <span className="text-muted-foreground">Deposit Amount</span>
                    <span className="font-semibold">{formatCurrency(dep.amount)}</span>
                  </div>
                  <div className="text-[9px] text-muted-foreground/60 italic text-center">
                    Your payment proof is being verified by the security team.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      <motion.section variants={fadeUp}>
        <div className="mb-4 flex items-center gap-2 px-1">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary"><Briefcase size={16} /></div>
          <h2 className="font-display text-xl">Active Portfolio</h2>
        </div>

        {loading ? (
          <div className="grid place-items-center py-10"><Loader2 className="animate-spin text-primary" /></div>
        ) : investments.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-3xl p-10 text-center text-sm text-muted-foreground">
            No subscriptions yet. <Link to="/dashboard/invest" className="text-primary hover:underline">Start investing</Link>
          </motion.div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {investments.map((inv) => {
              const start = new Date(inv.started_at).getTime();
              const lastReward = new Date(inv.last_reward_at || inv.started_at).getTime();
              const nextRewardTime = lastReward + (24 * 60 * 60 * 1000);
              const rewardRemaining = Math.max(0, nextRewardTime - now);
              const withdrawalTime = start + (15 * 24 * 60 * 60 * 1000);
              const withdrawalRemaining = Math.max(0, withdrawalTime - now);
              
              // Capital Withdrawal Logic (30 days)
              const capReqTime = inv.withdrawal_requested_at ? new Date(inv.withdrawal_requested_at).getTime() : 0;
              const capPayoutTime = capReqTime + (30 * 24 * 60 * 60 * 1000);
              const capRemaining = Math.max(0, capPayoutTime - now);
              const capDays = Math.floor(capRemaining / 86400000);

              const rH = Math.floor(rewardRemaining / 3600000);
              const rM = Math.floor((rewardRemaining % 3600000) / 60000);
              const wD = Math.floor(withdrawalRemaining / 86400000);

              const handleTerminate = async () => {
                if (!confirm("Are you sure? This will stop daily profits and start the 30-day capital withdrawal countdown.")) return;
                try {
                  const { error } = await supabase.rpc("request_capital_withdrawal", { _investment_id: inv.id });
                  if (error) throw error;
                  toast.success("Termination requested! 30-day countdown started.");
                  window.location.reload();
                } catch (err: any) {
                  toast.error(err.message);
                }
              };

              return (
                <motion.div 
                  key={inv.id} 
                  whileHover={{ scale: 1.01 }}
                  className={`glass rounded-[2rem] p-6 border-white/5 relative overflow-hidden ${inv.status === 'terminating' ? 'bg-warning/5 border-warning/20' : 'bg-primary/[0.02] border-primary/20'}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-display text-lg leading-none">{inv.plans?.name || "Portfolio"}</h3>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-bold">ROI: {inv.daily_roi_percent}% Daily</p>
                    </div>
                    <div className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-widest border ${
                      inv.status === 'active' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-warning/10 text-warning border-warning/20'
                    }`}>
                      {inv.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {inv.status === 'active' ? (
                      <>
                        <div className="space-y-1">
                          <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                            <Clock size={8} /> Profit Drop
                          </div>
                          <div className="font-display text-lg leading-none">
                            {rewardRemaining > 0 ? `${rH}h ${rM}m` : <span className="text-primary animate-pulse">Dropping...</span>}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1 justify-end">
                            <Shield size={8} /> ROI Unlock
                          </div>
                          <div className="font-display text-lg leading-none">
                            {withdrawalRemaining > 0 ? `${wD} Days` : <span className="text-success">Ready</span>}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-2 space-y-1 text-center py-2 bg-warning/10 rounded-xl border border-warning/10">
                        <div className="text-[8px] font-bold uppercase tracking-widest text-warning">Capital Payout Countdown</div>
                        <div className="font-display text-xl text-warning">
                          {capRemaining > 0 ? `${capDays} Days Left` : <span className="text-success animate-pulse font-black">PAYOUT READY</span>}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted-foreground uppercase tracking-wider font-bold">Capital</span>
                      <span className="font-display text-primary">{formatCurrency(inv.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted-foreground uppercase tracking-wider font-bold">Profit Earned</span>
                      <span className="font-display text-success">+{formatCurrency((inv as any).total_earnings || 0)}</span>
                    </div>
                  </div>

                  {inv.status === 'active' && (
                    <button 
                      onClick={handleTerminate}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                    >
                      <AlertTriangle size={12} /> Terminate & Withdraw Capital
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.section>

      <motion.section variants={fadeUp} className="glass rounded-3xl p-6 bg-primary/[0.03] border-primary/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Users size={24} />
            </div>
            <div>
              <h2 className="font-display text-xl">Affiliate Program</h2>
              <p className="text-xs text-muted-foreground">Share your link and earn commissions instantly.</p>
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input 
                readOnly 
                value={refLink}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs font-mono outline-none"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(refLink);
                  toast.success("Referral link copied!");
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground shadow-gold"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={fadeUp} className="glass rounded-3xl p-6">
        <div className="mb-6 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary"><History size={16} /></div>
            <h2 className="font-display text-xl">Recent Activity</h2>
          </div>
          <Link to="/dashboard/history" className="text-xs font-semibold text-primary hover:underline">View All</Link>
        </div>

        <div className="space-y-5">
          <ActivityList userId={user?.id} />
        </div>
      </motion.section>

      <motion.section variants={fadeUp} className="glass rounded-3xl p-4 overflow-hidden">
        <div className="mb-4 flex justify-between items-end px-2">
          <div>
            <h2 className="font-display text-xl">Market Overview</h2>
            <p className="text-xs text-muted-foreground">Live crypto charts and analysis.</p>
          </div>
        </div>
        <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-border/50">
          <iframe 
            src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_123&symbol=BINANCE%3ABTCUSDT&interval=D&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en"
            width="100%" 
            height="100%" 
            frameBorder="0" 
            allowTransparency={true} 
            scrolling="no"
          ></iframe>
        </div>
      </motion.section>
    </motion.div>
  );
}

function ActivityList({ userId }: { userId?: string }) {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
      setList(data || []);
      setLoading(false);
    };
    load();
  }, [userId]);

  if (loading) return <div className="py-5 text-center"><Loader2 className="animate-spin text-primary inline" /></div>;
  if (list.length === 0) return <div className="py-5 text-center text-xs text-muted-foreground">No recent activity.</div>;

  return (
    <div className="space-y-5">
      {list.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
              <TrendingUp size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold capitalize">{tx.description || tx.type}</div>
              <div className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</div>
            </div>
          </div>
          <div className={`font-mono text-sm font-bold ${tx.amount < 0 ? 'text-destructive' : 'text-primary'}`}>
            {tx.amount < 0 ? '' : '+'}{formatCurrency(tx.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}

