'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IncidentAnalysisResult } from '@/types/incident';

interface LogSummaryCardProps {
  summary: IncidentAnalysisResult['logSummary'];
}

export function LogSummaryCard({ summary }: LogSummaryCardProps) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Log Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Total Log Lines</p>
          <p className="font-semibold">{summary.totalLines}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Error Count</p>
          <p className="font-semibold">{summary.errorCount}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Warning Count</p>
          <p className="font-semibold">{summary.warningCount}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Primary Issue</p>
          <p className="font-semibold text-sm">{summary.mainIssue}</p>
        </div>
      </CardContent>
    </Card>
  );
}
