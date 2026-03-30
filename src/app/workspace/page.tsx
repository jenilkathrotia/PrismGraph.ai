'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GraphData, GraphNodeData, SynthesisResult, VerificationResult, InsightResult, ConfidenceMode, ActivePanel } from '@/lib/types';
import Sidebar from '@/components/sidebar/Sidebar';
import TopBar from '@/components/common/TopBar';
import GraphCanvas from '@/components/graph/GraphCanvas';
import DetailPanel from '@/components/panels/DetailPanel';
import AssistantPanel from '@/components/panels/AssistantPanel';
import VerificationPanel from '@/components/panels/VerificationPanel';
import InsightsPanel from '@/components/panels/InsightsPanel';
import UploadModal from '@/components/upload/UploadModal';

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const shouldLoadDemo = searchParams.get('demo') === 'true';

  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [confidenceMode, setConfidenceMode] = useState<ConfidenceMode>('balanced');
  const [isLoading, setIsLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<SynthesisResult | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [insights, setInsights] = useState<InsightResult[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const fetchGraph = useCallback(async () => {
    try {
      const res = await fetch('/api/graph');
      const data = await res.json();
      if (data.success && data.data) {
        setGraphData(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch graph:', err);
    }
  }, []);

  const loadDemoData = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage('Loading demo dataset...');
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('Demo data loaded! Fetching graph...');
        await fetchGraph();
        setStatusMessage('');
      } else {
        setStatusMessage('Failed to load demo data');
      }
    } catch (err) {
      console.error('Failed to seed:', err);
      setStatusMessage('Error loading demo data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchGraph]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  useEffect(() => {
    if (shouldLoadDemo && graphData.nodes.length === 0) {
      loadDemoData();
    }
  }, [shouldLoadDemo, graphData.nodes.length, loadDemoData]);

  const handleNodeClick = (node: GraphNodeData) => {
    setSelectedNode(node);
    setActivePanel('detail');
  };

  const handleAskQuestion = async (question: string) => {
    setIsLoading(true);
    setStatusMessage('RocketRide AI is analyzing the graph...');
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setLastAnswer(data.result);
        setActivePanel('assistant');
        setStatusMessage('');
      } else {
        setStatusMessage('Failed to get answer');
      }
    } catch (err) {
      console.error('Assistant error:', err);
      setStatusMessage('Error communicating with AI');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!lastAnswer) return;
    setIsLoading(true);
    setStatusMessage(`Running ${confidenceMode} verification...`);
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: lastAnswer, mode: confidenceMode }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setVerificationResult(data.result);
        setActivePanel('verification');
        setStatusMessage('');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setStatusMessage('Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    setStatusMessage('Generating graph insights...');
    try {
      const res = await fetch('/api/insights');
      const data = await res.json();
      if (data.success && data.insights) {
        setInsights(data.insights);
        setActivePanel('insights');
        setStatusMessage('');
      }
    } catch (err) {
      console.error('Insights error:', err);
      setStatusMessage('Failed to generate insights');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = () => {
    setShowUpload(false);
    fetchGraph();
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <Sidebar
        graphData={graphData}
        onLoadDemo={loadDemoData}
        onOpenUpload={() => setShowUpload(true)}
        onGenerateInsights={handleGenerateInsights}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        isLoading={isLoading}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <TopBar
          confidenceMode={confidenceMode}
          setConfidenceMode={setConfidenceMode}
          onSearch={(q) => handleAskQuestion(q)}
          graphData={graphData}
          isLoading={isLoading}
        />

        {/* Center + Right Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Graph Canvas */}
          <div className="flex-1 relative">
            <GraphCanvas
              graphData={graphData}
              onNodeClick={handleNodeClick}
              selectedNode={selectedNode}
            />

            {/* Empty state */}
            {graphData.nodes.length === 0 && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center glass-card p-12 max-w-md">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(124,77,255,0.2))' }}>
                    <svg className="w-8 h-8" style={{ color: 'var(--accent-cyan)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Graph Data Yet</h3>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                    Upload research PDFs or load the demo dataset to build your knowledge graph.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={loadDemoData}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-smooth hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #00e5ff, #7c4dff)' }}
                    >
                      Load Demo Data
                    </button>
                    <button
                      onClick={() => setShowUpload(true)}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold glass-card-sm transition-smooth hover:scale-105"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Upload PDFs
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          {activePanel && (
            <div className="w-[420px] flex-shrink-0 border-l overflow-y-auto" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}>
              {activePanel === 'detail' && selectedNode && (
                <DetailPanel node={selectedNode} onClose={() => setActivePanel(null)} />
              )}
              {activePanel === 'assistant' && (
                <AssistantPanel
                  answer={lastAnswer}
                  onAsk={handleAskQuestion}
                  onVerify={handleVerify}
                  isLoading={isLoading}
                  onClose={() => setActivePanel(null)}
                />
              )}
              {activePanel === 'verification' && (
                <VerificationPanel
                  result={verificationResult}
                  confidenceMode={confidenceMode}
                  onClose={() => setActivePanel(null)}
                />
              )}
              {activePanel === 'insights' && (
                <InsightsPanel
                  insights={insights}
                  onClose={() => setActivePanel(null)}
                />
              )}
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className="h-9 flex items-center justify-between px-4 text-xs border-t"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-4">
            <span>{graphData.nodes.length} nodes · {graphData.edges.length} edges</span>
            {statusMessage && (
              <span className="flex items-center gap-2" style={{ color: 'var(--accent-cyan)' }}>
                <span className="w-2 h-2 rounded-full pulse-glow" style={{ background: 'var(--accent-cyan)' }} />
                {statusMessage}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>Neo4j</span>
            <span>·</span>
            <span>RocketRide AI</span>
            <span>·</span>
            <span>Confidence: {confidenceMode}</span>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onComplete={handleUploadComplete}
        />
      )}
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-2 rounded-full spinner mx-auto mb-4" style={{ borderColor: 'var(--border-subtle)', borderTopColor: 'var(--accent-cyan)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading workspace...</p>
        </div>
      </div>
    }>
      <WorkspaceContent />
    </Suspense>
  );
}
