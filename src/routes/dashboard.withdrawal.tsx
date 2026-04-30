import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Info, 
  Clock, 
  ArrowDownLeft, 
  ChevronDown, 
  Loader2, 
  Wallet,
  TrendingUp,
  ShieldCheck,
  History,
  CheckCircle2
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/withdrawal")({
  component: WithdrawalPage,
});

const ASSETS = [
  { id: "btc", name: "BTC", icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png" },
  { id: "eth", name: "ETH", icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
  { id: "usdt", name: "USDT", icon: "https://cryptologos.cc/logos/tether-usdt-logo.png" },
  { id: "usdc", name: "USDC", icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png" },
];

const NETWORKS = ["TRC20", "ERC20", "BEP20"];

type Withdrawal = {
  id: string;
  amount: number;
  token: string;
  network: string;
  status: string;
  created_at: string;
};

function WithdrawalPage() {
  const { profile, user, refreshProfile } = useAuth();
  const [selectedAsset, setSelectedAsset] = useState("usdt");
  const [network, setNetwork] = useState("TRC20");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState<any[]>([]);
  const [withdrawableProfit, setWithdrawableProfit] = useState(0);
  const [lockedProfit, setLockedProfit] = useState(0);

  const fetchHistory = async () => {
    if (!user) return;
    const { data: wdData } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setHistory(wdData || []);

    const { data: invData } = await supabase
      .from("investments")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active");
    
    setInvestments(invData || []);
    
    let wp = 0;
    let lp = 0;
    const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    
    (invData || []).forEach(inv => {
      const started = new Date(inv.started_at);
      if (started <= fifteenDaysAgo) {
        wp += Number(inv.total_earnings || 0);
      } else {
        lp += Number(inv.total_earnings || 0);
      }
    });
    
    setWithdrawableProfit(wp);
    setLockedProfit(lp);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const available = (profile?.referral_earnings || 0) + withdrawableProfit;
    if (Number(amount) > available) return toast.error("Insufficient withdrawable balance");
    
    setSubmitting(true);
    try {
      const { error } = await supabase.rpc("request_withdrawal", {
        _amount: Number(amount),
        _token: ASSETS.find(a => a.id === selectedAsset)?.name || selectedAsset,
        _network: network,
        _address: address
      });

      if (error) throw error;
      
      toast.success("Withdrawal request submitted successfully!");
      setAmount("");
      setAddress("");
      fetchHistory();
      refreshProfile();
    } catch (err: any) {
      toast.error(err.message || "Withdrawal failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto px-1">
      {/* --- HEADER --- */}
      <header className="py-2">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Withdrawal</h1>
        <p className="text-xs text-muted-foreground mt-1">Reliable and swift payouts</p>
      </header>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-4 border-white/5 bg-[#0d0d0d]/60">
          <div className="text-[8px] font-black uppercase tracking-wider text-primary mb-2 flex items-center gap-1">
            <TrendingUp size={8} /> Available
          </div>
          <div className="font-display text-lg font-bold text-white">{formatCurrency((profile?.referral_earnings || 0) + withdrawableProfit)}</div>
          <div className="text-[8px] text-muted-foreground mt-1">Ready to withdraw</div>
        </div>

        <div className="glass rounded-2xl p-4 border-white/5 bg-[#0d0d0d]/60">
          <div className="text-[8px] font-black uppercase tracking-wider text-warning mb-2 flex items-center gap-1">
            <Clock size={8} /> Locked
          </div>
          <div className="font-display text-lg font-bold text-white">{formatCurrency(lockedProfit)}</div>
          <div className="text-[8px] text-muted-foreground mt-1">ROI &lt; 15 days</div>
        </div>

        <div className="glass rounded-2xl p-4 border-white/5 bg-[#0d0d0d]/60">
          <div className="text-[8px] font-black uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
            <ShieldCheck size={8} /> Capital
          </div>
          <div className="font-display text-lg font-bold text-white">{formatCurrency(profile?.total_invested || 0)}</div>
          <div className="text-[8px] text-muted-foreground mt-1">30 days lock</div>
        </div>
      </div>

      {/* --- WITHDRAWAL FORM --- */}
      <section className="glass rounded-[2rem] p-6 lg:p-10 border-white/5 bg-[#0d0d0d]/60">
        <form onSubmit={handleWithdraw} className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white">1. Asset</h2>
            <div className="grid grid-cols-2 gap-3">
              {ASSETS.map(asset => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => setSelectedAsset(asset.id)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-5 transition-all ${
                    selectedAsset === asset.id 
                      ? "border-primary/40 bg-primary/5 ring-1 ring-primary/10 shadow-gold/5" 
                      : "border-white/5 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-white/5 p-2">
                    <img src={asset.icon} alt={asset.name} className={`h-full w-full object-contain ${selectedAsset === asset.id ? 'grayscale-0' : 'grayscale opacity-50'}`} />
                  </div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">{asset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white">2. Network</h2>
              <div className="relative">
                <select 
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-sm font-bold text-white outline-none focus:border-primary/40 transition-all"
                >
                  {NETWORKS.map(n => <option key={n} value={n} className="bg-black">{n}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white">3. Amount ($)</h2>
              <input 
                type="number" 
                placeholder="Min $10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-sm font-bold text-white outline-none focus:border-primary/40 placeholder:text-muted-foreground/30 transition-all"
              />
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white">4. Wallet Address</h2>
              <input 
                type="text" 
                placeholder="Paste address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-sm font-bold text-white outline-none focus:border-primary/40 placeholder:text-muted-foreground/30 transition-all"
              />
            </div>
          </div>

          <button 
            disabled={submitting}
            type="submit"
            className="w-full rounded-2xl bg-primary py-5 text-sm font-black text-primary-foreground uppercase tracking-[0.2em] shadow-gold transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Submit Withdrawal"}
          </button>
        </form>
      </section>

      {/* --- POLICY SECTION --- */}
      <section className="glass rounded-[2rem] p-6 border-white/5 bg-[#0d0d0d]/60">
        <div className="flex items-center gap-2 mb-6 text-primary">
          <Info size={18} />
          <h2 className="text-lg font-display font-bold text-white">Policy</h2>
        </div>
        <div className="space-y-4">
          {[
            { label: "Withdraw ROI", value: "After 15 Days" },
            { label: "Referrals", value: "Withdraw Anytime" },
            { label: "Capital", value: "30 Days Lock" },
            { label: "Fee", value: "2% flat" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="text-[10px] font-bold text-muted-foreground/60">{item.label}: <span className="text-white ml-1">{item.value}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* --- ACTIVITY SECTION --- */}
      <section className="glass rounded-[2rem] p-6 border-white/5 bg-[#0d0d0d]/60">
        <div className="flex items-center gap-2 mb-6 text-primary">
          <History size={18} />
          <h2 className="text-lg font-display font-bold text-white">Activity</h2>
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className="grid place-items-center py-10"><Loader2 className="animate-spin text-primary" /></div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground">No withdrawal activity yet.</div>
          ) : (
            history.map(wd => (
              <div key={wd.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <ArrowDownLeft size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{wd.token}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{wd.network}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-white">{formatCurrency(wd.amount)}</div>
                  <div className={`text-[9px] font-black uppercase mt-1 ${
                    wd.status === 'approved' ? 'text-success' : 
                    wd.status === 'rejected' ? 'text-destructive' : 
                    'text-primary'
                  }`}>{wd.status}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
