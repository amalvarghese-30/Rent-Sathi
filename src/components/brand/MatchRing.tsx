import { motion } from "framer-motion";

export function MatchRing({ value, size = 72, stroke = 6, label = "match" }: { value: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} className="stroke-secondary" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          className="stroke-accent" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c - (c * value) / 100 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center leading-none">
          <div className="font-display font-bold" style={{ fontSize: size * 0.28 }}>{value}<span className="text-[0.55em] text-muted-foreground">%</span></div>
          <div className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider">{label}</div>
        </div>
      </div>
    </div>
  );
}
