import { useState, useEffect } from "react";
import { X, CheckCircle2, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { mockService, getProfitWithdrawn, getReferralBonus } from "@/lib/mock-service";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type BalanceType = "profit" | "referral" | "capital";

const COINS = [
  { id: "usdt-trc20", name: "USDT", network: "TRC-20" },
  { id: "usdt-evm", name: "USDT", network: "EVM (ERC20/BEP20)" },
  { id: "usdc-evm", name: "USDC", network: "EVM (ERC20/BEP20)" },
];

export function WithdrawModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<BalanceType | null>(null);
  const [amount, setAmount] = useState("");
  const [coinId, setCoinId] = useState("usdt-trc20");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const invs = mockService.getInvestments();
  const profitWithdrawn = getProfitWithdrawn();
  const referralBonus = getReferralBonus();

  const totalSubscription = invs.reduce((sum, i) => (i.status === "completed" || i.status === "pending" ? sum : sum + i.amount), 0);
  
  const withdrawableProfit = invs.reduce((sum, i) => {
    if (i.status === "pending") return sum;
    const start = new Date(i.started_at).getTime();
    const elapsedDays = Math.max(0, Math.floor((Date.now() - start) / 86400000));
    // 15-day rule: only count profit if investment is > 15 days old
    if (elapsedDays < 15) return sum;
    return sum + (i.amount * (i.daily_roi_pct / 100) * elapsedDays);
  }, 0) - profitWithdrawn;

  const totalProfitRaw = invs.reduce((sum, i) => {
    if (i.status === "pending") return sum;
    const start = new Date(i.started_at).getTime();
    const elapsedDays = Math.max(0, Math.floor((Date.now() - start) / 86400000));
    return sum + (i.amount * (i.daily_roi_pct / 100) * elapsedDays);
  }, 0) - profitWithdrawn;

  const balances = {
    profit: { max: Math.max(0, withdrawableProfit), total: Math.max(0, totalProfitRaw), label: "Profit Balance", desc: "Available after 15 days" },
    referral: { max: referralBonus, total: referralBonus, label: "Referral Bonus", desc: "Available anytime" },
    capital: { max: totalSubscription, total: totalSubscription, label: "Capital Balance", desc: "30-day processing time" },
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return;
    const val = Number(amount);
    if (val <= 0 || val > balances[type].max) {
      toast.error("Invalid amount or insufficient balance.");
      return;
    }

    const c = COINS.find(x => x.id === coinId)!;
    setLoading(true);
    try {
      if (type === "profit") {
        await mockService.requestProfitWithdrawal(val, c.name, c.network, address);
      } else if (type === "referral") {
        await mockService.requestReferralWithdrawal(val, c.name, c.network, address);
      } else if (type === "capital") {
        await mockService.requestCapitalWithdrawal(val, c.name, c.network, address);
      }
      setDone(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-background/80 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-border/80 bg-card p-6 shadow-2xl relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {type && !done && (
              <button onClick={() => setType(null)} className="rounded-full p-1.5 hover:bg-background/80">
                <ArrowLeft size={18} />
              </button>
            )}
            <h3 className="font-display text-2xl">Withdrawal</h3>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-background/80"><X size={18} /></button>
        </div>

        <AnimatePresence mode="wait">
          {!type ? (
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 space-y-3">
              {(Object.keys(balances) as BalanceType[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setType(k)}
                  className="flex w-full items-center justify-between rounded-2xl border border-border/60 bg-background/40 p-5 text-left transition-all hover:border-primary/50 hover:bg-background/80 hover:shadow-card"
                >
                  <div>
                    <div className="font-semibold">{balances[k].label}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{balances[k].desc}</div>
                    {k === "profit" && balances[k].max < balances[k].total && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-warning">
                        <AlertCircle size={10} /> {formatCurrency(balances[k].total - balances[k].max)} locked ({"<"} 15 days)
                      </div>
                    )}
                  </div>
                  <div className="font-display text-xl text-gradient-gold">
                    {formatCurrency(balances[k].max)}
                  </div>
                </button>
              ))}
            </motion.div>
          ) : done ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success"><CheckCircle2 size={32} /></div>
              <h2 className="mt-5 font-display text-2xl">Withdrawal requested</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {type === "capital" 
                  ? "Capital withdrawal requested. Please note there is a 30-day processing period before funds are unlocked and sent." 
                  : "Your withdrawal has been queued and is pending admin approval."}
              </p>
              <button onClick={onClose} className="mt-6 w-full rounded-full bg-gradient-gold py-3 text-sm font-semibold text-primary-foreground shadow-gold">Done</button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mt-6 space-y-4">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{balances[type].label} Available</div>
                <div className="mt-1 font-display text-3xl text-gradient-gold">{formatCurrency(balances[type].max)}</div>
              </div>
              
              {type === "profit" && balances[type].total > balances[type].max && (
                <div className="rounded-xl border border-warning/20 bg-warning/10 p-3 text-xs text-warning/90">
                  <span className="font-semibold">Note:</span> {formatCurrency(balances[type].total - balances[type].max)} of your profit is currently locked. Profit can only be withdrawn 15 days after the subscription starts.
                </div>
              )}
              
              {type === "capital" && (
                <div className="rounded-xl border border-warning/20 bg-warning/10 p-3 text-xs text-warning/90">
                  <span className="font-semibold">Rule:</span> Capital withdrawals are processed strictly after 30 days of requesting.
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Amount</label>
                <input required type="number" step="0.01" min={1} max={balances[type].max} value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-lg font-display outline-none focus:border-primary" placeholder="0.00" />
              </div>

              <div>
                <label className="text-sm font-medium">Method</label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {COINS.map(c => (
                    <button key={c.id} type="button" onClick={() => setCoinId(c.id)} className={`rounded-xl border p-2 text-center text-xs transition-colors ${coinId === c.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-background/40 hover:bg-background/80"}`}>
                      <div className="font-semibold">{c.name}</div>
                      <div className="mt-0.5 text-[9px] text-muted-foreground">{c.network.split(' ')[0]}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Destination Address</label>
                <input required type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-background/60 px-4 py-3 font-mono text-sm outline-none focus:border-primary" placeholder="Wallet address..." />
              </div>

              <button disabled={loading || balances[type].max <= 0} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold py-3 text-sm font-semibold text-primary-foreground shadow-gold disabled:opacity-60">
                {loading && <Loader2 size={16} className="animate-spin" />}
                Confirm Request
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
