'use client';

import { useState } from 'react';
import { SynthesisResult } from '@/lib/types';
import { X, Send, Shield, MessageSquare, Sparkles, ChevronRight, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface AssistantPanelProps {
  answer: SynthesisResult | null;
  onAsk: (question: string) => void;
  onVerify: () => void;
  isLoading: boolean;
  onClose: () => void;
}

export default function AssistantPanel({ answer, onAsk, onVerify, isLoading, onClose }: AssistantPanelProps) {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onAsk(question.trim());
    }
  };

  const suggestedQuestions = [
    'What are the main methods in this field and where do papers disagree?',
    'Who are the most influential authors and why?',
    'What are the key findings about transformer architectures?',
    'How does BERT compare to GPT in terms of pre-training approach?',
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(0,229,255,0.15)', color: 'var(--accent-cyan)' }}>
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--accent-cyan)' }}>RocketRide AI</p>
            <h3 className="text-sm font-semibold text-white">Research Assistant</h3>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg transition-smooth hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {!answer && !isLoading && (
          <>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Ask a research question and I&apos;ll synthesize an answer from the knowledge graph with evidence and citations.
            </p>
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Try asking</p>
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setQuestion(q); onAsk(q); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs glass-card-sm transition-smooth hover:scale-[1.01]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <ChevronRight className="w-3 h-3 inline mr-2" style={{ color: 'var(--accent-cyan)' }} />{q}
                </button>
              ))}
            </div>
          </>
        )}

        {isLoading && (
          <div className="flex flex-col items-center py-12">
            <div className="w-10 h-10 border-2 rounded-full spinner mb-4" style={{ borderColor: 'var(--border-subtle)', borderTopColor: 'var(--accent-cyan)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Analyzing graph and synthesizing answer...</p>
          </div>
        )}

        {answer && !isLoading && (
          <>
            {/* Answer */}
            <div className="glass-card-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent-cyan)' }}>Synthesized Answer</p>
              </div>
              <p className="text-sm leading-relaxed text-white whitespace-pre-wrap">{answer.answer}</p>
            </div>

            {/* Confidence */}
            <div className="glass-card-sm p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Confidence Score</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${answer.confidence * 100}%`,
                      background: answer.confidence > 0.8 ? 'linear-gradient(90deg, #00e676, #69f0ae)' :
                                  answer.confidence > 0.5 ? 'linear-gradient(90deg, #ffab40, #ffd740)' :
                                  'linear-gradient(90deg, #ff5252, #ff8a80)',
                    }}
                  />
                </div>
                <span className="text-lg font-mono font-bold text-white">{(answer.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Evidence Cards */}
            {answer.evidence.length > 0 && (
              <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Evidence ({answer.evidence.length})</p>
                <div className="space-y-2">
                  {answer.evidence.map((ev, i) => (
                    <motion.div
                      variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
                      key={i}
                      className={`glass-card-sm p-3 ${ev.type === 'supports' ? 'evidence-supports' : ev.type === 'contradicts' ? 'evidence-contradicts' : 'evidence-neutral'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold" style={{ color: ev.type === 'supports' ? 'var(--accent-emerald)' : ev.type === 'contradicts' ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                          {ev.type === 'supports' ? '✓ Supports' : ev.type === 'contradicts' ? '⚡ Contradicts' : '○ Neutral'}
                        </span>
                        <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{(ev.relevance * 100).toFixed(0)}%</span>
                      </div>
                      <p className="text-xs font-medium text-white mb-1">{ev.paperTitle}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{ev.text}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Reasoning */}
            {answer.reasoning && (
              <div className="glass-card-sm p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Graph Reasoning Path</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{answer.reasoning}</p>
                {answer.graphPath.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {answer.graphPath.map((nodeId, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: 'rgba(0,229,255,0.1)', color: 'var(--accent-cyan)' }}>
                          {nodeId}
                        </span>
                        {i < answer.graphPath.length - 1 && <ArrowRight className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Verify Button */}
            <button
              onClick={onVerify}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-smooth hover:scale-[1.02]"
              style={{ background: 'rgba(255,171,64,0.15)', color: 'var(--accent-amber)', border: '1px solid rgba(255,171,64,0.3)' }}
            >
              <Shield className="w-4 h-4" /> Verify This Answer
            </button>

            {/* Follow-up Questions */}
            {answer.followUpQuestions.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Follow-up Questions</p>
                <div className="space-y-1.5">
                  {answer.followUpQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { setQuestion(q); onAsk(q); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs transition-smooth hover:bg-white/5"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <ArrowRight className="w-3 h-3 inline mr-2" style={{ color: 'var(--accent-cyan)' }} />{q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a research question..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="px-4 py-2.5 rounded-xl transition-smooth disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, #00e5ff, #7c4dff)', color: '#fff' }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
