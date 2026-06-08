import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/60">
      <div className="container-rs flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-8 rounded-lg bg-primary text-primary-foreground grid place-items-center shadow-elegant">
            <Home className="size-4" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">RentSaathi</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#how" className="hover:text-foreground transition-colors">How matching works</a>
          <a href="#demo" className="hover:text-foreground transition-colors">Live demo</a>
          <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link to="/auth/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4">
            <Link to="/auth/register">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
