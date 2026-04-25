import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowDownToLine, ArrowUpToLine, Repeat, TrendingUp, Sparkles, ShieldCheck, Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { mockService, getProfitWithdrawn, getReferralBonus } from "@/lib/mock-service";
import { motion } from "framer-motion";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

type Inv = {
  id: string;
  amount: number;
  daily_roi_pct: number;
  duration_days: number;
  started_at: string;
  ends_at: string;
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

// Animated Number Component
function AnimatedNumber({ value, isCurrency = false }: { value: number; isCurrency?: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 1000;
    const startValue = 0;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(startValue + (value - startValue) * easeProgress);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(step);
  }, [value]);

  return <>{isCurrency ? formatCurrency(displayValue) : displayValue.toFixed(0)}</>;
}

function DashboardHome() {
  const { profile, user, refreshProfile } = useAuth();
  const [investments, setInvestments] = useState<Inv[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const data = mockService.getInvestments();
      setInvestments(data || []);
      setLoading(false);
    };
    load();
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [user]);

  const profitWithdrawn = getProfitWithdrawn();
  const referralBonus = getReferralBonus();

  const totalSubscription = investments.reduce((sum, i) => {
    if (i.status === "completed" || i.status === "pending") return sum;
    return sum + i.amount;
  }, 0);

  const dailyProfitExpected = investments.reduce((sum, i) => {
    if (i.status === "completed" || i.status === "pending") return sum;
    return sum + (i.amount * (i.daily_roi_pct / 100));
  }, 0);

  const totalProfit = investments.reduce((sum, i) => {
    if (i.status === "pending") return sum;
    const start = new Date(i.started_at).getTime();
    const elapsedDays = Math.max(0, Math.floor((Date.now() - start) / 86400000));
    return sum + (i.amount * (i.daily_roi_pct / 100) * elapsedDays);
  }, 0) - profitWithdrawn;

  const totalFund = totalSubscription + Math.max(0, totalProfit) + referralBonus;

  return (

    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
      <motion.div variants={fadeUp} className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Welcome back</p>
          <h1 className="mt-1 font-display text-3xl lg:text-4xl">{profile?.full_name || "Investor"}</h1>
          <div className="mt-1 text-xs text-muted-foreground">
            {profile?.country} · {profile?.email}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-3 py-1.5 text-xs text-success shadow-[0_0_15px_-3px_oklch(0.72_0.17_150/20%)]">
          <ShieldCheck size={13} className="animate-pulse" /> Account verified
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-emerald p-1 shadow-emerald transition-shadow duration-500 hover:shadow-[0_30px_80px_-20px_oklch(0.48_0.14_165/60%)]">
        <div className="rounded-[calc(1.5rem-4px)] glass p-7">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                <Sparkles size={12} className="text-primary" /> Total Fund
              </div>
              <div className="mt-2 font-display text-4xl text-gradient-gold lg:text-5xl">
                {formatCurrency(totalFund)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                Total Subscription
              </div>
              <div className="mt-2 font-display text-2xl lg:text-3xl text-foreground">
                {formatCurrency(totalSubscription)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                Total Profit
              </div>
              <div className="mt-2 font-display text-2xl lg:text-3xl text-success">
                +{formatCurrency(Math.max(0, totalProfit))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                Daily Profit
              </div>
              <div className="mt-2 font-display text-2xl lg:text-3xl text-success">
                +{formatCurrency(dailyProfitExpected)}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.section variants={fadeUp} className="glass rounded-3xl p-4 overflow-hidden">
        <div className="mb-4 flex justify-between items-end px-2">
          <div>
            <h2 className="font-display text-2xl">Market Overview</h2>
            <p className="text-sm text-muted-foreground">Live crypto charts and analysis.</p>
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

      <motion.section variants={fadeUp}>
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl">Active investments</h2>
            <p className="text-sm text-muted-foreground">Your money working across markets.</p>
          </div>
          <Link to="/dashboard/invest" className="text-sm font-semibold text-primary hover:underline transition-all">
            New investment →
          </Link>
        </div>

        {loading ? (
          <div className="mt-5 grid place-items-center py-10"><Loader2 className="animate-spin text-primary" /></div>
        ) : investments.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 glass rounded-3xl p-10 text-center text-sm text-muted-foreground">
            No subscriptions yet. <Link to="/dashboard/invest" className="text-primary hover:underline">Start investing</Link>
          </motion.div>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {investments.map((inv) => {
              const start = new Date(inv.started_at).getTime();
              let elapsedDays = 0;
              let countdown = "";
              let earned = 0;
              
              if (inv.status !== "pending") {
                const totalElapsedMs = now - start;
                elapsedDays = Math.max(0, Math.floor(totalElapsedMs / 86400000));
                earned = inv.amount * (inv.daily_roi_pct / 100) * elapsedDays;

                const msToNext = 86400000 - (totalElapsedMs % 86400000);
                const hrs = Math.floor(msToNext / 3600000).toString().padStart(2, "0");
                const mins = Math.floor((msToNext % 3600000) / 60000).toString().padStart(2, "0");
                const secs = Math.floor((msToNext % 60000) / 1000).toString().padStart(2, "0");
                countdown = `${hrs}:${mins}:${secs}`;
              }

              return (
                <motion.div 
                  key={inv.id} 
                  whileHover={{ scale: 1.02, y: -4 }}
                  className={`glass rounded-3xl p-6 transition-all ${inv.status === "active" ? "shadow-flash-emerald border-emerald/30" : "hover:shadow-card hover:border-primary/30"}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">{inv.plans?.name || "Plan"}</div>
                      <div className="mt-1 font-display text-2xl text-gradient-gold">{formatCurrency(inv.amount)}</div>
                    </div>
                    {inv.status === "pending" ? (
                      <div className="rounded-full bg-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pending</div>
                    ) : inv.status === "capital_withdrawal_requested" ? (
                      <div className="rounded-full bg-warning/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-warning">Withdrawal Requested</div>
                    ) : (
                      <div className="rounded-full bg-success/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-success">Active</div>
                    )}
                  </div>

                  {inv.status !== "pending" && (
                    <div className="mt-6">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Generated Profit</span>
                        <span className="font-mono font-semibold text-success">+{formatCurrency(earned)}</span>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-border/50 bg-background/40 p-3">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Next Profit Drop</div>
                          <div className="mt-1 font-mono text-sm font-semibold">{countdown}</div>
                        </div>
                        <div className="rounded-xl border border-border/50 bg-background/40 p-3">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</div>
                          <div className="mt-1 text-sm font-semibold text-success">Running ({elapsedDays}d)</div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}
