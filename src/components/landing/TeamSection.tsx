const TEAM = [
  { name: "Adrien Rousseau", role: "CEO & Co-founder", bio: "Ex-Goldman Sachs commodities desk, 14 yrs." },
  { name: "Hannah Vogel", role: "Chief Investment Officer", bio: "Former BlackRock multi-asset PM." },
  { name: "Kenji Watanabe", role: "Head of Crypto Trading", bio: "Built Tokyo's largest OTC desk." },
  { name: "Sade Adebayo", role: "Head of Risk", bio: "Quant lead, 10+ yrs across HSBC & Citadel." },
  { name: "Marco Bianchi", role: "Chief Technology Officer", bio: "Architect at Coinbase Custody." },
  { name: "Eleanor Hayes", role: "Head of Compliance", bio: "Former FCA senior officer, London." },
];

export function TeamSection() {
  return (
    <section id="team" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-emerald opacity-40" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Leadership</p>
          <h2 className="mt-3 font-display text-4xl lg:text-5xl">
            The desk behind <span className="text-gradient-gold">your gains</span>
          </h2>
        </div>

        {/* Team Photo Collage */}
        <div className="mt-14 relative overflow-hidden rounded-[2rem] border border-border/60 shadow-emerald">
          <img 
            src="/team-photos.png" 
            alt="Expert Invests Leadership Team" 
            className="w-full h-auto object-cover object-center max-h-[600px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((m) => (
              <div key={m.name} className="backdrop-blur-md bg-card/40 border border-border/40 rounded-2xl p-4 transition-all hover:bg-card/60 shadow-flash-emerald">
                <h3 className="font-display text-lg text-foreground">{m.name}</h3>
                <div className="text-[10px] uppercase tracking-wider text-primary mb-2">{m.role}</div>
                <p className="text-xs text-muted-foreground line-clamp-2">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
