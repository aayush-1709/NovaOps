'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { HeroHeader } from '@/components/hero-header';
import { LogUpload } from '@/components/log-upload';
import { AgentPipeline } from '@/components/agent-pipeline';
import { IncidentResults } from '@/components/incident-results';
import { IncidentHistoryTable } from '@/components/incident-history-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyzeIncidentApiResponse, IncidentAnalysisResult } from '@/lib/types';

const SAMPLE_FALLBACK_LOGS = `
Database connection timeout
Service restart failure
High CPU usage detected
`.trim();

const ANALYSIS_TIMEOUT_MS = 70_000;

export default function Home() {
  const [fileContent, setFileContent] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeAgentIndex, setActiveAgentIndex] = useState<number | null>(null);
  const [incidentData, setIncidentData] = useState<IncidentAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setIncidentData(null);
    setAnalysisError(null);
    setActiveAgentIndex(0);

    const logsToAnalyze = fileContent.trim() || SAMPLE_FALLBACK_LOGS;
    const progressInterval = window.setInterval(() => {
      setActiveAgentIndex((previous) => {
        if (previous === null) return 0;
        return Math.min(previous + 1, 3);
      });
    }, 1200);

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
      setActiveAgentIndex(3);
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
      setTimeout(() => setActiveAgentIndex(null), 500);
    }
  };

  const handleFileUpload = (content: string) => {
    setFileContent(content);
    setIncidentData(null);
    setAnalysisError(null);
    setActiveAgentIndex(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
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
              <div className="lg:col-span-1 space-y-6">
                <LogUpload
                  onFileUpload={handleFileUpload}
                  isLoading={isAnalyzing}
                  onAnalyze={runAnalysis}
                />
                <AgentPipeline activeAgentIndex={activeAgentIndex} isAnalyzing={isAnalyzing} />
              </div>

              {/* Right Panel */}
              <div className="lg:col-span-2">
                <IncidentResults
                  data={incidentData ?? undefined}
                  isLoading={isAnalyzing}
                  error={analysisError}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <IncidentHistoryTable />
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
