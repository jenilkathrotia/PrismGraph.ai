'use client';

import { GraphData, ActivePanel } from '@/lib/types';
import {
  Network, Upload, Database, Lightbulb, MessageSquare, 
  Shield, ChevronRight, Layers
} from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  graphData: GraphData;
  onLoadDemo: () => void;
  onOpenUpload: () => void;
  onGenerateInsights: () => void;
  activePanel: ActivePanel;
  setActivePanel: (panel: ActivePanel) => void;
  isLoading: boolean;
}

export default function Sidebar({
  graphData,
  onLoadDemo,
  onOpenUpload,
  onGenerateInsights,
  activePanel,
  setActivePanel,
  isLoading,
}: SidebarProps) {
  const navItems = [
    { id: 'assistant' as ActivePanel, icon: <MessageSquare className="w-4 h-4" />, label: 'Research Assistant', onClick: () => setActivePanel('assistant') },
    { id: 'verification' as ActivePanel, icon: <Shield className="w-4 h-4" />, label: 'Verification', onClick: () => setActivePanel('verification') },
    { id: 'insights' as ActivePanel, icon: <Lightbulb className="w-4 h-4" />, label: 'Insights', onClick: onGenerateInsights },
  ];

  // Count node types
  const typeCounts: Record<string, number> = {};
  graphData.nodes.forEach(n => {
    typeCounts[n.type] = (typeCounts[n.type] || 0) + 1;
  });

  return (
    <div className="w-[260px] flex-shrink-0 flex flex-col border-r h-full"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
      
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 px-5 py-4 border-b transition-smooth hover:opacity-80" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00e5ff, #7c4dff)' }}>
          <Network className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-sm font-bold text-white">ResearchGraph</span>
          <span className="text-xs font-medium ml-1" style={{ color: 'var(--accent-cyan)' }}>AI</span>
        </div>
      </Link>

      {/* Actions */}
      <div className="px-4 py-4 space-y-2">
        <button
          onClick={onOpenUpload}
          disabled={isLoading}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-smooth hover:scale-[1.02] disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(124,77,255,0.15))', color: 'var(--accent-cyan)', border: '1px solid var(--border-accent)' }}
        >
          <Upload className="w-4 h-4" /> Upload PDFs
        </button>
        <button
          onClick={onLoadDemo}
          disabled={isLoading}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium glass-card-sm transition-smooth hover:scale-[1.02] disabled:opacity-50"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Database className="w-4 h-4" /> Load Demo Data
        </button>
      </div>

      {/* Navigation */}
      <div className="px-4 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-muted)' }}>Tools</p>
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-smooth ${
                activePanel === item.id ? 'text-white' : ''
              }`}
              style={{
                background: activePanel === item.id ? 'rgba(0,229,255,0.1)' : 'transparent',
                color: activePanel === item.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              }}
            >
              <span className="flex items-center gap-3">{item.icon} {item.label}</span>
              <ChevronRight className="w-3 h-3 opacity-50" />
            </button>
          ))}
        </div>
      </div>

      {/* Graph Stats */}
      {graphData.nodes.length > 0 && (
        <div className="px-4 py-4 mt-auto border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: 'var(--text-muted)' }}>
            <Layers className="w-3 h-3 inline mr-1" /> Graph Overview
          </p>
          <div className="space-y-1.5">
            {Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between px-2 py-1 rounded-md text-xs" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <span className="w-2 h-2 rounded-full" style={{
                    background: type === 'paper' ? '#448aff' : type === 'author' ? '#00e676' :
                                type === 'topic' ? '#7c4dff' : type === 'method' ? '#ffab40' :
                                type === 'claim' ? '#ff5252' : type === 'dataset' ? '#ffd740' :
                                type === 'venue' ? '#00e5ff' : type === 'cluster' ? '#536dfe' :
                                type === 'keyword' ? '#78909c' : '#6366f1'
                  }} />
                  {type}
                </span>
                <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
