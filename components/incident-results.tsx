'use client';

import { AlertCircle, Zap, Target, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { IncidentAnalysisResult } from '@/lib/types';

interface IncidentResultsProps {
  data?: IncidentAnalysisResult;
  isLoading?: boolean;
  error?: string | null;
}

const severityColors = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export function IncidentResults({ data, isLoading, error }: IncidentResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border border-border/60 bg-card rounded-lg p-6">
            <div className="h-20 bg-muted/20 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 border border-border/60 rounded-lg bg-muted/10 px-4">
        <div className="text-center max-w-lg">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground">
            {error || 'No incident analysis yet. Upload logs to begin.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-border/60 bg-card rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Incident Summary</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Incident Type</p>
            <p className="font-semibold text-sm">{data.incidentType}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Severity Level</p>
            <Badge className={`${severityColors[data.severity]} border`}>
              {data.severity.toUpperCase()}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Affected Service</p>
            <p className="font-semibold text-sm">{data.affectedService}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Estimated Impact</p>
            <p className="font-semibold text-sm">{data.estimatedImpact}</p>
          </div>
        </div>
      </div>

      <div className="border border-border/60 bg-card rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Root Cause Analysis</h3>
        </div>
        <p className="text-sm leading-relaxed mb-4">{data.rootCause}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Confidence Score</span>
            <span className="font-semibold">{data.confidence}%</span>
          </div>
          <Progress value={data.confidence} className="h-2" />
        </div>
      </div>

      <div className="border border-border/60 bg-card rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Recommended Fix</h3>
        </div>
        <ol className="space-y-2">
          {data.fixes.map((fix, index) => (
            <li key={index} className="flex gap-3">
              <span className="font-semibold text-primary flex-shrink-0">{index + 1}.</span>
              <span className="text-sm">{fix}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="border border-border/60 bg-card rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Prevention Suggestions</h3>
        </div>
        <ul className="space-y-2">
          {data.prevention.map((suggestion, index) => (
            <li key={index} className="flex gap-3 items-start">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span className="text-sm">{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
