import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export function Card({ className, padded = true, ...props }: CardProps) {
  return (
    <div
      className={clsx("rounded-lg border border-slate-200/80 bg-white shadow-soft", padded && "p-4 sm:p-6", className)}
      {...props}
    />
  );
}

interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, description, icon, action, className }: CardHeaderProps) {
  return (
    <div className={clsx("mb-4 flex items-start justify-between gap-4", className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
