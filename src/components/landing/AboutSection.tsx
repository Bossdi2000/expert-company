import { ShieldCheck, Award, Globe2 } from "lucide-react";

export function AboutSection() {
  return (
    <section id="about" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            <div className="absolute -inset-4 rounded-[3rem] bg-gradient-gold opacity-15 blur-3xl" />
            <div className="relative grid grid-cols-2 gap-4">
              {[
                { v: "12+", l: "Years on the desk" },
                { v: "$2.4B", l: "Capital deployed" },
                { v: "84k+", l: "Active investors" },
                { v: "99.97%", l: "Uptime SLA" },
              ].map((s) => (
                <div key={s.l} className="rounded-3xl border border-border/60 bg-card/60 p-7 backdrop-blur shadow-flash-emerald">
                  <div className="font-display text-4xl text-gradient-gold">{s.v}</div>
                  <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">About us</p>
            <h2 className="mt-3 font-display text-4xl lg:text-5xl">
              A house built on <span className="text-gradient-gold">discipline</span>,
              <br />measured in gold.
            </h2>
            <p className="mt-5 text-muted-foreground">
              Founded by ex-Goldman traders and crypto-native quants, Expert
              Invests marries old-world commodity discipline with the velocity
              of digital assets. We trade so you don't have to.
            </p>

            <div className="mt-7 space-y-3">
              {[
                { icon: ShieldCheck, t: "Custodied & insured", d: "Funds held with regulated tier-1 custodians." },
                { icon: Award, t: "Audited monthly", d: "Independent third-party audits, every 30 days." },
                { icon: Globe2, t: "Global reach", d: "Investors from 194 countries, 24/7 support desks." },
              ].map((f) => (
                <div key={f.t} className="flex items-start gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
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
        </div>
      </div>
    </section>
  );
}
