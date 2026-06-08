import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const quotes = [
  {
    q: "I posted my requirement on Tuesday. By Friday I had three matched 1BHKs in Nerul — no cold calls, no scrolling.",
    role: "Software Engineer",
    city: "Navi Mumbai",
    initials: "SR",
    tint: "bg-primary text-primary-foreground",
  },
  {
    q: "Lead quality is the best I've worked with. Verified intent, real budgets. I close 1 in 3 matches now.",
    role: "Verified Broker",
    city: "Mumbai",
    initials: "VB",
    tint: "bg-accent text-accent-foreground",
  },
  {
    q: "Finally a rental platform that respects my phone number. Brokers reach me only after I approve.",
    role: "Postgraduate Student",
    city: "Pune",
    initials: "PS",
    tint: "bg-primary text-primary-foreground",
  },
];

export function Testimonials() {
  return (
    <section className="py-16 md:py-20 border-t border-border/60">
      <div className="container-rs">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-wider text-accent font-medium">Loved by both sides of the rental</div>
          <h2 className="mt-3 font-display font-bold text-3xl md:text-4xl tracking-tight text-balance">
            Renters get matched. Brokers get signal.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {quotes.map((t, i) => (
            <motion.figure
              key={t.role + t.city}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="rounded-2xl border border-border bg-surface p-7 shadow-card-rs relative"
            >
              <Quote className="size-5 text-accent/50 absolute top-5 right-5" />
              <blockquote className="font-display text-[17px] leading-snug text-balance">"{t.q}"</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className={`size-10 rounded-full ${t.tint} grid place-items-center font-semibold text-sm`}>{t.initials}</div>
                <div>
                  <div className="text-sm font-semibold">{t.role}</div>
                  <div className="text-xs text-muted-foreground">{t.city}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
