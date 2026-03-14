import { NextResponse } from 'next/server';
import { runIncidentAnalysis } from '@/lib/agents';
import { AnalyzeIncidentApiError, AnalyzeIncidentApiSuccess } from '@/types/incident';

const ANALYSIS_TIMEOUT_MS = 60_000;

function errorResponse(
  code: AnalyzeIncidentApiError['error']['code'],
  message: string,
  status: number,
) {
  return NextResponse.json<AnalyzeIncidentApiError>(
    {
      success: false,
      error: { code, message },
    },
    { status },
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { logs?: string };
    const logs = body?.logs?.trim();

    if (!logs) {
      return errorResponse('MISSING_LOGS', 'Request body must include non-empty logs.', 400);
    }

    const analysis = await Promise.race([
      runIncidentAnalysis(logs),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Analysis timed out.')), ANALYSIS_TIMEOUT_MS),
      ),
    ]);

    return NextResponse.json<AnalyzeIncidentApiSuccess>({
      success: true,
      data: analysis.result,
      agents: analysis.agents,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error.';
    if (message.toLowerCase().includes('timed out')) {
      return errorResponse('ANALYSIS_TIMEOUT', 'AI analysis exceeded timeout limit.', 504);
    }
    if (message.toLowerCase().includes('bedrock') || message.toLowerCase().includes('llm')) {
      return errorResponse('LLM_FAILURE', message, 502);
    }
    return errorResponse('INTERNAL_ERROR', message, 500);
  }
}
