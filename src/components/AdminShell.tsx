import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, Coins, Wallet, ListChecks, History, LogOut, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/deposits", label: "Deposits", icon: ListChecks },
  { to: "/admin/plans", label: "Plans", icon: Coins },
  { to: "/admin/wallets", label: "Wallets", icon: Wallet },
  { to: "/admin/history", label: "History", icon: History },
];

export function AdminShell() {
  const loc = useLocation();
  const path = loc.pathname;
  const navigate = useNavigate();
  const { user, isAdmin, loading, signOut } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (!isAdmin) navigate({ to: "/dashboard" });
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
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
    <div className="min-h-screen pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link to="/admin" className="flex items-center gap-3">
            <Logo size={36} withText={false} />
            <div className="hidden sm:block">
              <div className="text-xs uppercase tracking-[0.25em] text-primary">Admin Console</div>
              <div className="font-display text-sm">Expert HQ</div>
            </div>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => {
              const active = path === n.to || (n.to !== "/admin" && path.startsWith(n.to));
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium transition-colors ${
                    active ? "bg-primary/15 text-primary" : "text-foreground/75 hover:text-primary"
                  }`}
                >
                  <n.icon size={14} /> {n.label}
                </Link>
              );
            })}
          </div>

          <button
            onClick={handleSignOut}
            className="flex h-9 items-center gap-1.5 rounded-full border border-border/70 px-3 text-xs font-medium hover:border-destructive hover:text-destructive"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-10">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-6">
          {NAV.map((n) => {
            const active = path === n.to || (n.to !== "/admin" && path.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[9px] font-medium ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className={`grid h-9 w-9 place-items-center rounded-xl ${active ? "bg-primary/15" : ""}`}>
                  <n.icon size={16} />
                </div>
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
