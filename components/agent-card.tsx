'use client';

import { Check, Loader2 } from 'lucide-react';

interface AgentCardProps {
  name: string;
  description: string;
  status: 'inactive' | 'active' | 'completed';
  icon: React.ReactNode;
  activity?: string;
  output?: string;
}

export function AgentCard({ name, description, status, icon, activity, output }: AgentCardProps) {
  return (
    <div className="p-4 rounded-lg border border-border/60 bg-card hover:bg-muted/30 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg mt-0.5">{icon}</div>
          <div>
            <h4 className="font-semibold text-foreground text-sm">{name}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
        <div className="flex-shrink-0">
          {status === 'inactive' && (
            <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
          )}
          {status === 'active' && (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          )}
          {status === 'completed' && (
            <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-3 h-3 text-green-600" />
            </div>
          )}
        </div>
      </div>
      {(activity || output) && (
        <div className="mt-3 space-y-1">
          {activity && <p className="text-[11px] text-primary font-medium">{activity}</p>}
          {output && <p className="text-[11px] text-muted-foreground leading-relaxed">{output}</p>}
        </div>
      )}
    </div>
  );
}
