import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const INVESTORS = [
  {
    name: "Michael Osei",
    location: "Accra, Ghana",
    plan: "Platinum Plan",
    roi: "+12% daily",
    quote:
      "I started with $500 and within 15 days I had enough to upgrade to the Platinum plan. Expert Invests is the real deal — transparent, fast, and incredibly rewarding.",
    joined: "Member since Jan 2024",
    initials: "MO",
    color: "from-emerald-800 to-emerald-600",
  },
  {
    name: "Fatima Al-Rashid",
    location: "Dubai, UAE",
    plan: "Diamond Plan",
    roi: "+20% daily",
    quote:
      "As someone who has tried multiple investment platforms, nothing comes close to the returns here. My portfolio grew by $48,000 in just 30 days. Absolutely mind-blowing.",
    joined: "Member since Oct 2023",
    initials: "FA",
    color: "from-yellow-700 to-amber-500",
  },
  {
    name: "James Whitfield",
    location: "London, UK",
    plan: "Gold Plan",
    roi: "+10% daily",
    quote:
      "The daily ROI drops are consistent and the admin dashboard gives full visibility. I've referred 12 friends — we're all watching our money work for us every single day.",
    joined: "Member since Mar 2024",
    initials: "JW",
    color: "from-blue-800 to-indigo-600",
  },
  {
    name: "Priya Nair",
    location: "Mumbai, India",
    plan: "Silver Plan",
    roi: "+7% daily",
    quote:
      "I was skeptical at first, but after my very first daily reward dropped into my wallet, I was hooked. The withdrawal process is smooth and support is always available.",
    joined: "Member since Feb 2024",
    initials: "PN",
    color: "from-rose-700 to-pink-500",
  },
  {
    name: "Carlos Mendoza",
    location: "Mexico City, Mexico",
    plan: "Gold Plan",
    roi: "+10% daily",
    quote:
      "Expert Invests turned my savings into a working asset. The compound reinvest feature is genius — I've tripled my portfolio in under two months.",
    joined: "Member since Nov 2023",
    initials: "CM",
    color: "from-teal-700 to-cyan-500",
  },
  {
    name: "Amara Diallo",
    location: "Dakar, Senegal",
    plan: "Platinum Plan",
    roi: "+12% daily",
    quote:
      "This platform changed my perspective on passive income. I now earn more from Expert Invests daily than from my regular job. Best financial decision I've ever made.",
    joined: "Member since Dec 2023",
    initials: "AD",
    color: "from-purple-700 to-violet-500",
  },
];

export function InvestorsSection() {
  return (
    <section
      id="investors"
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{
        backgroundImage: "url('/investors-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-background/88 backdrop-blur-sm" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Investor Stories</p>
          <h2 className="mt-3 font-display text-4xl lg:text-5xl">
            84,000+ investors <span className="text-gradient-gold">already winning</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            From first-time investors to seasoned traders — real people, real returns,
            every single day.
          </p>
        </div>

        {/* Stats bar */}
        <div className="mb-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { v: "$2.4B+", l: "Total payouts" },
            { v: "84,000+", l: "Active investors" },
            { v: "194", l: "Countries served" },
            { v: "99.97%", l: "On-time reward rate" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-2xl border border-border/60 bg-card/60 p-5 text-center backdrop-blur"
            >
              <div className="font-display text-3xl text-gradient-gold">{s.v}</div>
              <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Testimonials grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INVESTORS.map((inv, idx) => (
            <motion.div
              key={inv.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-7 backdrop-blur shadow-flash-emerald"
            >
              {/* Quote icon */}
              <Quote
                size={36}
                className="absolute top-5 right-5 text-primary/10 group-hover:text-primary/20 transition-colors"
              />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="fill-primary text-primary" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed text-muted-foreground">
                "{inv.quote}"
              </p>

              {/* Investor info */}
              <div className="mt-6 flex items-center gap-4">
                <div
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br ${inv.color} text-sm font-bold text-white shadow-gold`}
                >
                  {inv.initials}
                </div>
                <div>
                  <div className="font-semibold text-sm">{inv.name}</div>
                  <div className="text-[11px] text-muted-foreground">{inv.location}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xs font-bold text-success">{inv.roi}</div>
                  <div className="text-[10px] text-muted-foreground">{inv.plan}</div>
                </div>
              </div>

              <div className="mt-4 border-t border-border/40 pt-3 text-[10px] uppercase tracking-wider text-muted-foreground/60">
                {inv.joined}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
