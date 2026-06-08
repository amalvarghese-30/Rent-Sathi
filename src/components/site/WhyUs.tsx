import { motion } from "framer-motion";
import { Lock, BadgeCheck, Filter, BellOff, Zap, Users } from "lucide-react";

const items = [
  { icon: Lock, title: "Privacy first", desc: "Your number stays hidden until you approve a connection." },
  { icon: BadgeCheck, title: "Verified brokers", desc: "Manual KYC and reputation scoring on every broker." },
  { icon: Filter, title: "High-quality leads", desc: "Structured requirements that brokers actually want to serve." },
  { icon: BellOff, title: "No spam calls", desc: "Zero cold calls. Communication is gated and on your terms." },
  { icon: Zap, title: "Fast matching", desc: "Most renters see their first match within 4 hours." },
  { icon: Users, title: "Built for both sides", desc: "Renters and brokers each get a workspace tailored to them." },
];

export function WhyUs() {
  return (
    <section id="why" className="py-16 md:py-20 bg-secondary/30 border-y border-border/60">
      <div className="container-rs">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-wider text-accent font-medium">Why RentSaathi</div>
          <h2 className="mt-3 font-display font-bold text-3xl md:text-4xl tracking-tight text-balance">
            Built on trust. Tuned for signal.
          </h2>
        </div>
        <div className="mt-10 grid gap-px bg-border/60 rounded-2xl overflow-hidden border border-border/60">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
              className="bg-surface p-8 md:[&:nth-child(3n+1)]:border-l-0"
              style={{ gridColumn: "span 1 / span 1" }}
            >
              <it.icon className="size-6 text-accent" strokeWidth={2} />
              <div className="mt-5 font-display font-semibold text-lg">{it.title}</div>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`
        @media (min-width: 768px) { #why .grid.gap-px { grid-template-columns: repeat(3, 1fr); } }
      `}</style>
    </section>
  );
}
