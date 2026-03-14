'use client';

import { Activity, Microscope, Target, Wrench } from 'lucide-react';
import { AgentCard } from './agent-card';
import { AgentExecutionTrace, AgentId } from '@/types/incident';

interface AgentPipelineProps {
  activeAgentIndex: number | null;
  isAnalyzing: boolean;
  hasCompletedRun?: boolean;
  traces?: AgentExecutionTrace[];
}

const agents = [
  {
    id: 'log-summary' as const,
    name: 'Log Summary Agent',
    description: 'Extracts core stats',
    icon: <Activity className="w-4 h-4 text-primary" />,
  },
  {
    id: 'timeline' as const,
    name: 'Timeline Agent',
    description: 'Reconstructs event flow',
    icon: <Microscope className="w-4 h-4 text-primary" />,
  },
  {
    id: 'severity' as const,
    name: 'Severity Agent',
    description: 'Classifies urgency',
    icon: <Target className="w-4 h-4 text-primary" />,
  },
  {
    id: 'monitoring' as const,
    name: 'Monitor Agent',
    description: 'Detects anomalies',
    icon: <Activity className="w-4 h-4 text-primary" />,
  },
  {
    id: 'investigation' as const,
    name: 'Investigation Agent',
    description: 'Analyzes patterns',
    icon: <Microscope className="w-4 h-4 text-primary" />,
  },
  {
    id: 'root-cause' as const,
    name: 'Root Cause Agent',
    description: 'Identifies issues',
    icon: <Target className="w-4 h-4 text-primary" />,
  },
  {
    id: 'dependency-graph' as const,
    name: 'Dependency Graph Agent',
    description: 'Maps service links',
    icon: <Microscope className="w-4 h-4 text-primary" />,
  },
  {
    id: 'remediation' as const,
    name: 'Remediation Agent',
    description: 'Recommends solutions',
    icon: <Wrench className="w-4 h-4 text-primary" />,
  },
  {
    id: 'report-generation' as const,
    name: 'Report Agent',
    description: 'Builds incident report',
    icon: <Wrench className="w-4 h-4 text-primary" />,
  },
];

export function AgentPipeline({
  activeAgentIndex,
  isAnalyzing,
  hasCompletedRun = false,
  traces = [],
}: AgentPipelineProps) {
  const traceMap = traces.reduce<Record<AgentId, string | undefined>>((acc, trace) => {
    acc[trace.agent] = trace.summary;
    return acc;
  }, {
    'log-summary': undefined,
    timeline: undefined,
    severity: undefined,
    monitoring: undefined,
    investigation: undefined,
    'root-cause': undefined,
    'dependency-graph': undefined,
    remediation: undefined,
    'report-generation': undefined,
  });

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground text-sm">AI Agent Pipeline</h3>
      <p className="text-xs text-muted-foreground">
        {isAnalyzing
          ? 'NovaOps agents are actively analyzing the incident...'
          : hasCompletedRun
            ? 'Analysis complete. Review each agent output below.'
            : 'Agents are idle. Start analysis to run the pipeline.'}
      </p>
      <div className="space-y-2">
        {agents.map((agent, index) => {
          let status: 'inactive' | 'active' | 'completed' = 'inactive';
          if (isAnalyzing && activeAgentIndex !== null) {
            if (index < activeAgentIndex) status = 'completed';
            else if (index === activeAgentIndex) status = 'active';
          } else if (hasCompletedRun) {
            status = 'completed';
          }

          return (
            <AgentCard
              key={index}
              name={agent.name}
              description={agent.description}
              icon={agent.icon}
              status={status}
              activity={
                status === 'active'
                  ? `Running ${agent.name}...`
                  : status === 'completed'
                    ? `${agent.name} completed`
                    : undefined
              }
              output={traceMap[agent.id]}
            />
          );
        })}
      </div>
    </div>
  );
}
