import { callLLM } from '@/lib/llm';
import { AgentResponse, IncidentAnalysisResult } from '@/lib/types';

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

function normalizeConfidence(value: number | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 50;
  return Math.max(0, Math.min(100, Math.round(value)));
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

export async function runIncidentAnalysis(logs: string): Promise<IncidentAnalysisResult> {
  const monitoring = await monitoringAgent(logs);
  const investigation = await investigationAgent(logs);
  const rootCause = await rootCauseAgent(logs);
  const remediation = await remediationAgent(logs);

  const affectedService =
    monitoring.parsed.affectedService ||
    investigation.parsed.affectedServices[0] ||
    'Unknown service';

  return {
    incidentType: monitoring.parsed.incidentType || 'Unknown incident',
    severity: rootCause.parsed.severity,
    affectedService,
    estimatedImpact:
      monitoring.parsed.estimatedImpact ||
      investigation.parsed.summary ||
      'Impact could not be estimated',
    rootCause: rootCause.parsed.rootCause,
    confidence: rootCause.parsed.confidence,
    fixes: remediation.parsed.recommendedFixes ?? [],
    prevention: remediation.parsed.preventionSuggestions ?? [],
  };
}
