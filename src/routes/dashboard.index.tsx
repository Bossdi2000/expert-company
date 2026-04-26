import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowDownToLine, ArrowUpToLine, Repeat, TrendingUp, Sparkles, ShieldCheck, Loader2, Briefcase, Wallet, History, Users, Activity,
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
      setLoading(false);
    };
    load();
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [user]);

  const dailyProfitExpected = investments.reduce((sum, i) => {
    if (i.status !== "active") return sum;
    return sum + (i.amount * (i.daily_roi_percent / 100));
  }, 0);

  const totalFund = (profile?.balance || 0) + (profile?.profit_balance || 0);
  const activeCapital = profile?.total_invested || 0;
  const currentProfit = profile?.profit_balance || 0;

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
          { label: "Capital Investment", value: activeCapital, icon: Briefcase, color: "text-primary" },
          { label: "Profit Balance", value: currentProfit, icon: TrendingUp, color: "text-primary" },
          { label: "Total Wallet", value: totalFund, icon: Wallet, color: "text-primary" },
          { label: "Account Status", value: activeCapital > 0 ? "Active" : "Standard", icon: Activity, color: "text-primary" },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            variants={fadeUp} 
            className="glass group relative overflow-hidden rounded-[2rem] p-5 border-primary/20 shadow-gold/10 transition-all hover:border-primary/40"
          >
            <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 ${stat.color}`}>
              <stat.icon size={18} />
            </div>
            <div className="font-display text-xl lg:text-2xl">
              {typeof stat.value === "number" ? formatCurrency(stat.value) : stat.value}
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground/80">{stat.label}</div>
          </motion.div>
        ))}
      </div>

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
              return (
                <motion.div 
                  key={inv.id} 
                  whileHover={{ scale: 1.01 }}
                  className="glass rounded-3xl p-6 shadow-gold/5 border-primary/20"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm pb-3 border-b border-white/5">
                      <span className="text-muted-foreground">Active Plan</span>
                      <span className="font-semibold">{inv.plans?.name || "Plan"}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pb-3 border-b border-white/5">
                      <span className="text-muted-foreground">Daily ROI</span>
                      <span className="font-semibold text-primary">{inv.daily_roi_percent}%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pb-3 border-b border-white/5">
                      <span className="text-muted-foreground">Portfolio Value</span>
                      <span className="font-semibold">{formatCurrency(inv.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className={`font-semibold capitalize ${inv.status === 'active' ? 'text-primary' : 'text-warning'}`}>{inv.status}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
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

