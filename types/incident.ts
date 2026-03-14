export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export type AgentId =
  | 'log-summary'
  | 'timeline'
  | 'severity'
  | 'monitoring'
  | 'investigation'
  | 'root-cause'
  | 'dependency-graph'
  | 'remediation'
  | 'report-generation';

export interface AgentResponse<T = unknown> {
  agent: AgentId;
  raw: string;
  parsed: T;
}

export interface LogSummary {
  totalLines: number;
  errorCount: number;
  warningCount: number;
  mainIssue: string;
}

export interface TimelineEvent {
  timestamp: string;
  event: string;
}

export interface ServiceDependency {
  service: string;
  dependsOn: string[];
}

export interface IncidentAnalysisResult {
  incidentType: string;
  severity: SeverityLevel;
  affectedService: string;
  estimatedImpact: string;
  rootCause: string;
  confidence: number;
  fixes: string[];
  prevention: string[];
  logSummary: LogSummary;
  timeline: TimelineEvent[];
  dependencyGraph: ServiceDependency[];
  incidentReport: string;
}

export interface AgentExecutionTrace {
  agent: AgentId;
  summary: string;
}

export interface IncidentHistoryEntry {
  id: string;
  timestamp: string;
  incidentType: string;
  severity: SeverityLevel;
  rootCause: string;
  status: 'resolved' | 'in-progress' | 'pending';
  affectedService: string;
}

export interface AnalyzeIncidentApiSuccess {
  success: true;
  data: IncidentAnalysisResult;
  agents: AgentExecutionTrace[];
}

export interface AnalyzeIncidentApiError {
  success: false;
  error: {
    code: 'MISSING_LOGS' | 'LLM_FAILURE' | 'ANALYSIS_TIMEOUT' | 'INTERNAL_ERROR';
    message: string;
  };
}

export type AnalyzeIncidentApiResponse = AnalyzeIncidentApiSuccess | AnalyzeIncidentApiError;
