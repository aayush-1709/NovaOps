'use client';

import { useEffect, useRef, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { HeroHeader } from '@/components/hero-header';
import { LogUpload } from '@/components/log-upload';
import { DemoLogButtons } from '@/components/demo-log-buttons';
import { AgentPipeline } from '@/components/agent-pipeline';
import { IncidentResults } from '@/components/incident-results';
import { IncidentHistoryTable } from '@/components/incident-history-table';
import { LogSummaryCard } from '@/components/log-summary-card';
import { IncidentTimeline } from '@/components/incident-timeline';
import { ServiceDependencyGraph } from '@/components/service-dependency-graph';
import { IncidentReport } from '@/components/incident-report';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AgentExecutionTrace,
  AnalyzeIncidentApiResponse,
  IncidentAnalysisResult,
  IncidentHistoryEntry,
} from '@/types/incident';
import { DEMO_LOGS } from '@/lib/demoLogs';

const ANALYSIS_TIMEOUT_MS = 70_000;
const INCIDENT_HISTORY_KEY = 'novaops.incidentHistory';
const INCIDENT_HISTORY_LIMIT = 50;
const TOTAL_AGENT_STAGES = 9;
const FALLBACK_SAMPLE_LOGS = [
  DEMO_LOGS.databaseFailure,
  DEMO_LOGS.memoryLeak,
  DEMO_LOGS.apiTimeout,
];

export default function Home() {
  const [fileContent, setFileContent] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeAgentIndex, setActiveAgentIndex] = useState<number | null>(null);
  const [incidentData, setIncidentData] = useState<IncidentAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [agentTraces, setAgentTraces] = useState<AgentExecutionTrace[]>([]);
  const [incidentHistory, setIncidentHistory] = useState<IncidentHistoryEntry[]>([]);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const lastFallbackIndexRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(INCIDENT_HISTORY_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as IncidentHistoryEntry[];
      if (Array.isArray(parsed)) {
        setIncidentHistory(parsed);
      }
    } catch {
      setIncidentHistory([]);
    }
  }, []);

  const appendIncidentHistory = (entry: IncidentHistoryEntry) => {
    setIncidentHistory((previous) => {
      const next = [entry, ...previous].slice(0, INCIDENT_HISTORY_LIMIT);
      window.localStorage.setItem(INCIDENT_HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  };

  const getNextFallbackLogs = () => {
    if (FALLBACK_SAMPLE_LOGS.length === 1) {
      lastFallbackIndexRef.current = 0;
      return FALLBACK_SAMPLE_LOGS[0];
    }

    let nextIndex = Math.floor(Math.random() * FALLBACK_SAMPLE_LOGS.length);
    while (nextIndex === lastFallbackIndexRef.current) {
      nextIndex = Math.floor(Math.random() * FALLBACK_SAMPLE_LOGS.length);
    }
    lastFallbackIndexRef.current = nextIndex;
    return FALLBACK_SAMPLE_LOGS[nextIndex];
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setIncidentData(null);
    setAnalysisError(null);
    setAgentTraces([]);
    setActiveAgentIndex(0);

    const logsToAnalyze = fileContent.trim() || getNextFallbackLogs();
    const progressInterval = window.setInterval(() => {
      setActiveAgentIndex((previous) => {
        if (previous === null) return 0;
        return Math.min(previous + 1, TOTAL_AGENT_STAGES - 1);
      });
    }, 800);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT_MS);

    try {
      const response = await fetch('/api/analyze-incident', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: logsToAnalyze }),
        signal: controller.signal,
      });

      const payload = (await response.json()) as AnalyzeIncidentApiResponse;

      if (!response.ok || !payload.success) {
        const errorMessage = payload.success
          ? 'Incident analysis failed due to an unknown API error.'
          : payload.error.message;
        throw new Error(errorMessage);
      }

      setIncidentData(payload.data);
      setAgentTraces(payload.agents);

      const historyEntry: IncidentHistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString().replace('T', ' ').replace('Z', ' UTC'),
        incidentType: payload.data.incidentType,
        severity: payload.data.severity,
        rootCause: payload.data.rootCause,
        status: 'resolved',
        affectedService: payload.data.affectedService,
      };
      appendIncidentHistory(historyEntry);

      setActiveAgentIndex(TOTAL_AGENT_STAGES - 1);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setAnalysisError('Incident analysis request timed out. Please try again.');
      } else {
        setAnalysisError(
          error instanceof Error
            ? error.message
            : 'Incident analysis failed unexpectedly. Please retry.',
        );
      }
    } finally {
      window.clearInterval(progressInterval);
      window.clearTimeout(timeoutId);
      setIsAnalyzing(false);
      setTimeout(
        () =>
          setActiveAgentIndex((previous) =>
            previous === null ? null : TOTAL_AGENT_STAGES - 1,
          ),
        500,
      );
    }
  };

  const handleFileUpload = (content: string) => {
    setFileContent(content);
    setSelectedTemplate(null);
    setIncidentData(null);
    setAnalysisError(null);
    setAgentTraces([]);
    setActiveAgentIndex(null);
  };

  const handleSelectDemoLogs = (template: 'databaseFailure' | 'memoryLeak' | 'apiTimeout') => {
    setFileContent(DEMO_LOGS[template]);
    setSelectedTemplate(template);
    setIncidentData(null);
    setAnalysisError(null);
    setAgentTraces([]);
    setActiveAgentIndex(null);
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleNavbarNavigate = (target: 'dashboard' | 'incidents' | 'agents') => {
    if (target === 'dashboard') {
      setCurrentTab('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentTab('dashboard');
    window.setTimeout(() => {
      const sectionId = target === 'agents' ? 'agents-section' : 'incidents-section';
      scrollToSection(sectionId);
    }, 120);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onNavigate={handleNavbarNavigate} />
      <HeroHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-8">
          <TabsList className="bg-card/50 border border-border/50">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Panel */}
              <div id="agents-section" className="lg:col-span-1 space-y-6 scroll-mt-24">
                <DemoLogButtons onSelectDemoLogs={handleSelectDemoLogs} disabled={isAnalyzing} />
                {selectedTemplate && (
                  <p className="text-xs text-muted-foreground -mt-3">
                    Loaded template: <span className="font-medium">{selectedTemplate}</span>
                  </p>
                )}
                <LogUpload
                  onFileUpload={handleFileUpload}
                  isLoading={isAnalyzing}
                  onAnalyze={runAnalysis}
                />
                <AgentPipeline
                  activeAgentIndex={activeAgentIndex}
                  isAnalyzing={isAnalyzing}
                  hasCompletedRun={Boolean(incidentData)}
                  traces={agentTraces}
                />
              </div>

              {/* Right Panel */}
              <div id="incidents-section" className="lg:col-span-2 space-y-4 scroll-mt-24">
                <IncidentResults
                  data={incidentData ?? undefined}
                  isLoading={isAnalyzing}
                  error={analysisError}
                />
                {incidentData && (
                  <>
                    <LogSummaryCard summary={incidentData.logSummary} />
                    <IncidentTimeline timeline={incidentData.timeline} />
                    <ServiceDependencyGraph
                      graph={incidentData.dependencyGraph}
                      highlightedService={incidentData.affectedService}
                      rootCauseText={incidentData.rootCause}
                    />
                    <IncidentReport report={incidentData.incidentReport} />
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <IncidentHistoryTable incidents={incidentHistory} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Powered by Amazon Nova — AI Cloud Incident Intelligence
            </p>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
