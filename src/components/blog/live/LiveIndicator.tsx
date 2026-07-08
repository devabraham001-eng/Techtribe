import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
  label?: string;
  className?: string;
  pulse?: boolean;
}

export function LiveDot({ className, pulse = true }: { className?: string; pulse?: boolean }) {
  return (
    <span
      className={cn(
        "inline-block w-[6px] h-[6px] rounded-full bg-[var(--success)]",
        pulse && "animate-pulse",
        className
      )}
      style={{ boxShadow: "0 0 8px var(--success)" }}
    />
  );
}

export function LiveIndicator({ label = "Live", className, pulse = true }: LiveIndicatorProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] font-medium text-[var(--success)]", className)}>
      <LiveDot pulse={pulse} />
      {label}
    </span>
  );
}

export function LiveViewCount({ count, className }: { count: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <LiveDot />
      <span className="text-xs font-medium tabular-nums text-muted-foreground">
        {count.toLocaleString()} watching
      </span>
    </span>
  );
}