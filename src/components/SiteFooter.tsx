import { Logo } from "./Logo";
import { Mail, MessageCircle, Send, Globe } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-background/80">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo size={48} />
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
              Expert Invests is a private wealth platform combining crypto,
              commodities, and forex into one transparent, performance-driven
              experience. From $10 starter plans to $1M family-office portfolios.
            </p>
            <div className="mt-6 flex gap-3">
              {[Globe, Send, MessageCircle, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-full border border-border/70 text-foreground/80 transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg text-gradient-gold">Platform</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#plans" className="hover:text-primary">Investment Plans</a></li>
              <li><a href="#markets" className="hover:text-primary">Live Markets</a></li>
              <li><a href="#how" className="hover:text-primary">How it works</a></li>
              <li><a href="#about" className="hover:text-primary">About us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg text-gradient-gold">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Terms of service</a></li>
              <li><a href="#" className="hover:text-primary">Privacy policy</a></li>
              <li><a href="#" className="hover:text-primary">Risk disclosure</a></li>
              <li><a href="#" className="hover:text-primary">AML / KYC</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Expert Invests. All rights reserved.</p>
          <p>Trading involves risk. Past performance does not guarantee future results.</p>
        </div>
      </div>
    </footer>
  );
}
