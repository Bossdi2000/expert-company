import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, X, CheckCircle2, Loader2, Upload, Clock, ChevronRight, ArrowLeft, Plus, Shield, TrendingUp, Briefcase } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/invest")({
  head: () => ({ meta: [{ title: "New Subscription — Gold Empire" }] }),
  component: InvestPage,
});

type Plan = {
  id: string;
  name: string;
  tier: string;
  min_amount: number;
  max_amount: number;
  daily_roi_pct: number;
  duration_days: number;
};

type Inv = {
  id: string;
  amount: number;
  daily_roi_percent: number;
  status: string;
  started_at: string;
  plans: { name: string } | null;
};

const COINS = [
  { id: "usdt-trc20", name: "USDT", network: "TRC-20" },
  { id: "usdt-evm", name: "USDT", network: "EVM (ERC20/BEP20)" },
  { id: "usdc-evm", name: "USDC", network: "EVM (ERC20/BEP20)" },
  { id: "balance", name: "Account Balance", network: "Internal Reinvestment" },
];

function InvestPage() {
  const { profile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<"list" | "create">("list");
  const [step, setStep] = useState<"plan" | "coin" | "amount" | "payment" | "success">("plan");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [pickedPlan, setPickedPlan] = useState<Plan | null>(null);
  const [pickedCoin, setPickedCoin] = useState<typeof COINS[0] | null>(null);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [investments, setInvestments] = useState<Inv[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  // Payment timer
  const [timeLeft, setTimeLeft] = useState(1200); // 20 mins
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [assignedWallet, setAssignedWallet] = useState<string | null>(null);
  
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      
      // Load investments
      const { data: invData } = await supabase
        .from("investments")
        .select("*, plans(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setInvestments((invData as any[]) || []);

      // Load plans
      const { data: planData } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      setPlans(planData || []);

      setLoading(false);
    };
    load();
    const t = setInterval(() => {
      setNow(Date.now());
      if (step === "payment") setTimeLeft(l => Math.max(0, l - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [user, step]);

  useEffect(() => {
    if (step === "payment" && pickedCoin?.id !== "balance") {
      const fetchWallet = async () => {
        const { data } = await supabase
          .from("admin_wallets")
          .select("address")
          .eq("token", pickedCoin!.name)
          .eq("is_active", true);
        
        if (data && data.length > 0) {
          const random = data[Math.floor(Math.random() * data.length)];
          setAssignedWallet(random.address);
        } else {
          setAssignedWallet("No wallet available. Contact support.");
        }
      };
      fetchWallet();
    }
  }, [step, pickedCoin]);

  const proceedToAmount = (coin: typeof COINS[0]) => {
    setPickedCoin(coin);
    setStep("amount");
  };

  const proceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickedPlan || !amount) return;
    if (Number(amount) < pickedPlan.min_amount || Number(amount) > pickedPlan.max_amount) {
      toast.error(`Amount must be between ${formatCurrency(pickedPlan.min_amount)} and ${formatCurrency(pickedPlan.max_amount)}`);
      return;
    }
    if (pickedCoin?.id === "balance" && Number(amount) > (profile?.balance || 0)) {
      toast.error("Insufficient account balance for reinvestment.");
      return;
    }
    setStep("payment");
  };

  const confirmPayment = async () => {
    if (!user || !pickedPlan) return;
    
    if (pickedCoin?.id !== "balance" && !proofFile) {
      toast.error("Please upload proof of payment.");
      return;
    }

    setSubmitting(true);
    try {
      if (pickedCoin?.id === "balance") {
        // Internal Reinvestment via RPC
        const { error } = await supabase.rpc("create_investment", {
          _plan_id: pickedPlan.id,
          _amount: Number(amount)
        });
        if (error) throw error;
        await refreshProfile();
      } else {
        // External Deposit
        const { error } = await supabase.from("deposits").insert({
          user_id: user.id,
          amount: Number(amount),
          token: pickedCoin!.name,
          network: pickedCoin!.network,
          wallet_address: assignedWallet,
          status: "pending"
        });
        if (error) throw error;
      }
      setStep("success");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div>
              <h1 className="font-display text-4xl">Investments</h1>
              <p className="mt-1 text-sm text-muted-foreground">Track your active growth portfolios</p>
            </div>

            <button 
              onClick={() => { setView("create"); setStep("plan"); }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-gold py-4 text-sm font-bold text-primary-foreground shadow-gold transition-transform hover:scale-[1.01]"
            >
              <Plus size={20} strokeWidth={3} /> New Plan
            </button>

            <div className="grid gap-6">
              {loading ? (
                <div className="grid place-items-center py-20"><Loader2 className="animate-spin text-primary" /></div>
              ) : investments.length === 0 ? (
                <div className="glass rounded-3xl p-10 text-center text-sm text-muted-foreground">No active portfolios. Click above to start.</div>
              ) : (
                investments.map(inv => {
                  const start = new Date(inv.started_at).getTime();
                  const totalElapsedMs = now - start;
                  
                  const msToNext = 86400000 - (totalElapsedMs % 86400000);
                  const h = String(Math.floor(msToNext / 3600000)).padStart(2, "0");
                  const m = String(Math.floor((msToNext % 3600000) / 60000)).padStart(2, "0");
                  const s = String(Math.floor((msToNext % 60000) / 1000)).padStart(2, "0");

                  return (
                    <motion.div key={inv.id} className="glass group relative overflow-hidden rounded-[2rem] p-6 border-primary/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-xl">{inv.plans?.name || "Plan"}</h3>
                          <Shield size={16} className="text-primary" />
                        </div>
                        <div className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">{inv.status}</div>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">Capital: {formatCurrency(inv.amount)}</div>

                      <div className="mt-8 flex items-end justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Profit Rate</div>
                          <div className="mt-1 flex items-center gap-2 font-display text-3xl text-gradient-gold">
                            <TrendingUp size={20} /> {inv.daily_roi_percent}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Next Drop</div>
                          <div className="mt-1 font-mono text-xl text-primary">{h}:{m}:{s}</div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between text-[10px] text-muted-foreground pt-4 border-t border-white/5">
                        <div>Started: {new Date(inv.started_at).toLocaleDateString()}</div>
                        <div className="flex items-center gap-1.5">
                          <Briefcase size={12} /> Active Portfolio
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="flex items-center gap-4">
              <button onClick={() => { if(step === "plan") setView("list"); else setStep("plan"); }} className="rounded-full p-2 hover:bg-background/50">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="font-display text-3xl lg:text-4xl">
                  {step === "plan" ? "New Subscription" : step === "coin" ? "Select Payment" : step === "amount" ? "Enter Amount" : step === "payment" ? "Make Payment" : "Requested"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {step === "plan" ? "Choose a tier to start compounding." : "Follow the steps to credit your account."}
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === "plan" && (
                <motion.div key="p" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {plans.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setPickedPlan(p); setStep("coin"); }}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-primary/40 hover:bg-white/[0.08]"
                    >
                      <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">{p.tier}</div>
                      <h3 className="mt-0.5 font-display text-lg text-primary">{p.name}</h3>
                      <div className="mt-2 font-display text-xl">{p.daily_roi_pct}%<span className="text-[10px] text-muted-foreground ml-1">Daily</span></div>
                      <div className="mt-2 text-[10px] text-muted-foreground/80">
                        {formatCurrency(p.min_amount)} — {formatCurrency(p.max_amount)}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}

              {step === "coin" && (
                <motion.div key="c" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="grid gap-2 sm:grid-cols-2 max-w-lg mx-auto">
                  {COINS.map(c => (
                    <button key={c.id} onClick={() => proceedToAmount(c)} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-primary/40 hover:bg-white/[0.08]">
                      <div className="text-left">
                        <div className="font-display text-base">{c.name}</div>
                        <div className="text-[10px] text-muted-foreground">{c.network}</div>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground" />
                    </button>
                  ))}
                </motion.div>
              )}

              {step === "amount" && (
                <motion.form key="a" onSubmit={proceedToPayment} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-md mx-auto space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <div className="rounded-xl bg-black/20 p-3 text-[11px] space-y-1.5 border border-white/5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Selected Plan</span>
                      <span className="font-semibold text-primary">{pickedPlan?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profit Rate</span>
                      <span className="text-primary font-medium">+{pickedPlan?.daily_roi_pct}% Daily</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Investment Range</span>
                      <span>{formatCurrency(pickedPlan?.min_amount || 0)} — {formatCurrency(pickedPlan?.max_amount || 0)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">Investment Amount (USD)</label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-display text-primary">$</span>
                      <input 
                        required 
                        type="number" 
                        min={pickedPlan?.min_amount} 
                        max={pickedPlan?.max_amount} 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        className="w-full rounded-xl border border-white/10 bg-black/20 pl-8 pr-4 py-3.5 text-xl font-display outline-none focus:border-primary/50" 
                      />
                    </div>
                  </div>

                  <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold py-3.5 text-sm font-bold text-primary-foreground transition-transform active:scale-95 shadow-gold">
                    Confirm & Proceed <ChevronRight size={16} />
                  </button>
                </motion.form>
              )}

              {step === "payment" && (
                <motion.div key="pay" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-md mx-auto space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  {pickedCoin?.id !== "balance" && (
                    <div className="flex items-center justify-between rounded-xl border border-warning/20 bg-warning/5 px-4 py-3">
                      <div className="flex items-center gap-2 text-warning">
                        <Clock size={16} /> 
                        <span className="text-[11px] font-bold uppercase tracking-wider">Awaiting Payment</span>
                      </div>
                      <div className="font-mono text-base font-bold text-warning">{mm}:{ss}</div>
                    </div>
                  )}

                  <div className="text-center py-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total to Send</p>
                    <p className="font-display text-4xl mt-1 text-gradient-gold">{formatCurrency(Number(amount))}</p>
                    <p className="text-[10px] text-muted-foreground mt-1.5 px-3 py-1 bg-white/5 rounded-full inline-block">
                      via {pickedCoin?.name} • {pickedCoin?.network}
                    </p>
                  </div>

                  {pickedCoin?.id !== "balance" ? (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Wallet Address</p>
                        <p className="break-all font-mono text-[11px] leading-relaxed text-primary bg-primary/5 p-2 rounded border border-primary/10 select-all">
                          {assignedWallet || "Fetching wallet..."}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 px-1">Proof of Payment</p>
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-black/20 py-8 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-black/40">
                          <Upload size={16} /> {proofFile ? proofFile.name : "Tap to upload screenshot"}
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-white/10 bg-primary/5 p-5 text-center">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Available Balance</p>
                      <p className="mt-1 font-display text-2xl text-primary">{formatCurrency(profile?.balance || 0)}</p>
                      <p className="mt-2 text-[10px] text-warning/80 italic">Amount will be deducted instantly from your site balance.</p>
                    </div>
                  )}

                  <button disabled={submitting || (pickedCoin?.id !== "balance" && !assignedWallet)} onClick={confirmPayment} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold py-3.5 text-sm font-bold text-primary-foreground transition-transform active:scale-95 disabled:opacity-50 shadow-gold">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} 
                    {pickedCoin?.id === "balance" ? "Confirm Reinvestment" : "Payment Sent"}
                  </button>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div key="s" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary shadow-lg shadow-primary/10">
                    <CheckCircle2 size={28} />
                  </div>
                  <h2 className="mt-5 font-display text-xl">Investment Received</h2>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Your request has been logged. The network typically takes <span className="text-primary">5-15 minutes</span> to verify. Your ROI will start immediately after confirmation.</p>
                  <button onClick={() => { setView("list"); setStep("plan"); }} className="mt-6 w-full rounded-xl bg-white/5 py-3 text-xs font-bold transition-colors hover:bg-white/10">
                    Return to Portfolio
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

