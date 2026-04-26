import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { 
  LayoutDashboard, Users, Coins, Wallet, ListChecks, History, LogOut, 
  Loader2, Menu, X, ArrowUpCircle, ShieldCheck
} from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/deposits", label: "Deposits", icon: ListChecks },
  { to: "/admin/withdrawals", label: "Withdrawals", icon: ArrowUpCircle },
  { to: "/admin/plans", label: "Plans", icon: Coins },
  { to: "/admin/wallets", label: "Wallets", icon: Wallet },
  { to: "/admin/history", label: "History", icon: History },
];

export function AdminShell() {
  const loc = useLocation();
  const path = loc.pathname;
  const navigate = useNavigate();
  const { user, isAdmin, loading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/admin-login" });
    else if (!isAdmin) navigate({ to: "/dashboard" });
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#020807]">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen bg-[#020807] text-foreground">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 flex-col border-r border-white/5 bg-black/40 backdrop-blur-3xl lg:flex fixed inset-y-0 z-50">
        <div className="flex h-20 items-center gap-3 px-6">
          <Logo size={32} withText={false} />
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Admin Console</div>
            <div className="truncate font-display text-sm">Expert Invests</div>
          </div>
        </div>

        <nav className="mt-6 flex-1 space-y-1 px-3">
          {NAV.map((n) => {
            const active = path === n.to || (n.to !== "/admin" && path.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  active 
                    ? "bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] border border-primary/20" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <n.icon size={18} className={active ? "text-primary" : "text-muted-foreground/60"} />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-4">
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-gold text-primary-foreground shadow-gold">
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-bold">{user.email}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Master Admin</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/5 bg-black/60 px-4 backdrop-blur-xl lg:hidden">
          <Link to="/admin" className="flex items-center gap-2">
            <Logo size={28} withText={false} />
            <span className="font-display text-sm">Expert Admin</span>
          </Link>
          <button 
            onClick={() => setMobileOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/5"
          >
            <Menu size={20} />
          </button>
        </header>

        <main className="min-h-[calc(100vh-4rem)] lg:min-h-screen p-4 lg:p-10">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 right-0 w-72 border-l border-white/10 bg-[#050c0a] p-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8">
              <Logo size={32} />
              <button onClick={() => setMobileOpen(false)} className="rounded-full p-2 hover:bg-white/5">
                <X size={20} />
              </button>
            </div>
            <nav className="space-y-2">
              {NAV.map((n) => {
                const active = path === n.to || (n.to !== "/admin" && path.startsWith(n.to));
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium ${
                      active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/5"
                    }`}
                  >
                    <n.icon size={18} />
                    {n.label}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={handleSignOut}
              className="mt-8 flex w-full items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3.5 text-sm font-medium text-destructive"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
