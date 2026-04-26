import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { 
  ArrowDownToLine, 
  ArrowUpToLine, 
  Coins, 
  Loader2, 
  TrendingUp, 
  Target, 
  Users, 
  History as HistoryIcon,
  Filter
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

const TABS = ["All", "Daily Drops", "Referrals", "Withdrawals", "Deposits"] as const;

export const Route = createFileRoute("/dashboard/history")({
  head: () => ({ meta: [{ title: "Earnings — Gold Empire" }] }),
  component: HistoryPage,
});

type Row = { 
  id: string; 
  type: string; 
  amount: number; 
  status: string; 
  description: string | null; 
  created_at: string 
};

function HistoryPage() {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<typeof TABS[number]>("All");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setRows(data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const filtered = rows.filter((t) => {
    if (tab === "All") return true;
    if (tab === "Daily Drops") return t.type === "roi";
    if (tab === "Referrals") return t.type === "referral";
    if (tab === "Withdrawals") return t.type === "withdrawal";
    if (tab === "Deposits") return t.type === "deposit";
    return true;
  });

  const ICONS: Record<string, any> = { 
    roi: TrendingUp, 
    referral: Users, 
    withdrawal: ArrowUpToLine,
    deposit: ArrowDownToLine,
    investment: Target,
    reinvest: Target
  };

  return (
    <div className="space-y-8 pb-24 max-w-6xl mx-auto px-1">
      {/* --- HEADER --- */}
      <header className="py-2">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Earnings</h1>
        <p className="text-xs text-muted-foreground mt-1">Track your profit and portfolio growth.</p>
      </header>

      {/* --- EARNINGS STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-[2rem] p-6 border-primary/20 bg-[#0a0a0a]/60 shadow-flash-gold">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-primary mb-4">
            <TrendingUp size={12} /> Profit Balance
          </div>
          <div className="font-display text-2xl font-bold text-white mb-1">{formatCurrency(profile?.balance || 0)}</div>
          <div className="text-[10px] text-success font-bold">Available for withdrawal</div>
        </div>

        <div className="glass rounded-[2rem] p-6 border-white/5 bg-[#0a0a0a]/60">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-primary mb-4">
            <Target size={12} /> Total Invested
          </div>
          <div className="font-display text-2xl font-bold text-white mb-1">{formatCurrency(profile?.total_invested || 0)}</div>
          <div className="text-[10px] text-muted-foreground/60 font-bold">Active working capital</div>
        </div>

        <div className="glass rounded-[2rem] p-6 border-white/5 bg-[#0a0a0a]/60">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-primary mb-4">
            <Users size={12} /> Referral Profit
          </div>
          <div className="font-display text-2xl font-bold text-white mb-1">{formatCurrency(profile?.referral_earnings || 0)}</div>
          <div className="text-[10px] text-muted-foreground/60 font-bold">{profile?.referral_count || 0} partners in network</div>
        </div>
      </div>

      {/* --- HISTORY SECTION --- */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary"><HistoryIcon size={16} /></div>
            <h2 className="font-display text-xl">History</h2>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar max-w-[200px] lg:max-w-none">
            {TABS.map((t) => (
              <button 
                key={t} 
                onClick={() => setTab(t)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[10px] font-bold transition-all ${
                  tab === t ? "bg-primary text-primary-foreground shadow-gold" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid place-items-center py-20"><Loader2 className="animate-spin text-primary" /></div>
        ) : (
          <div className="glass rounded-[2rem] overflow-hidden border-white/5 bg-[#0a0a0a]/60">
            <div className="divide-y divide-white/5">
              {filtered.map((t) => {
                const Icon = ICONS[t.type] || Coins;
                const isPositive = ["drop", "roi", "referral", "deposit"].includes(t.type);
                return (
                  <div key={t.id} className="flex items-center justify-between gap-3 px-6 py-5 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`grid h-10 w-10 place-items-center rounded-2xl border ${
                        isPositive ? "border-primary/20 bg-primary/5 text-primary" : "border-white/10 bg-white/5 text-muted-foreground"
                      }`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-tight text-white mb-0.5">{t.type === 'roi' ? 'Profit Drop' : t.type}</div>
                        <div className="text-[10px] text-muted-foreground/60 font-medium">{t.description}</div>
                        <div className="text-[9px] text-muted-foreground/40 mt-1">{formatDateTime(t.created_at)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-display text-base font-bold ${isPositive ? "text-primary" : "text-white opacity-60"}`}>
                        {isPositive ? "+" : "-"}{formatCurrency(t.amount)}
                      </div>
                      <span className={`mt-2 inline-block rounded-lg px-2 py-1 text-[8px] font-black uppercase tracking-widest ${
                        t.status === "completed" || t.status === "approved" ? "bg-primary/10 text-primary" : "bg-white/5 text-muted-foreground"
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="px-5 py-12 text-center text-xs text-muted-foreground font-medium italic">No transactions found in this category.</div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

