'use client';

import { Zap } from 'lucide-react';

export function HeroHeader() {
  return (
    <div className="border-b border-border/40 bg-gradient-to-b from-primary/5 to-transparent py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Incident Analysis with AI
            </h1>
            <p className="mt-2 text-base text-muted-foreground max-w-2xl">
              Upload your cloud infrastructure logs and let our AI agents automatically detect incidents, analyze root causes, and recommend fixes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
