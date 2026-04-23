import { TrendingUp, Calculator, Repeat } from "lucide-react";
import { useState } from "react";

export function RoiSection() {
  const [amount, setAmount] = useState(5000);
  const [days, setDays] = useState(30);
  const [rate, setRate] = useState(11);

  const dailyEarn = (amount * rate) / 100;
  const total = dailyEarn * days;
  const final = amount + total;

  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">ROI Engine</p>
            <h2 className="mt-3 font-display text-4xl lg:text-5xl">
              Project your <span className="text-gradient-gold">daily returns</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Every plan pays a fixed daily ROI on every trading day. Reinvest your
              gains in one click and watch wealth compound exponentially.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { icon: TrendingUp, t: "Daily ROI from 3% to 20%", d: "Higher tier = higher rate." },
                { icon: Calculator, t: "Fully transparent math", d: "Every credit logged in your history tab." },
                { icon: Repeat, t: "Reinvest with one tap", d: "Compound profits without re-depositing." },
              ].map((f) => (
                <div key={f.t} className="flex items-start gap-4 rounded-2xl border border-border/50 bg-card/50 p-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                    <f.icon size={18} />
                  </div>
                  <div>
                    <div className="font-semibold">{f.t}</div>
                    <div className="text-sm text-muted-foreground">{f.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl glass p-8 shadow-flash-emerald">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">ROI Calculator</div>
            <div className="mt-1 font-display text-2xl text-gradient-gold">Estimate your earnings</div>

            <div className="mt-6 space-y-5">
              <Field label={`Investment amount: $${amount.toLocaleString()}`}>
                <input
                  type="range"
                  min={10}
                  max={1000000}
                  step={50}
                  value={amount}
                  onChange={(e) => setAmount(+e.target.value)}
                  className="w-full accent-[oklch(0.78_0.13_85)]"
                />
              </Field>
              <Field label={`Daily ROI: ${rate}%`}>
                <input
                  type="range"
                  min={3}
                  max={20}
                  step={1}
                  value={rate}
                  onChange={(e) => setRate(+e.target.value)}
                  className="w-full accent-[oklch(0.78_0.13_85)]"
                />
              </Field>
              <Field label={`Duration: ${days} days`}>
                <input
                  type="range"
                  min={7}
                  max={365}
                  step={1}
                  value={days}
                  onChange={(e) => setDays(+e.target.value)}
                  className="w-full accent-[oklch(0.78_0.13_85)]"
                />
              </Field>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3">
              {[
                { l: "Daily", v: dailyEarn },
                { l: "Total ROI", v: total },
                { l: "Final balance", v: final },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-background/60 p-3 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
                  <div className="mt-1 font-display text-lg text-gradient-gold">
                    ${s.v.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-medium text-foreground/85">{label}</div>
      {children}
    </div>
  );
}
