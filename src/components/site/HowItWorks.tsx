import { motion } from "framer-motion";
import { FileText, Sparkles, ShieldCheck, MessageCircle, ArrowDown } from "lucide-react";

const steps = [
  { icon: FileText, title: "Post Requirement", desc: "Share budget, area, and lifestyle — 60 seconds, zero spam fields.", n: "01", color: "bg-primary text-primary-foreground" },
  { icon: Sparkles, title: "AI Matching", desc: "Our engine ranks properties by budget fit, location, and lifestyle compatibility.", n: "02", color: "bg-accent text-accent-foreground" },
  { icon: ShieldCheck, title: "Admin Verification", desc: "Every broker and listing is human-reviewed before any contact is unlocked.", n: "03", color: "bg-primary text-primary-foreground" },
  { icon: MessageCircle, title: "Secure Connection", desc: "You approve who reaches you. Contact stays private until you say yes.", n: "04", color: "bg-accent text-accent-foreground" },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-16 md:py-20 border-t border-border/60 bg-secondary/30">
      <div className="container-rs">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-wider text-accent font-medium">The matchmaking flow</div>
          <h2 className="mt-3 font-display font-bold text-3xl md:text-4xl tracking-tight text-balance">
            Not a listings site. A matchmaker for rentals.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Post once. Our engine scores every property against your requirement. Admin verifies the broker. You approve the connection.
          </p>
        </div>

        <div className="mt-12 relative">
          {/* Vertical flow on mobile, horizontal connector on desktop */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="grid gap-6 lg:gap-4 lg:grid-cols-4 relative">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative"
              >
                <div className="flex justify-center">
                  <div className={`relative size-24 rounded-2xl ${s.color} grid place-items-center shadow-elegant ring-8 ring-background`}>
                    <s.icon className="size-9" strokeWidth={1.75} />
                    <div className="absolute -top-2 -right-2 size-7 rounded-full bg-surface border border-border grid place-items-center font-display font-bold text-[11px]">{s.n}</div>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <div className="font-display font-semibold text-lg">{s.title}</div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-[240px] mx-auto">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-2">
                    <ArrowDown className="size-5 text-muted-foreground/40" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
