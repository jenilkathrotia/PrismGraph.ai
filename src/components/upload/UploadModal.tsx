'use client';

import { useState, useCallback } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

interface UploadModalProps {
  onClose: () => void;
  onComplete: () => void;
}

type UploadState = 'idle' | 'uploading' | 'extracting' | 'building' | 'complete' | 'error';

const stageLabels: Record<UploadState, string> = {
  idle: 'Ready to upload',
  uploading: 'Uploading PDF...',
  extracting: 'RocketRide AI extracting entities...',
  building: 'Building knowledge graph in Neo4j...',
  complete: 'Paper added to graph!',
  error: 'Upload failed',
};

export default function UploadModal({ onClose, onComplete }: UploadModalProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [extractionPreview, setExtractionPreview] = useState<Record<string, unknown> | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setError('Only PDF files are accepted');
      setState('error');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('File too large. Maximum size: 20MB');
      setState('error');
      return;
    }

    setFileName(file.name);
    setState('uploading');
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      setState('uploading');
      
      // Cinematic demo delays to ensure the user sees the pipeline stages
      await new Promise(r => setTimeout(r, 800));
      setState('extracting');
      
      // Start the actual fetch
      const fetchPromise = fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      await new Promise(r => setTimeout(r, 1200));
      setState('building');
      
      const res = await fetchPromise;
      const data = await res.json();

      // Guarantee 'building' stage is visible briefly if fetch was instantly mocked
      await new Promise(r => setTimeout(r, 1000));

      if (data.success) {
        setState('complete');
        if (data.extraction) {
          setExtractionPreview(data.extraction as Record<string, unknown>);
        }
        setTimeout(onComplete, 1800);
      } else {
        setState('error');
        setError(data.error || 'Upload failed');
      }
    } catch {
      setState('error');
      setError('Network error. Please try again.');
    }
  }, [onComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const stages: UploadState[] = ['uploading', 'extracting', 'building', 'complete'];
  const currentStageIdx = stages.indexOf(state);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="glass-card w-full max-w-lg mx-4 overflow-hidden"
        style={{ boxShadow: '0 0 60px rgba(0,229,255,0.1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <Upload className="w-5 h-5" style={{ color: 'var(--accent-cyan)' }} />
            <h3 className="text-base font-semibold text-white">Upload Research Paper</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-smooth hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {state === 'idle' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-smooth cursor-pointer ${dragActive ? 'scale-[1.02]' : ''}`}
              style={{
                borderColor: dragActive ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                background: dragActive ? 'rgba(0,229,255,0.05)' : 'rgba(255,255,255,0.02)',
              }}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'rgba(0,229,255,0.1)' }}>
                <FileText className="w-8 h-8" style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <p className="text-sm font-medium text-white mb-1">Drop a PDF here or click to browse</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Max 20MB · PDF only</p>
              <input id="file-input" type="file" accept=".pdf" className="hidden" onChange={handleInputChange} />
            </div>
          )}

          {state !== 'idle' && state !== 'error' && (
            <div className="space-y-4">
              {/* File name */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <FileText className="w-5 h-5" style={{ color: 'var(--accent-cyan)' }} />
                <span className="text-sm text-white truncate">{fileName}</span>
              </div>

              {/* Progress stages */}
              <div className="space-y-2">
                {stages.map((stage, i) => {
                  const isActive = i === currentStageIdx;
                  const isComplete = i < currentStageIdx;
                  const isPending = i > currentStageIdx;

                  return (
                    <div key={stage} className="flex items-center gap-3 px-4 py-2 rounded-lg" style={{
                      background: isActive ? 'rgba(0,229,255,0.08)' : 'transparent',
                      opacity: isPending ? 0.4 : 1,
                    }}>
                      {isComplete && <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-emerald)' }} />}
                      {isActive && <Loader className="w-4 h-4 flex-shrink-0 spinner" style={{ color: 'var(--accent-cyan)' }} />}
                      {isPending && <div className="w-4 h-4 rounded-full border flex-shrink-0" style={{ borderColor: 'var(--text-muted)' }} />}
                      <span className="text-sm" style={{ color: isActive ? 'var(--accent-cyan)' : isComplete ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                        {stageLabels[stage]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Extraction preview */}
              {extractionPreview && state === 'complete' && (
                <div className="glass-card-sm p-4 mt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--accent-cyan)' }}>Extracted</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span style={{ color: 'var(--text-muted)' }}>Authors:</span> <span className="text-white">{(extractionPreview.authors as unknown[])?.length || 0}</span></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Topics:</span> <span className="text-white">{(extractionPreview.topics as unknown[])?.length || 0}</span></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Methods:</span> <span className="text-white">{(extractionPreview.methods as unknown[])?.length || 0}</span></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Claims:</span> <span className="text-white">{(extractionPreview.claims as unknown[])?.length || 0}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {state === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--accent-rose)' }} />
              <p className="text-sm font-medium text-white mb-1">Upload Failed</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
              <button
                onClick={() => { setState('idle'); setError(''); }}
                className="px-6 py-2 rounded-xl text-sm font-medium transition-smooth"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
