import { TrendingUp } from "lucide-react";

type Props = { size?: number; withText?: boolean; className?: string };

export function Logo({ size = 44, withText = true, className = "" }: Props) {
  const iconSize = Math.round(size * 0.55);
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Placeholder icon — replace with real logo later */}
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-xl bg-gradient-gold shadow-gold"
      >
        <TrendingUp size={iconSize} className="text-primary-foreground" strokeWidth={2.5} />
      </div>
      {withText && (
        <div className="font-display text-lg lg:text-xl font-bold tracking-tight text-white flex items-center">
          Expert<span className="text-primary">Invest</span>
        </div>
      )}
    </div>
  );
}
