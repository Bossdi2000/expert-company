import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Coins, History, User, LogOut, Bell, Loader2, ArrowUpToLine, Headset, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";
import { AnimatePresence } from "framer-motion";
import { WithdrawModal } from "./dashboard/WithdrawModal";
import { ReferralModal } from "./dashboard/ReferralModal";
import { CustomerCareModal } from "./dashboard/CustomerCareModal";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/invest", label: "Invest", icon: Coins },
  { to: "/dashboard/history", label: "History", icon: History },
  { to: "/dashboard/profile", label: "Profile", icon: User },
];

export function DashboardShell() {
  const loc = useLocation();
  const path = loc.pathname;
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [referralModal, setReferralModal] = useState(false);
  const [careModal, setCareModal] = useState(false);

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
    <div className="min-h-screen pb-24 lg:pb-8">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/50 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link to="/dashboard"><Logo size={36} withText={false} /></Link>
          <div className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => {
              const active = path === n.to || (n.to !== "/dashboard" && path.startsWith(n.to));
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-primary/15 text-primary" : "text-foreground/75 hover:text-primary"
                  }`}
                >
                  <n.icon size={15} /> {n.label}
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setReferralModal(true)}
              className="hidden h-9 items-center gap-1.5 rounded-full border border-border/70 px-4 text-xs font-semibold hover:border-primary lg:flex"
            >
              Referral Hub
            </button>
            <button 
              onClick={() => setWithdrawModal(true)}
              className="hidden h-9 items-center gap-1.5 rounded-full bg-gradient-gold px-4 text-xs font-semibold text-primary-foreground shadow-gold lg:flex hover:shadow-[0_10px_30px_-10px_oklch(0.78_0.13_85/60%)]"
            >
              Withdrawal
            </button>
            <button onClick={() => setCareModal(true)} className="grid h-9 w-9 place-items-center rounded-full border border-border/70 hover:border-primary lg:hidden">
              <Headset size={15} />
            </button>
            <button onClick={() => setCareModal(true)} className="hidden h-9 items-center gap-1.5 rounded-full border border-border/70 px-3 text-xs font-medium hover:border-primary hover:text-primary lg:inline-flex">
              <Headset size={13} /> Support
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-full border border-border/70 hover:border-primary">
              <Bell size={15} />
            </button>
            <button
              onClick={handleSignOut}
              className="hidden h-9 items-center gap-1.5 rounded-full border border-border/70 px-3 text-xs font-medium hover:border-destructive hover:text-destructive sm:inline-flex"
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:px-8 lg:py-10">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-background/50 pb-safe backdrop-blur-2xl lg:hidden">
        <div className="grid grid-cols-5 items-center">
          {NAV.map((n) => {
            const active = path === n.to || (n.to !== "/dashboard" && path.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex flex-col items-center gap-1 py-3 text-[10px] font-medium ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className={`grid h-10 w-10 place-items-center rounded-2xl transition-all ${active ? "bg-primary/15" : ""}`}>
                  <n.icon size={18} />
                </div>
                {n.label}
              </Link>
            );
          })}
          <button
            onClick={() => setReferralModal(true)}
            className="flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium text-muted-foreground hover:text-primary"
          >
            <div className="grid h-10 w-10 place-items-center rounded-2xl hover:bg-primary/15 transition-all">
              <Users size={18} />
            </div>
            Referrals
          </button>
          <button
            onClick={() => setWithdrawModal(true)}
            className="flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium text-gradient-gold"
          >
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/15">
              <ArrowUpToLine size={18} className="text-primary" />
            </div>
            Withdrawal
          </button>
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
