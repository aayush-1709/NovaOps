'use client';

import { Activity, Microscope, Target, Wrench } from 'lucide-react';
import { AgentCard } from './agent-card';

interface AgentPipelineProps {
  activeAgentIndex: number | null;
  isAnalyzing: boolean;
}

const agents = [
  {
    name: 'Monitor Agent',
    description: 'Detects anomalies',
    icon: <Activity className="w-4 h-4 text-primary" />,
  },
  {
    name: 'Investigation Agent',
    description: 'Analyzes patterns',
    icon: <Microscope className="w-4 h-4 text-primary" />,
  },
  {
    name: 'Root Cause Agent',
    description: 'Identifies issues',
    icon: <Target className="w-4 h-4 text-primary" />,
  },
  {
    name: 'Remediation Agent',
    description: 'Recommends solutions',
    icon: <Wrench className="w-4 h-4 text-primary" />,
  },
];

export function AgentPipeline({ activeAgentIndex, isAnalyzing }: AgentPipelineProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground text-sm">AI Agent Pipeline</h3>
      <div className="space-y-2">
        {agents.map((agent, index) => {
          let status: 'inactive' | 'active' | 'completed' = 'inactive';
          if (isAnalyzing && activeAgentIndex !== null) {
            if (index < activeAgentIndex) status = 'completed';
            else if (index === activeAgentIndex) status = 'active';
          }

          return (
            <AgentCard
              key={index}
              {...agent}
              status={status}
            />
          );
        })}
      </div>
    </div>
  );
}
