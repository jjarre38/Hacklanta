import clsx from "clsx";

interface ProgressBarProps {
  value: number; // 0..max
  max?: number;
  label?: string;
  tone?: "blue" | "green" | "violet";
  className?: string;
}

const fills = {
  blue: "bg-brand-500",
  green: "bg-sage-500",
  violet: "bg-dusk-500",
};

export function ProgressBar({ value, max = 100, label, tone = "blue", className }: ProgressBarProps) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={className}>
      {label && <div className="mb-1.5 text-sm font-medium text-ink-soft">{label}</div>}
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
      >
        <div className={clsx("h-full rounded-full transition-all duration-500", fills[tone])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
