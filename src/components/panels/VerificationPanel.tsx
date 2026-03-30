'use client';

import { VerificationResult, ConfidenceMode } from '@/lib/types';
import { X, Shield, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface VerificationPanelProps {
  result: VerificationResult | null;
  confidenceMode: ConfidenceMode;
  onClose: () => void;
}

export default function VerificationPanel({ result, confidenceMode, onClose }: VerificationPanelProps) {
  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8">
        <Shield className="w-12 h-12 mb-4" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
          Ask a question in the Research Assistant first, then click &quot;Verify This Answer&quot; to run verification.
        </p>
      </div>
    );
  }

  const confidenceColor = result.overallConfidence > 0.8 ? 'var(--accent-emerald)' :
                           result.overallConfidence > 0.5 ? 'var(--accent-amber)' : 'var(--accent-rose)';

  const modeConfig = {
    fast: { icon: <Shield className="w-5 h-5" />, label: 'Fast Check', color: 'var(--accent-emerald)' },
    balanced: { icon: <ShieldCheck className="w-5 h-5" />, label: 'Balanced Verification', color: 'var(--accent-amber)' },
    strict: { icon: <ShieldAlert className="w-5 h-5" />, label: 'Strict Verification', color: 'var(--accent-rose)' },
  };

  const mode = modeConfig[confidenceMode];
  const supportedClaims = result.claims.filter(c => c.supported).length;
  const totalClaims = result.claims.length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${mode.color}15`, color: mode.color }}>
            {mode.icon}
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: mode.color }}>{mode.label}</p>
            <h3 className="text-sm font-semibold text-white">Verification Results</h3>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg transition-smooth hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Overall Confidence */}
        <div className="glass-card p-5 text-center" style={{ boxShadow: `0 0 20px ${confidenceColor}15` }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Overall Confidence</p>
          <div className="text-5xl font-black font-mono mb-2" style={{ color: confidenceColor }}>
            {(result.overallConfidence * 100).toFixed(0)}%
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden mt-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${result.overallConfidence * 100}%`, background: confidenceColor }} />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="glass-card-sm p-3 text-center">
            <p className="text-lg font-bold text-white">{supportedClaims}/{totalClaims}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Supported</p>
          </div>
          <div className="glass-card-sm p-3 text-center">
            <p className="text-lg font-bold text-white">{result.contradictions.length}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Contradictions</p>
          </div>
          <div className="glass-card-sm p-3 text-center">
            <p className="text-lg font-bold text-white">{(result.evidenceCoverage * 100).toFixed(0)}%</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Coverage</p>
          </div>
        </div>

        {/* Claims Checklist */}
        {result.claims.length > 0 && (
          <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Claims Checklist</p>
            <div className="space-y-2">
              {result.claims.map((claim, i) => (
                <motion.div variants={{ hidden: { opacity: 0, x: -15 }, show: { opacity: 1, x: 0 } }} key={i} className="glass-card-sm p-3">
                  <div className="flex items-start gap-2">
                    {claim.supported ? (
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-emerald)' }} />
                    ) : (
                      <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-rose)' }} />
                    )}
                    <div className="flex-1">
                      <p className="text-xs text-white leading-relaxed">{claim.text}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {claim.evidenceCount} source{claim.evidenceCount !== 1 ? 's' : ''}
                        </span>
                        <span className="text-[10px] font-mono" style={{ color: claim.confidence > 0.7 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                          {(claim.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Contradictions */}
        {result.contradictions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--accent-rose)' }}>
              <AlertTriangle className="w-3 h-3 inline mr-1" /> Contradictions Detected
            </p>
            <div className="space-y-2">
              {result.contradictions.map((c, i) => (
                <div key={i} className="glass-card-sm p-3" style={{ borderLeft: '3px solid var(--accent-rose)' }}>
                  <div className="space-y-1.5">
                    <p className="text-xs text-white">&ldquo;{c.claim1}&rdquo; <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>({c.paper1})</span></p>
                    <p className="text-[10px] font-semibold text-center" style={{ color: 'var(--accent-rose)' }}>⚡ VS ⚡</p>
                    <p className="text-xs text-white">&ldquo;{c.claim2}&rdquo; <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>({c.paper2})</span></p>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>{c.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--accent-amber)' }}>Warnings</p>
            {result.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,171,64,0.08)' }}>
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-amber)' }} />
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{w}</p>
              </div>
            ))}
          </div>
        )}

        {/* Rationale */}
        {result.rationale && (
          <div className="glass-card-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Why This Score</p>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.rationale}</p>
          </div>
        )}
      </div>
    </div>
  );
}
