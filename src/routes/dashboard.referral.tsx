import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Copy, 
  Gift, 
  TrendingUp, 
  Share2, 
  CheckCircle2,
  ArrowUpRight,
  Target,
  Trophy
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/referral")({
  component: ReferralPage,
});

function ReferralPage() {
  const { profile } = useAuth();
  const referralLink = `https://expertinvest.xyz/signup?ref=${profile?.username || 'user'}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      <header>
        <h1 className="font-display text-2xl lg:text-3xl">Referral Program</h1>
        <p className="mt-2 text-[11px] lg:text-sm text-muted-foreground">Invite your friends and earn 5% on their first investment.</p>
      </header>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-3xl p-8 border-white/5 bg-[#0a0a0a]/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Users size={60} /></div>
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Total Referrals</div>
          <div className="font-display text-2xl lg:text-3xl text-white">{profile?.referral_count || 0}</div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald">
            <TrendingUp size={12} /> Active Network
          </div>
        </div>

        <div className="glass rounded-3xl p-8 border-white/5 bg-[#0a0a0a]/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Gift size={60} /></div>
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Referral Earnings</div>
          <div className="font-display text-2xl lg:text-3xl text-primary">{formatCurrency(profile?.referral_earnings || 0)}</div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-primary">
            <TrendingUp size={12} /> 5% Commission
          </div>
        </div>

        <div className="glass rounded-3xl p-8 border-white/5 bg-[#0a0a0a]/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Trophy size={60} /></div>
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Current Rank</div>
          <div className="font-display text-2xl lg:text-3xl text-white">Bronze</div>
          <div className="mt-4 text-[10px] font-bold text-muted-foreground uppercase">Next Rank: Silver</div>
        </div>
      </div>

      {/* --- REFERRAL LINK SECTION --- */}
      <section className="glass rounded-[2.5rem] p-8 lg:p-12 border-white/5 bg-[#0a0a0a]/40">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald/10 text-emerald mb-4">
            <Share2 size={32} />
          </div>
          <h2 className="text-3xl font-display font-bold">Share your link</h2>
          <p className="text-muted-foreground max-w-md mx-auto">Copy your unique link below and send it to your friends to start earning rewards.</p>
          
          <div className="relative mt-8">
            <input 
              readOnly 
              value={referralLink}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-5 pr-16 font-mono text-sm text-white outline-none focus:border-emerald/40 transition-all"
            />
            <button 
              onClick={copyLink}
              className="absolute right-2 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-xl bg-emerald text-emerald-950 hover:bg-emerald/90 transition-colors"
            >
              <Copy size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Share2, title: "Share Link", desc: "Send your referral link to friends and family." },
          { icon: Target, title: "They Invest", desc: "When they make their first investment deposit." },
          { icon: Gift, title: "Earn 5%", desc: "Receive 5% of their investment instantly." },
        ].map((step, i) => (
          <div key={i} className="glass rounded-3xl p-8 border-white/5 bg-[#0a0a0a]/40 text-center space-y-4">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-white/5 text-emerald">
              <step.icon size={24} />
            </div>
            <h3 className="font-display font-bold text-lg">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </section>
      {/* --- REFERRED USERS LIST --- */}
      <section className="glass rounded-[2.5rem] p-8 lg:p-12 border-white/5 bg-[#0a0a0a]/40">
        <h2 className="text-2xl font-display font-bold mb-8">Your Network</h2>
        <ReferralList />
      </section>
    </div>
  );
}

function ReferralList() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReferrals() {
      // @ts-ignore - RPC will be created in Supabase
      const { data } = await import("@/integrations/supabase/client").then(m => m.supabase.rpc('get_my_referrals'));
      if (data) setReferrals(data);
      setLoading(false);
    }
    fetchReferrals();
  }, []);

  if (loading) {
    return <div className="text-sm text-muted-foreground animate-pulse">Loading network data...</div>;
  }

  if (referrals.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="mx-auto w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-muted-foreground mb-4">
          <Users size={20} />
        </div>
        <p className="text-sm text-muted-foreground">You haven't referred anyone yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/5 text-muted-foreground">
            <th className="pb-4 font-medium px-4">Username</th>
            <th className="pb-4 font-medium px-4">Date Joined</th>
            <th className="pb-4 font-medium px-4">Total Invested</th>
            <th className="pb-4 font-medium px-4">Bonus Earned</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {referrals.map((ref, i) => (
            <tr key={i} className="hover:bg-white/5 transition-colors">
              <td className="py-4 px-4 font-semibold">{ref.username}</td>
              <td className="py-4 px-4 text-muted-foreground">{new Date(ref.created_at).toLocaleDateString()}</td>
              <td className="py-4 px-4 text-white">{formatCurrency(ref.total_invested)}</td>
              <td className="py-4 px-4 text-emerald font-bold">{formatCurrency(ref.bonus_earned)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
