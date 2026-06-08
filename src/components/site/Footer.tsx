import { Home } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container-rs py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
              <Home className="size-4" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-lg">RentSaathi</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-sm">
            Privacy-first rental requirement matching. Tell us what home you need — verified brokers bring it to you.
          </p>
        </div>
        <div>
          <div className="font-semibold text-sm mb-3">Product</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>How it works</li><li>Pricing</li><li>For brokers</li><li>Security</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-sm mb-3">Company</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>About</li><li>Careers</li><li>Press</li><li>Contact</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container-rs h-14 flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} RentSaathi. All rights reserved.</span>
          <span>Made with care · Privacy first</span>
        </div>
      </div>
    </footer>
  );
}
