import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Circle } from "lucide-react";

export type TimelineStep = {
  title: string;
  description?: string;
  status: "done" | "active" | "pending";
  meta?: string;
};

export function StatusTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="relative">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        const Icon = s.status === "done" ? CheckCircle2 : s.status === "active" ? Loader2 : Circle;
        const ring =
          s.status === "done"
            ? "bg-success/15 text-success border-success/30"
            : s.status === "active"
            ? "bg-accent/15 text-accent border-accent/30"
            : "bg-secondary text-muted-foreground border-border";
        return (
          <motion.li
            key={s.title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            className="relative pl-12 pb-7 last:pb-0"
          >
            {!last && (
              <span
                className={`absolute left-[15px] top-8 bottom-0 w-px ${
                  s.status === "done" ? "bg-success/40" : "bg-border"
                }`}
              />
            )}
            <span className={`absolute left-0 top-0 size-8 rounded-full grid place-items-center border ${ring}`}>
              <Icon className={`size-4 ${s.status === "active" ? "animate-spin" : ""}`} />
            </span>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="font-medium text-sm">{s.title}</div>
              {s.meta && <div className="text-[11px] text-muted-foreground">{s.meta}</div>}
            </div>
            {s.description && (
              <div className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-md">{s.description}</div>
            )}
          </motion.li>
        );
      })}
    </ol>
  );
}
