import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PLANS, formatCurrency } from "@/lib/mock-data";
import { Crown, Check } from "lucide-react";

const ACCENT_RING: Record<string, string> = {
  silver: "from-zinc-200/20 to-zinc-400/10",
  bronze: "from-amber-700/20 to-amber-500/10",
  gold: "from-yellow-300/30 to-amber-500/15",
  platinum: "from-slate-100/20 to-slate-300/10",
  emerald: "from-emerald-400/30 to-emerald-700/15",
  ruby: "from-rose-400/30 to-rose-700/15",
  sapphire: "from-blue-400/30 to-blue-700/15",
  diamond: "from-cyan-200/30 to-indigo-400/15",
};

export function PlansSection() {
  return (
    <section id="plans" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Investment Plans</p>
          <h2 className="mt-3 font-display text-4xl lg:text-5xl">
            Choose your <span className="text-gradient-gold">tier of wealth</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Eight tiers from $10 to $1M. The higher the tier, the higher the daily ROI —
            backed by gold, traded across crypto and forex on every market day.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p, idx) => (
            <motion.div
              key={p.id}
              whileHover={{ scale: 1.02 }}
              className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur transition-all hover:border-primary/50 shadow-flash-emerald"
            >
              <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${ACCENT_RING[p.accent]} opacity-60`} />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{p.tier}</div>
                  {p.tier === "Royal" && <Crown size={16} className="text-primary" />}
                </div>
                <h3 className="mt-2 font-display text-3xl text-gradient-gold">{p.name}</h3>

                <div className="mt-5">
                  <div className="font-display text-4xl">{p.dailyRoi}%</div>
                  <div className="text-xs text-muted-foreground">Daily ROI · {p.duration} days</div>
                </div>

                <div className="mt-5 rounded-xl bg-background/50 px-3 py-2.5 text-xs">
                  <div className="text-muted-foreground">Investment range</div>
                  <div className="mt-0.5 font-mono font-semibold text-foreground">
                    {formatCurrency(p.min)} — {p.max === p.min ? "+" : formatCurrency(p.max)}
                  </div>
                </div>

                <ul className="mt-5 space-y-2">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-xs text-foreground/85">
                      <Check size={14} className="mt-0.5 shrink-0 text-primary" />
                      {perk}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/signup"
                  className="mt-6 block rounded-full bg-gradient-gold py-2.5 text-center text-xs font-semibold text-primary-foreground shadow-gold"
                >
                  Invest in {p.name}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
