import { motion } from "framer-motion";
import { Clock, ShieldCheck, Lock, Handshake, Zap } from "lucide-react";

const stats = [
  { icon: Clock, value: "4.2 hrs", label: "Average match time", sub: "From posting to first matched lead" },
  { icon: ShieldCheck, value: "97%", label: "Broker verification rate", sub: "Human KYC + reputation review" },
  { icon: Lock, value: "100%", label: "Contact privacy", sub: "Number hidden until you approve" },
  { icon: Handshake, value: "92%", label: "Successful connections", sub: "Requirements that find a home" },
  { icon: Zap, value: "<6 hrs", label: "Broker response time", sub: "Median first-touch on new leads" },
];

export function Stats() {
  return (
    <section id="stats" className="py-16 md:py-20">
      <div className="container-rs">
        <div className="rounded-3xl bg-primary text-primary-foreground p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="max-w-xl">
                <div className="text-xs uppercase tracking-wider text-accent font-medium">Trust, not vanity metrics</div>
                <h2 className="mt-3 font-display font-bold text-3xl md:text-4xl tracking-tight text-balance">
                  Numbers that prove the matchmaking works.
                </h2>
              </div>
              <div className="text-xs text-primary-foreground/60">
                <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-success animate-pulse" /> Live platform metrics · refreshed weekly</span>
              </div>
            </div>
            <div className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-4">
              {stats.map((st, i) => (
                <motion.div
                  key={st.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                  className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 backdrop-blur-sm"
                >
                  <st.icon className="size-4 text-accent" />
                  <div className="mt-3 font-display font-bold text-3xl md:text-4xl tracking-tight">{st.value}</div>
                  <div className="mt-1 text-xs font-medium text-primary-foreground/90">{st.label}</div>
                  <div className="mt-1 text-[11px] text-primary-foreground/50 leading-snug">{st.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
