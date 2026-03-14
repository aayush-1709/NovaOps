'use client';

import { Sparkles } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="hidden sm:flex flex-col">
              <h1 className="font-bold text-lg tracking-tight text-foreground">NovaOps</h1>
              <p className="text-xs text-muted-foreground">AI Incident Commander</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition">Dashboard</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition">Incidents</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition">Agents</a>
          </nav>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
