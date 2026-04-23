import { useState } from "react";
import { Mail, MapPin, Phone, Send, CheckCircle2 } from "lucide-react";

export function ContactSection() {
  const [sent, setSent] = useState(false);
  const [newsletterSent, setNewsletterSent] = useState(false);

  return (
    <section id="contact" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-2">
          {/* Contact form */}
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Contact</p>
            <h2 className="mt-3 font-display text-4xl lg:text-5xl">
              Let's <span className="text-gradient-gold">talk numbers</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Whether you're a $50 starter or a $1M family office, our team replies
              within 60 minutes — every day, every timezone.
            </p>

            <div className="mt-8 space-y-3">
              {[
                { icon: Mail, t: "support@expertinvests.com" },
                { icon: Phone, t: "+44 20 7946 1058" },
                { icon: MapPin, t: "30 St Mary Axe, London EC3A 8BF" },
              ].map((c) => (
                <div key={c.t} className="flex items-center gap-3 text-sm">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
                    <c.icon size={16} />
                  </div>
                  <span>{c.t}</span>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
              setTimeout(() => setSent(false), 4000);
            }}
            className="rounded-3xl glass p-7 shadow-emerald"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" placeholder="John Doe" />
              <Input label="Email" type="email" placeholder="you@email.com" />
            </div>
            <div className="mt-4">
              <Input label="Subject" placeholder="I'd like to invest in the Gold tier" />
            </div>
            <div className="mt-4">
              <label className="text-xs font-medium text-foreground/85">Message</label>
              <textarea
                rows={4}
                placeholder="Tell us a bit about your goals…"
                className="mt-1.5 w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>
            <button
              type="submit"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold"
            >
              {sent ? (<><CheckCircle2 size={16} /> Message sent</>) : (<><Send size={16} /> Send message</>)}
            </button>
          </form>
        </div>

        {/* Newsletter */}
        <div className="mt-20 overflow-hidden rounded-3xl bg-gradient-gold p-1 shadow-gold">
          <div className="rounded-[calc(1.5rem-4px)] bg-background/95 px-8 py-12 backdrop-blur">
            <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary">Newsletter</p>
                <h3 className="mt-2 font-display text-3xl lg:text-4xl">
                  Weekly <span className="text-gradient-gold">market intelligence</span>, delivered.
                </h3>
                <p className="mt-3 text-muted-foreground">
                  Signals, plan updates and exclusive ROI bonuses. Zero spam.
                </p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setNewsletterSent(true);
                  setTimeout(() => setNewsletterSent(false), 4000);
                }}
                className="flex items-center gap-2 rounded-full border border-border/70 bg-background/70 p-1.5"
              >
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent px-4 py-2 text-sm outline-none"
                />
                <button className="rounded-full bg-gradient-gold px-5 py-2 text-sm font-semibold text-primary-foreground">
                  {newsletterSent ? "Subscribed ✓" : "Subscribe"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Input({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-xs font-medium text-foreground/85">{label}</label>
      <input
        {...rest}
        className="mt-1.5 w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
      />
    </div>
  );
}
