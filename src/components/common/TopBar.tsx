'use client';

import { useState } from 'react';
import { Search, Zap, Scale, ShieldCheck } from 'lucide-react';
import { ConfidenceMode, GraphData } from '@/lib/types';

interface TopBarProps {
  confidenceMode: ConfidenceMode;
  setConfidenceMode: (mode: ConfidenceMode) => void;
  onSearch: (query: string) => void;
  graphData: GraphData;
  isLoading: boolean;
}

const confidenceModes: { mode: ConfidenceMode; icon: React.ReactNode; label: string; color: string }[] = [
  { mode: 'fast', icon: <Zap className="w-3.5 h-3.5" />, label: 'Fast', color: '#00e676' },
  { mode: 'balanced', icon: <Scale className="w-3.5 h-3.5" />, label: 'Balanced', color: '#ffab40' },
  { mode: 'strict', icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'Strict', color: '#ff5252' },
];

export default function TopBar({ confidenceMode, setConfidenceMode, onSearch, isLoading }: TopBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="h-14 flex items-center justify-between px-4 gap-4 border-b"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
      
      {/* Search / Ask */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a research question or search the graph..."
          disabled={isLoading}
          className="w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none transition-smooth disabled:opacity-50"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--accent-cyan)'; e.target.style.boxShadow = '0 0 0 2px rgba(0,229,255,0.1)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border-subtle)'; e.target.style.boxShadow = 'none'; }}
        />
      </form>

      {/* Confidence Mode Selector */}
      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)' }}>
        {confidenceModes.map(({ mode, icon, label, color }) => (
          <button
            key={mode}
            onClick={() => setConfidenceMode(mode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-smooth"
            style={{
              background: confidenceMode === mode ? `${color}15` : 'transparent',
              color: confidenceMode === mode ? color : 'var(--text-muted)',
              border: confidenceMode === mode ? `1px solid ${color}30` : '1px solid transparent',
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>
    </div>
  );
}
