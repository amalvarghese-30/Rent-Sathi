import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-surface/60 p-10 md:p-14 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-[0.2] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative">
        <div className="mx-auto size-14 rounded-2xl bg-accent/10 text-accent grid place-items-center shadow-card-rs">
          <Icon className="size-6" />
        </div>
        <div className="mt-5 font-display font-semibold text-xl tracking-tight">{title}</div>
        <p className="mt-2 mx-auto max-w-md text-sm text-muted-foreground leading-relaxed">{description}</p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
}
