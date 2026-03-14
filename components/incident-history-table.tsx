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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Incident {
  id: string;
  timestamp: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  rootCause: string;
  status: 'resolved' | 'in-progress' | 'pending';
}

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

export function IncidentHistoryTable() {
  const incidents: Incident[] = [
    {
      id: '1',
      timestamp: '2024-03-14 14:32 UTC',
      type: 'Database Connection Pool Exhaustion',
      severity: 'critical',
      rootCause: 'Connection leak in payment service',
      status: 'resolved',
    },
    {
      id: '2',
      timestamp: '2024-03-14 12:15 UTC',
      type: 'Memory Leak Detection',
      severity: 'high',
      rootCause: 'Unreleased event listeners',
      status: 'resolved',
    },
    {
      id: '3',
      timestamp: '2024-03-14 10:45 UTC',
      type: 'API Rate Limit Exceeded',
      severity: 'medium',
      rootCause: 'Spike in external API calls',
      status: 'in-progress',
    },
    {
      id: '4',
      timestamp: '2024-03-13 18:22 UTC',
      type: 'Disk Space Warning',
      severity: 'high',
      rootCause: 'Log rotation not configured',
      status: 'pending',
    },
    {
      id: '5',
      timestamp: '2024-03-13 15:10 UTC',
      type: 'Cache Miss Rate Spike',
      severity: 'low',
      rootCause: 'Cache invalidation after deploy',
      status: 'resolved',
    },
  ];

  return (
    <div className="border border-border/60 bg-card rounded-lg p-6">
      <h3 className="font-semibold text-foreground mb-1">Incident History</h3>
      <p className="text-sm text-muted-foreground mb-6">Recent incidents and their status</p>
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
                <TableCell className="text-sm font-medium">{incident.type}</TableCell>
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
    </div>
  );
}
