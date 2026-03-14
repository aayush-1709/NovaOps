'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimelineEvent } from '@/types/incident';

interface IncidentTimelineProps {
  timeline: TimelineEvent[];
}

export function IncidentTimeline({ timeline }: IncidentTimelineProps) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Incident Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">No timeline events were extracted.</p>
          ) : (
            timeline.map((item, index) => (
              <div key={`${item.timestamp}-${index}`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1" />
                  {index < timeline.length - 1 && <div className="w-px h-8 bg-border mt-1" />}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                  <p className="text-sm">{item.event}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
