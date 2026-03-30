'use client';

import { GraphNodeData, NODE_COLORS, NODE_LABELS } from '@/lib/types';
import { X, ExternalLink, FileText, User, Tag, Wrench, MessageSquare, Database as DataIcon } from 'lucide-react';

interface DetailPanelProps {
  node: GraphNodeData;
  onClose: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  paper: <FileText className="w-5 h-5" />,
  author: <User className="w-5 h-5" />,
  topic: <Tag className="w-5 h-5" />,
  method: <Wrench className="w-5 h-5" />,
  claim: <MessageSquare className="w-5 h-5" />,
  dataset: <DataIcon className="w-5 h-5" />,
};

export default function DetailPanel({ node, onClose }: DetailPanelProps) {
  const color = NODE_COLORS[node.type] || '#6366f1';
  const props = node.properties;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20`, color }}>
            {iconMap[node.type] || <FileText className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>{NODE_LABELS[node.type]}</p>
            <h3 className="text-base font-semibold text-white truncate max-w-[280px]">{node.label}</h3>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg transition-smooth hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Properties */}
        {Object.entries(props).map(([key, value]) => {
          if (key === 'id' || key === 'createdAt' || !value) return null;
          const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
          const strValue = String(value);

          return (
            <div key={key} className="glass-card-sm p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{displayKey}</p>
              {strValue.length > 100 ? (
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{strValue}</p>
              ) : (
                <p className="text-sm font-medium text-white">{strValue}</p>
              )}
            </div>
          );
        })}

        {/* DOI link */}
        {Boolean(props.doi) && String(props.doi).length > 0 && (
          <a
            href={`https://doi.org/${props.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-smooth hover:scale-[1.02]"
            style={{ background: 'rgba(0,229,255,0.1)', color: 'var(--accent-cyan)', border: '1px solid var(--border-accent)' }}
          >
            <ExternalLink className="w-4 h-4" />
            View on DOI
          </a>
        )}

        {/* Confidence for claims */}
        {node.type === 'claim' && Boolean(props.confidence) && (
          <div className="glass-card-sm p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Confidence</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Number(props.confidence) * 100}%`,
                    background: Number(props.confidence) > 0.8 ? '#00e676' : Number(props.confidence) > 0.5 ? '#ffab40' : '#ff5252',
                  }}
                />
              </div>
              <span className="text-sm font-mono font-bold text-white">{(Number(props.confidence) * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
