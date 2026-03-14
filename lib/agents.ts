import { callLLM } from '@/lib/llm';
import { AgentExecutionTrace, AgentResponse, IncidentAnalysisResult, SeverityLevel } from '@/types/incident';

type MonitoringResult = {
  incidentType: string;
  affectedService: string;
  estimatedImpact: string;
};

type InvestigationResult = {
  errorMessages: string[];
  affectedServices: string[];
  summary: string;
};

type RootCauseResult = {
  rootCause: string;
  severity: IncidentAnalysisResult['severity'];
  confidence: number;
};

type RemediationResult = {
  recommendedFixes: string[];
  preventionSuggestions: string[];
};

type LogSummaryResult = {
  totalLines: number;
  errorCount: number;
  warningCount: number;
  mainIssue: string;
  affectedService: string;
};

type SeverityResult = {
  severity: SeverityLevel;
  explanation: string;
};

const SYSTEM_RULES = `
You are an SRE incident analysis specialist.
Return strict JSON only. Do not use markdown.
Keep responses concise and deterministic.
If uncertain, use the best evidence from logs and set lower confidence.
`.trim();

function extractJsonBlock(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  return raw.trim();
}

function parseJsonSafe<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(extractJsonBlock(raw)) as T;
  } catch {
    return fallback;
  }
}

function normalizeSeverity(
  severity: string | undefined,
): IncidentAnalysisResult['severity'] {
  const normalized = (severity ?? '').toLowerCase();
  if (normalized === 'critical') return 'critical';
  if (normalized === 'high') return 'high';
  if (normalized === 'medium') return 'medium';
  return 'low';
}

function normalizeTimeline(events: Array<{ timestamp?: string; event?: string }>): IncidentAnalysisResult['timeline'] {
  return events
    .filter((item) => (item.event ?? '').trim().length > 0)
    .slice(0, 10)
    .map((item) => ({
      timestamp: item.timestamp?.trim() || 'unknown',
      event: item.event?.trim() || 'Unknown event',
    }));
}

function normalizeGraph(
  graph: Array<{ service?: string; dependsOn?: string[] }>,
): IncidentAnalysisResult['dependencyGraph'] {
  return graph
    .filter((item) => (item.service ?? '').trim().length > 0)
    .map((item) => ({
      service: item.service!.trim(),
      dependsOn: Array.isArray(item.dependsOn)
        ? item.dependsOn.filter((dep) => dep.trim().length > 0).map((dep) => dep.trim())
        : [],
    }));
}

function normalizeConfidence(value: number | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 50;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export async function logSummaryAgent(logs: string): Promise<AgentResponse<LogSummaryResult>> {
  const prompt = `
${SYSTEM_RULES}

Task: Analyze logs and provide summary statistics.
Return JSON with this exact schema:
{
  "totalLines": 0,
  "errorCount": 0,
  "warningCount": 0,
  "mainIssue": "string",
  "affectedService": "string"
}

Logs:
${logs}
`.trim();

  const raw = await callLLM(prompt);
  const lineCount = logs.split(/\r?\n/).filter((line) => line.trim().length > 0).length;
  const parsed = parseJsonSafe<LogSummaryResult>(raw, {
    totalLines: lineCount,
    errorCount: 0,
    warningCount: 0,
    mainIssue: 'Issue needs deeper investigation.',
    affectedService: 'Unknown service',
  });

  return {
    agent: 'log-summary',
    raw,
    parsed: {
      totalLines: Math.max(1, parsed.totalLines || lineCount || 1),
      errorCount: Math.max(0, parsed.errorCount || 0),
      warningCount: Math.max(0, parsed.warningCount || 0),
      mainIssue: parsed.mainIssue || 'Issue needs deeper investigation.',
      affectedService: parsed.affectedService || 'Unknown service',
    },
  };
}

export async function timelineAgent(
  logs: string,
): Promise<AgentResponse<IncidentAnalysisResult['timeline']>> {
  const prompt = `
${SYSTEM_RULES}

Task: Reconstruct the sequence of important events from logs.
Return JSON array with this schema:
[
  { "timestamp": "string", "event": "string" }
]

Rules:
- Chronological order
- Maximum 10 events
- Keep each event short and factual

Logs:
${logs}
`.trim();

  const raw = await callLLM(prompt);
  const parsed = parseJsonSafe<Array<{ timestamp?: string; event?: string }>>(raw, []);

  return {
    agent: 'timeline',
    raw,
    parsed: normalizeTimeline(parsed),
  };
}

export async function severityAgent(logs: string): Promise<AgentResponse<SeverityResult>> {
  const prompt = `
${SYSTEM_RULES}

Task: Classify incident severity.
Return JSON with this exact schema:
{
  "severity": "critical|high|medium|low",
  "explanation": "string"
}

Consider:
- error frequency
- service impact
- system instability

Logs:
${logs}
`.trim();

  const raw = await callLLM(prompt);
  const parsed = parseJsonSafe<SeverityResult>(raw, {
    severity: 'low',
    explanation: 'Not enough clear evidence of widespread impact.',
  });

  return {
    agent: 'severity',
    raw,
    parsed: {
      severity: normalizeSeverity(parsed.severity),
      explanation: parsed.explanation || 'Severity classification unavailable.',
    },
  };
}

export async function monitoringAgent(logs: string): Promise<AgentResponse<MonitoringResult>> {
  const prompt = `
${SYSTEM_RULES}

Task: Detect anomalies in these logs.
Return JSON with this exact schema:
{
  "incidentType": "string",
  "affectedService": "string",
  "estimatedImpact": "string"
}

Focus on:
- unusual patterns
- error spikes
- failing services

Logs:
${logs}
`.trim();

  const raw = await callLLM(prompt);
  const parsed = parseJsonSafe<MonitoringResult>(raw, {
    incidentType: 'Unknown incident pattern',
    affectedService: 'Unknown service',
    estimatedImpact: 'Impact not clearly identifiable from logs',
  });

  return {
    agent: 'monitoring',
    raw,
    parsed,
  };
}

export async function investigationAgent(
  logs: string,
): Promise<AgentResponse<InvestigationResult>> {
  const prompt = `
${SYSTEM_RULES}

Task: Investigate what technical issue is happening.
Return JSON with this exact schema:
{
  "errorMessages": ["string"],
  "affectedServices": ["string"],
  "summary": "string"
}

Focus on:
- concrete error messages
- affected services
- concise technical summary

Logs:
${logs}
`.trim();

  const raw = await callLLM(prompt);
  const parsed = parseJsonSafe<InvestigationResult>(raw, {
    errorMessages: [],
    affectedServices: [],
    summary: 'Unable to extract detailed technical summary from logs.',
  });

  return {
    agent: 'investigation',
    raw,
    parsed,
  };
}

export async function rootCauseAgent(logs: string): Promise<AgentResponse<RootCauseResult>> {
  const prompt = `
${SYSTEM_RULES}

Task: Determine the root cause.
Return JSON with this exact schema:
{
  "rootCause": "string",
  "severity": "critical|high|medium|low",
  "confidence": 0-100
}

Focus on:
- underlying failure
- incident severity
- realistic confidence score

Logs:
${logs}
`.trim();

  const raw = await callLLM(prompt);
  const parsed = parseJsonSafe<RootCauseResult>(raw, {
    rootCause: 'Root cause is inconclusive from available logs.',
    severity: 'low',
    confidence: 40,
  });

  return {
    agent: 'root-cause',
    raw,
    parsed: {
      rootCause: parsed.rootCause,
      severity: normalizeSeverity(parsed.severity),
      confidence: normalizeConfidence(parsed.confidence),
    },
  };
}

export async function remediationAgent(
  logs: string,
): Promise<AgentResponse<RemediationResult>> {
  const prompt = `
${SYSTEM_RULES}

Task: Recommend remediation and prevention.
Return JSON with this exact schema:
{
  "recommendedFixes": ["string"],
  "preventionSuggestions": ["string"]
}

Focus on:
- practical remediation steps
- prevention strategies to reduce recurrence

Logs:
${logs}
`.trim();

  const raw = await callLLM(prompt);
  const parsed = parseJsonSafe<RemediationResult>(raw, {
    recommendedFixes: ['Collect more logs and restart affected services safely.'],
    preventionSuggestions: ['Add alerting and runbooks for the affected service.'],
  });

  return {
    agent: 'remediation',
    raw,
    parsed,
  };
}

export async function dependencyGraphAgent(
  logs: string,
): Promise<AgentResponse<IncidentAnalysisResult['dependencyGraph']>> {
  const prompt = `
${SYSTEM_RULES}

Task: Infer directed service dependency graph from logs.
Return JSON array with this schema:
[
  { "service": "string", "dependsOn": ["string"] }
]

Rules:
- Include only services mentioned or strongly implied by logs
- Keep dependencies directional (A dependsOn B)
- Avoid duplicates

Logs:
${logs}
`.trim();

  const raw = await callLLM(prompt);
  const parsed = parseJsonSafe<Array<{ service?: string; dependsOn?: string[] }>>(raw, []);

  return {
    agent: 'dependency-graph',
    raw,
    parsed: normalizeGraph(parsed),
  };
}

export async function incidentReportAgent(
  data: IncidentAnalysisResult,
): Promise<AgentResponse<string>> {
  const prompt = `
You are an incident manager. Write a concise professional markdown incident report.
Use the following sections exactly:
- Incident Summary
- Root Cause
- Impact
- Remediation Steps
- Prevention Strategies

Use this JSON context:
${JSON.stringify(data, null, 2)}
`.trim();

  const raw = await callLLM(prompt);
  return {
    agent: 'report-generation',
    raw,
    parsed: raw,
  };
}

export interface RunIncidentAnalysisResponse {
  result: IncidentAnalysisResult;
  agents: AgentExecutionTrace[];
}

export async function runIncidentAnalysis(logs: string): Promise<RunIncidentAnalysisResponse> {
  const lineCount = logs.split(/\r?\n/).filter((line) => line.trim().length > 0).length;

  const logSummary = await logSummaryAgent(logs).catch(() => ({
    agent: 'log-summary' as const,
    raw: '',
    parsed: {
      totalLines: Math.max(1, lineCount),
      errorCount: 0,
      warningCount: 0,
      mainIssue: 'Unable to summarize logs due to LLM failure.',
      affectedService: 'Unknown service',
    },
  }));
  const timeline = await timelineAgent(logs).catch(() => ({
    agent: 'timeline' as const,
    raw: '',
    parsed: [{ timestamp: 'unknown', event: 'Timeline reconstruction unavailable due to LLM failure.' }],
  }));
  const severity = await severityAgent(logs).catch(() => ({
    agent: 'severity' as const,
    raw: '',
    parsed: {
      severity: 'medium' as SeverityLevel,
      explanation: 'Fallback severity due to classifier failure.',
    },
  }));
  const monitoring = await monitoringAgent(logs).catch(() => ({
    agent: 'monitoring' as const,
    raw: '',
    parsed: {
      incidentType: 'Unknown incident',
      affectedService: 'Unknown service',
      estimatedImpact: 'Impact unavailable due to LLM failure.',
    },
  }));
  const investigation = await investigationAgent(logs).catch(() => ({
    agent: 'investigation' as const,
    raw: '',
    parsed: {
      errorMessages: [],
      affectedServices: [],
      summary: 'Investigation unavailable due to LLM failure.',
    },
  }));
  const rootCause = await rootCauseAgent(logs).catch(() => ({
    agent: 'root-cause' as const,
    raw: '',
    parsed: {
      rootCause: 'Root cause unavailable due to LLM failure.',
      severity: 'medium' as SeverityLevel,
      confidence: 40,
    },
  }));
  const dependencyGraph = await dependencyGraphAgent(logs).catch(() => ({
    agent: 'dependency-graph' as const,
    raw: '',
    parsed: [],
  }));
  const remediation = await remediationAgent(logs).catch(() => ({
    agent: 'remediation' as const,
    raw: '',
    parsed: {
      recommendedFixes: ['Retry analysis and inspect critical services manually.'],
      preventionSuggestions: ['Add alerting and synthetic monitoring for earlier detection.'],
    },
  }));

  const affectedService =
    logSummary.parsed.affectedService ||
    monitoring.parsed.affectedService ||
    investigation.parsed.affectedServices[0] ||
    'Unknown service';

  const partialResult: IncidentAnalysisResult = {
    incidentType: monitoring.parsed.incidentType || 'Unknown incident',
    severity: severity.parsed.severity || rootCause.parsed.severity,
    affectedService,
    estimatedImpact:
      monitoring.parsed.estimatedImpact ||
      investigation.parsed.summary ||
      'Impact could not be estimated',
    rootCause: rootCause.parsed.rootCause,
    confidence: rootCause.parsed.confidence,
    fixes: remediation.parsed.recommendedFixes ?? [],
    prevention: remediation.parsed.preventionSuggestions ?? [],
    logSummary: {
      totalLines: logSummary.parsed.totalLines,
      errorCount: logSummary.parsed.errorCount,
      warningCount: logSummary.parsed.warningCount,
      mainIssue: logSummary.parsed.mainIssue,
    },
    timeline: timeline.parsed,
    dependencyGraph: dependencyGraph.parsed,
    incidentReport: '',
  };

  const report = await incidentReportAgent(partialResult).catch(() => ({
    agent: 'report-generation' as const,
    raw: '',
    parsed: `# Incident Report

## Incident Summary
Automatic report generation failed. Using fallback summary.

## Root Cause
${partialResult.rootCause}

## Impact
${partialResult.estimatedImpact}

## Remediation Steps
- ${partialResult.fixes[0] ?? 'Investigate impacted services and restore normal operations.'}

## Prevention Strategies
- ${partialResult.prevention[0] ?? 'Add additional observability and runbook coverage.'}`,
  }));
  const result: IncidentAnalysisResult = {
    ...partialResult,
    incidentReport: report.parsed,
  };

  const agents: AgentExecutionTrace[] = [
    {
      agent: 'log-summary',
      summary: `Summarized ${result.logSummary.totalLines} lines (${result.logSummary.errorCount} errors, ${result.logSummary.warningCount} warnings).`,
    },
    {
      agent: 'timeline',
      summary: `Reconstructed ${result.timeline.length} key timeline events.`,
    },
    {
      agent: 'severity',
      summary: `Classified severity as ${result.severity.toUpperCase()}: ${severity.parsed.explanation}`,
    },
    {
      agent: 'monitoring',
      summary: `Detected ${result.incidentType} impacting ${result.affectedService}.`,
    },
    {
      agent: 'investigation',
      summary: investigation.parsed.summary || 'Investigation summary not available.',
    },
    {
      agent: 'root-cause',
      summary: `${result.rootCause} (severity: ${result.severity}, confidence: ${result.confidence}%).`,
    },
    {
      agent: 'dependency-graph',
      summary: `Inferred ${result.dependencyGraph.length} service nodes for dependency mapping.`,
    },
    {
      agent: 'remediation',
      summary:
        remediation.parsed.recommendedFixes?.[0] ??
        'Generated remediation and prevention recommendations.',
    },
    {
      agent: 'report-generation',
      summary: 'Generated markdown incident report for download.',
    },
  ];

  return { result, agents };
}
