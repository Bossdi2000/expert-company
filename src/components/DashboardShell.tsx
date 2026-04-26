import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Coins, History, User, LogOut, Bell, Loader2, ArrowUpToLine, Headset, Users, Wallet, TrendingUp, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";
import { AnimatePresence, motion } from "framer-motion";
import { WithdrawModal } from "./dashboard/WithdrawModal";
import { ReferralModal } from "./dashboard/ReferralModal";
import { CustomerCareModal } from "./dashboard/CustomerCareModal";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/profile", label: "Profile", icon: User },
  { to: "/dashboard/invest", label: "Investment", icon: Coins },
  { to: "/dashboard/withdrawal", label: "Withdrawal", icon: Wallet },
  { to: "/dashboard/history", label: "Earnings History", icon: History },
  { to: "/dashboard/referral", label: "Referral", icon: Users },
];

export function DashboardShell() {
  const loc = useLocation();
  const path = loc.pathname;
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [referralModal, setReferralModal] = useState(false);
  const [careModal, setCareModal] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };



  return (
    <div className="min-h-screen bg-[#050505]">
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="fixed left-0 top-0 hidden h-full w-[260px] flex-col border-r border-white/5 bg-[#050505] p-6 lg:flex">
        <div className="mb-10 px-2">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded bg-primary text-primary-foreground font-bold italic">E</div>
            <span className="font-display text-xl font-bold tracking-tight text-white">Expert<span className="text-primary">Invest</span></span>
          </Link>
        </div>

        <nav className="flex-1 space-y-2">
          {NAV.map((n) => {
            const active = path === n.to || (n.to !== "/dashboard" && path.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all ${
                  active 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
              >
                <n.icon size={20} strokeWidth={active ? 2.5 : 2} />
                {n.label}
                {active && (
                  <div className="absolute right-4 h-1.5 w-1.5 rounded-full bg-primary-foreground/40" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <button 
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-2 text-sm font-bold text-red-500 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="lg:ml-[260px]">
        <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/80 backdrop-blur-2xl">
          <div className="mx-auto flex h-20 items-center justify-between px-4 lg:px-10">
            {/* Breadcrumb / Page Title (Desktop Only) */}
            <div className="hidden flex-col lg:flex">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                DASHBOARD / <span className="text-white">{path.split('/').pop()?.toUpperCase() || 'OVERVIEW'}</span>
              </div>
              <h1 className="mt-0.5 font-display text-2xl font-bold capitalize">
                {path.split('/').pop() || 'Overview'}
              </h1>
            </div>

            {/* Desktop Top Utilities (Right Aligned) */}
            <div className="hidden items-center gap-4 lg:flex">
              <button 
                onClick={() => setCareModal(true)}
                className="grid h-11 w-11 place-items-center rounded-2xl border border-white/5 bg-white/5 text-primary transition-all hover:bg-white/10 hover:border-primary/20"
              >
                <Headset size={20} />
              </button>

              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative grid h-11 w-11 place-items-center rounded-full border border-white/5 bg-white/5 text-muted-foreground transition-all hover:bg-white/10"
              >
                <Bell size={20} />
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary animate-pulse" />
              </button>

              <div className="h-8 w-[1px] bg-white/10 mx-1" />

              <Link to="/dashboard/profile" className="grid h-11 w-11 place-items-center rounded-full border border-primary/20 bg-white/5 text-muted-foreground transition-all hover:border-primary/40 shadow-[0_0_15px_-3px_oklch(0.7_0.15_70/10%)]">
                <User size={20} />
              </Link>
            </div>

            {/* Mobile Utils (Headset Square, Bell Circle, Divider, Profile Circle) */}
            <div className="flex w-full items-center justify-end gap-3 lg:hidden">
              <button 
                onClick={() => setCareModal(true)} 
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-primary transition-all active:scale-95"
              >
                <Headset size={18} />
              </button>
              
              <button 
                onClick={() => setNotifOpen(!notifOpen)} 
                className="relative grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-all active:scale-95"
              >
                <Bell size={18} />
                <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              </button>

              <div className="h-6 w-[1px] bg-white/10 mx-0.5" />

              <Link to="/dashboard/profile" className="grid h-10 w-10 place-items-center rounded-full border border-primary/20 bg-white/5 text-muted-foreground transition-all active:scale-95 shadow-[0_0_10px_-2px_oklch(0.7_0.15_70/10%)]">
                <User size={18} />
              </Link>
            </div>
          </div>
        </header>

        {/* --- NOTIFICATION PANEL --- */}
        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute right-4 lg:right-10 top-24 z-50 w-[320px] lg:w-[400px] glass rounded-3xl p-6 border-white/5 shadow-2xl bg-[#0a0a0a]/95 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold">Activity Log</h3>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">DAILY UPDATES</span>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {[
                  { title: "Daily Profit Credited", desc: "Your daily ROI of $120.00 was successfully added.", time: "2h ago", icon: TrendingUp, color: "text-primary" },
                  { title: "Withdrawal Approved", desc: "Your withdrawal request for $500.00 has been processed.", time: "5h ago", icon: ArrowUpToLine, color: "text-primary" },
                  { title: "Referral Bonus", desc: "You earned $15.00 from a new referral investment.", time: "1d ago", icon: Users, color: "text-primary" },
                  { title: "Security Login", desc: "A new login was detected from your current IP.", time: "2d ago", icon: ShieldCheck, color: "text-muted-foreground" },
                ].map((n, i) => (
                  <div key={i} className="flex gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 ${n.color}`}>
                      <n.icon size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{n.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.desc}</div>
                      <div className="text-[10px] text-muted-foreground/50 mt-2 font-bold uppercase">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setNotifOpen(false)}
                className="w-full mt-6 py-3 rounded-xl bg-white/5 text-xs font-bold hover:bg-white/10 transition-colors"
              >
                Close Panel
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="mx-auto px-4 py-8 lg:px-10">
          <Outlet />
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-[#0a0a0a]/80 pb-safe backdrop-blur-2xl lg:hidden">
        <div className="grid grid-cols-5 items-center px-1">
          {/* Overview */}
          <Link
            to="/dashboard"
            className={`flex flex-col items-center gap-1 py-3 text-[9px] font-medium transition-all ${
              path === "/dashboard" ? "text-primary scale-110" : "text-muted-foreground"
            }`}
          >
            <LayoutDashboard size={18} />
            Overview
          </Link>

          {/* Investment */}
          <Link
            to="/dashboard/invest"
            className={`flex flex-col items-center gap-1 py-3 text-[9px] font-medium transition-all ${
              path === "/dashboard/invest" ? "text-primary scale-110" : "text-muted-foreground"
            }`}
          >
            <Coins size={18} />
            Investment
          </Link>

          {/* Withdrawal */}
          <Link
            to="/dashboard/withdrawal"
            className={`flex flex-col items-center gap-1 py-3 text-[9px] font-medium transition-all ${
              path === "/dashboard/withdrawal" ? "text-primary scale-110" : "text-muted-foreground"
            }`}
          >
            <Wallet size={18} />
            Withdrawal
          </Link>

          {/* Earnings */}
          <Link
            to="/dashboard/history"
            className={`flex flex-col items-center gap-1 py-3 text-[9px] font-medium transition-all ${
              path === "/dashboard/history" ? "text-primary scale-110" : "text-muted-foreground"
            }`}
          >
            <History size={18} />
            Earnings
          </Link>

          {/* Referral */}
          <Link
            to="/dashboard/referral"
            className={`flex flex-col items-center gap-1 py-3 text-[9px] font-medium transition-all ${
              path === "/dashboard/referral" ? "text-primary scale-110" : "text-muted-foreground"
            }`}
          >
            <Users size={18} />
            Referral
          </Link>
        </div>
      </nav>

      <AnimatePresence>
        {withdrawModal && <WithdrawModal onClose={() => setWithdrawModal(false)} />}
        {referralModal && <ReferralModal onClose={() => setReferralModal(false)} />}
        {careModal && <CustomerCareModal onClose={() => setCareModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
