import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, X, CheckCircle2, Loader2, Upload, Clock, ChevronRight, ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { PLANS } from "@/lib/mock-data";
import { mockService } from "@/lib/mock-service";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/dashboard/invest")({
  head: () => ({ meta: [{ title: "New Subscription — Gold Empire" }] }),
  component: InvestPage,
});

type Step = "plan" | "coin" | "amount" | "payment" | "success";
type Plan = typeof PLANS[0];

const COINS = [
  { id: "usdt-trc20", name: "USDT", network: "TRC-20" },
  { id: "usdt-evm", name: "USDT", network: "EVM (ERC20/BEP20)" },
  { id: "usdc-evm", name: "USDC", network: "EVM (ERC20/BEP20)" },
  { id: "balance", name: "Account Balance", network: "Internal Reinvestment" },
];

import { useAuth } from "@/lib/auth";

function InvestPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("plan");
  const [pickedPlan, setPickedPlan] = useState<Plan | null>(null);
  const [pickedCoin, setPickedCoin] = useState<typeof COINS[0] | null>(null);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Payment timer
  const [timeLeft, setTimeLeft] = useState(1200); // 20 mins
  const [proofFile, setProofFile] = useState<File | null>(null);
  
  useEffect(() => {
    if (step === "payment") {
      const t = setInterval(() => setTimeLeft(l => Math.max(0, l - 1)), 1000);
      return () => clearInterval(t);
    }
  }, [step]);

  const proceedToAmount = (coin: typeof COINS[0]) => {
    setPickedCoin(coin);
    setStep("amount");
  };

  const proceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickedPlan || !amount) return;
    if (Number(amount) < pickedPlan.min || Number(amount) > pickedPlan.max) {
      toast.error(`Amount must be between ${formatCurrency(pickedPlan.min)} and ${formatCurrency(pickedPlan.max)}`);
      return;
    }
    if (pickedCoin?.id === "balance" && Number(amount) > (profile?.balance || 0)) {
      toast.error("Insufficient account balance for reinvestment.");
      return;
    }
    setStep("payment");
  };

  const confirmPayment = async () => {
    if (pickedCoin?.id !== "balance" && !proofFile) {
      toast.error("Please upload proof of payment.");
      return;
    }
    setSubmitting(true);
    try {
      await mockService.createInvestment(pickedPlan!.id, Number(amount), pickedCoin!.name, pickedCoin!.network);
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
      <div className="flex items-center gap-4">
        {step !== "plan" && step !== "success" && (
          <button onClick={() => setStep(step === "payment" ? "amount" : step === "amount" ? "coin" : "plan")} className="rounded-full p-2 hover:bg-background/50">
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="font-display text-3xl lg:text-4xl">
            {step === "plan" ? "New Subscription / Reinvest" : step === "coin" ? "Select Payment Method" : step === "amount" ? "Enter Amount" : step === "payment" ? "Make Payment" : "Subscription Pending"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {step === "plan" ? "Choose a tier to start compounding or reinvest." : step === "payment" ? "Send exact amount or confirm balance deduction." : step === "success" ? "Awaiting admin approval." : "Configure your subscription."}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "plan" && (
          <motion.div key="plan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => { setPickedPlan(p); setStep("coin"); }}
                className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-5 text-left backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/60 hover:shadow-gold"
              >
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{p.tier}</div>
                <h3 className="mt-1 font-display text-2xl text-gradient-gold">{p.name}</h3>
                <div className="mt-3 font-display text-3xl">{p.dailyRoi}%<span className="text-sm text-muted-foreground"> /day</span></div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {formatCurrency(p.min)} — {formatCurrency(p.max)}
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {step === "coin" && (
          <motion.div key="coin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid gap-3 sm:grid-cols-3 max-w-2xl">
            {COINS.map(c => (
              <button key={c.id} onClick={() => proceedToAmount(c)} className="rounded-2xl border border-border/60 bg-card p-5 text-left transition-all hover:-translate-y-1 hover:border-primary/50">
                <div className="font-display text-xl">{c.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{c.network}</div>
              </button>
            ))}
          </motion.div>
        )}

        {step === "amount" && (
          <motion.form key="amount" onSubmit={proceedToPayment} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-md space-y-5 rounded-3xl border border-border bg-card p-6">
            <div className="rounded-xl bg-background/40 p-3 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span className="font-semibold text-gradient-gold">{pickedPlan?.name}</span></div>
              <div className="mt-1 flex justify-between"><span className="text-muted-foreground">Daily ROI</span><span className="font-semibold text-success">+{pickedPlan?.dailyRoi}%</span></div>
              <div className="mt-1 flex justify-between"><span className="text-muted-foreground">Range</span><span>{formatCurrency(pickedPlan?.min || 0)} — {formatCurrency(pickedPlan?.max || 0)}</span></div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Amount in USD</label>
              <input required type="number" min={pickedPlan?.min} max={pickedPlan?.max} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`${pickedPlan?.min}`} className="mt-1.5 w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-lg font-display outline-none focus:border-primary" />
            </div>

            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold py-3 text-sm font-semibold text-primary-foreground shadow-gold">
              Proceed to payment <ChevronRight size={16} />
            </button>
          </motion.form>
        )}

        {step === "payment" && (
          <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-md space-y-5 rounded-3xl border border-border bg-card p-6">
            {pickedCoin?.id !== "balance" && (
              <div className="flex items-center justify-between rounded-xl border border-warning/30 bg-warning/10 p-4">
                <div className="flex items-center gap-2 text-warning"><Clock size={18} /> <span className="text-sm font-medium">Time remaining</span></div>
                <div className="font-mono text-xl font-bold text-warning">{mm}:{ss}</div>
              </div>
            )}

            <div className="space-y-1 text-center">
              <p className="text-sm text-muted-foreground">{pickedCoin?.id === "balance" ? "You are about to reinvest" : "Please send exactly"}</p>
              <p className="font-display text-4xl">{formatCurrency(Number(amount))}</p>
              <p className="text-xs text-muted-foreground">via {pickedCoin?.name} ({pickedCoin?.network})</p>
            </div>

            {pickedCoin?.id !== "balance" ? (
              <>
                <div className="rounded-xl border border-border bg-background/50 p-4">
                  <p className="text-xs text-muted-foreground">Deposit Address</p>
                  <p className="mt-1 break-all font-mono text-sm text-primary">TUpWAp8Fm6z1Q4h5zQy7d2R8bBvH9PzC3K</p>
                </div>

                <div>
                  <label className="text-sm font-medium">Upload Proof of Payment</label>
                  <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-background/30 py-6 text-sm text-muted-foreground hover:bg-background/60">
                    <Upload size={16} /> {proofFile ? proofFile.name : "Click to select screenshot"}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-border bg-background/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="mt-1 font-mono text-xl font-bold text-primary">{formatCurrency(profile?.balance || 0)}</p>
                <p className="mt-2 text-xs text-warning">This amount will be deducted from your available balance.</p>
              </div>
            )}

            <button disabled={submitting} onClick={confirmPayment} className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold py-3 text-sm font-semibold text-primary-foreground shadow-gold disabled:opacity-60">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} {pickedCoin?.id === "balance" ? "Confirm Reinvestment" : "I have made the payment"}
            </button>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md rounded-3xl border border-border bg-card p-8 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success"><CheckCircle2 size={32} /></div>
            <h2 className="mt-5 font-display text-2xl">Subscription Requested</h2>
            <p className="mt-2 text-sm text-muted-foreground">Your payment proof has been submitted. The subscription is currently <span className="font-semibold text-foreground">pending admin approval</span>. It will start generating ROI once verified.</p>
            <button onClick={() => navigate({ to: "/dashboard" })} className="mt-6 w-full rounded-full bg-background/50 py-3 text-sm font-semibold hover:bg-background/80">Return to Dashboard</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
