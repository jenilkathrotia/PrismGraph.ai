'use client';

import { InsightResult } from '@/lib/types';
import { X, Lightbulb, Users, AlertTriangle, Sparkles, GitBranch, BookOpen, Database, TrendingUp } from 'lucide-react';

interface InsightsPanelProps {
  insights: InsightResult[];
  onClose: () => void;
}

const insightIcons: Record<string, React.ReactNode> = {
  influential_author: <Users className="w-4 h-4" />,
  emerging_theme: <TrendingUp className="w-4 h-4" />,
  contradiction: <AlertTriangle className="w-4 h-4" />,
  bridge_connection: <GitBranch className="w-4 h-4" />,
  common_method: <Sparkles className="w-4 h-4" />,
  foundational_paper: <BookOpen className="w-4 h-4" />,
  underexplored: <Lightbulb className="w-4 h-4" />,
  dataset_reuse: <Database className="w-4 h-4" />,
};

const insightColors: Record<string, string> = {
  influential_author: '#00e676',
  emerging_theme: '#7c4dff',
  contradiction: '#ff5252',
  bridge_connection: '#00e5ff',
  common_method: '#ffab40',
  foundational_paper: '#448aff',
  underexplored: '#ffd740',
  dataset_reuse: '#ff4081',
};

export default function InsightsPanel({ insights, onClose }: InsightsPanelProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(124,77,255,0.15)', color: 'var(--accent-violet)' }}>
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--accent-violet)' }}>Graph Intelligence</p>
            <h3 className="text-sm font-semibold text-white">Research Insights</h3>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg transition-smooth hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {insights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Lightbulb className="w-12 h-12 mb-4" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
              No insights generated yet. Load data and click Generate Insights.
            </p>
          </div>
        ) : (
          insights.sort((a, b) => b.score - a.score).map((insight, i) => {
            const color = insightColors[insight.type] || '#6366f1';
            const icon = insightIcons[insight.type] || <Sparkles className="w-4 h-4" />;

            return (
              <div key={i} className="glass-card-sm p-4 transition-smooth hover:scale-[1.01]" style={{ borderLeft: `3px solid ${color}` }}>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color }}>{icon}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>{insight.type.replace(/_/g, ' ')}</span>
                  <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-md" style={{ background: `${color}15`, color }}>
                    {(insight.score * 100).toFixed(0)}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">{insight.title}</h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{insight.description}</p>
                {insight.relatedNodes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {insight.relatedNodes.map((nodeId, j) => (
                      <span key={j} className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                        {nodeId}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
