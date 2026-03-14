'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IncidentReportProps {
  report: string;
}

function formatReportAsBlocks(report: string) {
  return report.split('\n').map((line) => line.trimEnd());
}

export function IncidentReport({ report }: IncidentReportProps) {
  const onDownload = () => {
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `incident-report-${new Date().toISOString().slice(0, 19)}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Auto Generated Incident Report</CardTitle>
        <Button variant="outline" size="sm" onClick={onDownload} disabled={!report.trim()}>
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {formatReportAsBlocks(report).map((line, index) => {
          if (line.startsWith('## ')) {
            return (
              <h3 key={index} className="text-sm font-semibold mt-3">
                {line.replace(/^##\s+/, '')}
              </h3>
            );
          }
          if (line.startsWith('# ')) {
            return (
              <h2 key={index} className="text-base font-semibold mt-4">
                {line.replace(/^#\s+/, '')}
              </h2>
            );
          }
          if (line.startsWith('- ')) {
            return (
              <p key={index} className="text-sm">
                - {line.replace(/^- /, '')}
              </p>
            );
          }
          if (!line.trim()) {
            return <div key={index} className="h-1" />;
          }
          return (
            <p key={index} className="text-sm text-muted-foreground leading-relaxed">
              {line}
            </p>
          );
        })}
      </CardContent>
    </Card>
  );
}
