import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Sparkles, ShieldCheck, TrendingUp } from "lucide-react";

export function Hero() {
  return (
    <section 
      className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-36"
      style={{
        backgroundImage: "url('/hero-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for readability with slow pulse to reveal image */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px] animate-[pulse_5s_ease-in-out_infinite]" />
      
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -top-40 -right-32 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-[500px] w-[500px] rounded-full bg-emerald/15 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >


            <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Redefining <span className="text-gradient-gold">Global Wealth</span><br />
              Creation.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Experience the pinnacle of institutional investing with Expert Invests. We deploy capital across crypto, equities, and commodities to secure <span className="text-primary font-semibold">3% to 20% daily returns</span>. Precision, power, and transparency.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/signup"
                className="rounded-full bg-gradient-gold px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:scale-[1.03]"
              >
                Start investing
              </Link>
              <a
                href="#plans"
                className="rounded-full border border-primary/40 px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-primary/10"
              >
                View plans →
              </a>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
              {[
                { v: "$4.8B+", l: "Assets traded" },
                { v: "112k+", l: "Elite Investors" },
                { v: "194", l: "Countries" },
              ].map((s, idx) => (
                <motion.div
                  key={s.l}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="rounded-2xl border border-border/60 bg-card/40 p-4 backdrop-blur shadow-flash-emerald"
                >
                  <div className="font-display text-2xl text-gradient-gold">{s.v}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Floating dashboard mock */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-gold opacity-20 blur-3xl" />
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="relative rounded-[2rem] glass p-7 shadow-flash-emerald float"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Portfolio Value</div>
                  <div className="mt-1 font-display text-4xl text-gradient-gold">$248,650.40</div>
                </div>
                <div className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                  +14.2% MTD
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { name: "Gold (XAU)", v: "$92,400", c: "+2.1%" },
                  { name: "Bitcoin", v: "$78,250", c: "+5.4%" },
                  { name: "Ethereum", v: "$42,800", c: "+3.2%" },
                  { name: "Forex EUR/USD", v: "$35,200", c: "+1.0%" },
                ].map((a) => (
                  <div key={a.name} className="rounded-xl border border-border/60 bg-background/50 p-3">
                    <div className="text-[11px] text-muted-foreground">{a.name}</div>
                    <div className="mt-1 text-sm font-semibold">{a.v}</div>
                    <div className="text-[10px] text-success">{a.c}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between rounded-xl bg-gradient-emerald p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/20">
                    <TrendingUp size={18} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Today's ROI credited</div>
                    <div className="text-sm font-semibold">+$3,420.50</div>
                  </div>
                </div>
                <ShieldCheck size={20} className="text-primary" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
