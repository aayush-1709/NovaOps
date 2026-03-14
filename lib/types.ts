export interface AgentResponse<T = unknown> {
  agent: 'monitoring' | 'investigation' | 'root-cause' | 'remediation';
  raw: string;
  parsed: T;
}

export interface IncidentAnalysisResult {
  incidentType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedService: string;
  estimatedImpact: string;
  rootCause: string;
  confidence: number;
  fixes: string[];
  prevention: string[];
}

export interface AnalyzeIncidentApiSuccess {
  success: true;
  data: IncidentAnalysisResult;
}

export interface AnalyzeIncidentApiError {
  success: false;
  error: {
    code: 'MISSING_LOGS' | 'LLM_FAILURE' | 'ANALYSIS_TIMEOUT' | 'INTERNAL_ERROR';
    message: string;
  };
}

export type AnalyzeIncidentApiResponse = AnalyzeIncidentApiSuccess | AnalyzeIncidentApiError;
