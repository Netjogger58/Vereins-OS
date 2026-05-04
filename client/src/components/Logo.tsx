import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  inverted?: boolean;
}

// Geometric M75 mark: chevron "M" + numerals in monospace lockup
export function Logo({ className, size = 40, inverted = false }: LogoProps) {
  const navy = "#002F65";
  const yellow = "#FFDE00";
  const bg = inverted ? yellow : navy;
  const fg = inverted ? navy : yellow;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={cn(className)}
      aria-label="Mersch75 Logo"
    >
      <rect width="64" height="64" rx="10" fill={bg} />
      {/* M chevron */}
      <path
        d="M10 46 L10 18 L18 18 L24 28 L30 18 L38 18 L38 46 L32 46 L32 28 L24 42 L16 28 L16 46 Z"
        fill={fg}
      />
      {/* 75 */}
      <text
        x="51"
        y="32"
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="800"
        fontSize="11"
        fill={fg}
        letterSpacing="-0.5"
      >
        75
      </text>
      {/* Handball ball accent */}
      <circle cx="51" cy="46" r="5" fill={fg} opacity="0.9" />
      <path d="M46.5 46 L55.5 46 M51 41.5 L51 50.5" stroke={bg} strokeWidth="1.2" />
    </svg>
  );
}

export function LogoLockup({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Logo size={32} inverted={inverted} />
      <div className="flex flex-col leading-none">
        <span className={cn("text-sm font-extrabold tracking-tight", inverted ? "text-primary" : "text-sidebar-foreground")}>
          M75 Manager
        </span>
        <span className={cn("text-[10px] uppercase tracking-[0.12em] font-medium", inverted ? "text-primary/70" : "text-sidebar-foreground/60")}>
          Mersch75
        </span>
      </div>
    </div>
  );
}
