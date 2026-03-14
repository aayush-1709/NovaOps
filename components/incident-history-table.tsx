'use client';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IncidentHistoryEntry } from '@/types/incident';

const severityColors = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const statusColors = {
  resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
  'in-progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

interface IncidentHistoryTableProps {
  incidents: IncidentHistoryEntry[];
}

export function IncidentHistoryTable({ incidents }: IncidentHistoryTableProps) {
  return (
    <div className="border border-border/60 bg-card rounded-lg p-6">
      <h3 className="font-semibold text-foreground mb-1">Incident History</h3>
      <p className="text-sm text-muted-foreground mb-6">Recent incidents and their status</p>
      {incidents.length === 0 ? (
        <div className="rounded-lg border border-border/50 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          No incident history yet. Run AI Incident Analysis to create your first record.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Timestamp</TableHead>
                <TableHead className="text-muted-foreground">Incident Type</TableHead>
                <TableHead className="text-muted-foreground">Severity</TableHead>
                <TableHead className="text-muted-foreground">Root Cause</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow
                  key={incident.id}
                  className="border-border/40 hover:bg-muted/30 transition"
                >
                  <TableCell className="text-xs text-muted-foreground">
                    {incident.timestamp}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{incident.incidentType}</TableCell>
                  <TableCell>
                    <Badge className={`${severityColors[incident.severity]} border text-xs`}>
                      {incident.severity.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {incident.rootCause}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[incident.status]} border text-xs`}>
                      {incident.status === 'in-progress'
                        ? 'IN PROGRESS'
                        : incident.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
