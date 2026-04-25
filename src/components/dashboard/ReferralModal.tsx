import { X, Copy, Users, Gift, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { getReferralBonus } from "@/lib/mock-service";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";

export function ReferralModal({ onClose }: { onClose: () => void }) {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const bonus = getReferralBonus();
  
  // Mock total referrals based on bonus
  const totalReferrals = bonus > 0 ? Math.floor(bonus / 25) + 1 : 0;
  const refLink = `https://goldempire.com/ref/${profile?.id || 'demo'}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.95 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[2rem] border border-border bg-card shadow-2xl p-6 relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h3 className="font-display text-2xl">Referral Hub</h3>
          <button onClick={onClose} className="hover:bg-background/80 p-2 rounded-full transition-colors"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-background/50 border border-border/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-primary/15 text-primary grid place-items-center mb-2">
              <Users size={20} />
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Referrals</div>
            <div className="font-display text-2xl mt-1">{totalReferrals}</div>
          </div>
          
          <div className="bg-gradient-gold rounded-2xl p-4 flex flex-col items-center justify-center text-center text-primary-foreground shadow-gold relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
            <div className="w-10 h-10 rounded-full bg-white/20 grid place-items-center mb-2 relative z-10">
              <Gift size={20} />
            </div>
            <div className="text-[10px] text-white/80 uppercase tracking-wider relative z-10">Total Bonus Earned</div>
            <div className="font-display text-2xl mt-1 relative z-10">{formatCurrency(bonus)}</div>
          </div>
        </div>

        <div className="bg-card border border-primary/20 rounded-2xl p-5 mb-6 text-center">
          <h4 className="font-semibold text-sm mb-1">Earn 5% on First Deposit</h4>
          <p className="text-xs text-muted-foreground mb-4">Invite your friends and earn a 5% instant bonus on their first subscription amount.</p>
          
          <div className="relative">
            <input 
              readOnly 
              value={refLink} 
              className="w-full bg-background/60 border border-border rounded-xl py-3 pl-4 pr-12 text-xs font-mono text-muted-foreground outline-none"
            />
            <button 
              onClick={copyToClipboard}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/10 text-primary p-1.5 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <button onClick={onClose} className="w-full py-3 rounded-full bg-background/80 hover:bg-background border border-border/60 text-sm font-semibold transition-colors">
          Close Hub
        </button>
      </motion.div>
    </div>
  );
}
