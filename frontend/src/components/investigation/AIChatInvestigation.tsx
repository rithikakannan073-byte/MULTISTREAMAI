import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import { InvestigationResponse, EvidenceItem } from '../../types';
import { EvidenceModal } from '../common/EvidenceModal';
import {
  BotMessageSquare,
  Send,
  User,
  Shield,
  Clock,
  Video,
  FileCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  Cpu,
  Layers
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  response?: InvestigationResponse;
}

export const AIChatInvestigation: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'assistant',
      content:
        'Welcome to **MultiStream AI Investigation Assistant**. You can ask conversational questions about recorded multi-camera CCTV footage across the campus.\n\nAll answers are strictly verified against the temporal event graph with cryptographic chain-of-custody citations.',
      timestamp: '10:00:00'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextPersonId, setContextPersonId] = useState<string | undefined>('P023');
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestedQueries = [
    'Where did the man in the blue shirt go after entering the main gate?',
    'Who was he with?',
    'Where did P023 go?',
    'Find unattended packages near the corridor elevator',
    'Did anyone with a purple top enter the vault?' // Tests anti-hallucination guardrail
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const text = (queryText || inputValue).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toTimeString().split(' ')[0]
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await api.queryInvestigation(text, contextPersonId);
      if (response.subject_person_id) {
        setContextPersonId(response.subject_person_id);
      }

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: response.answer,
        timestamp: new Date().toTimeString().split(' ')[0],
        response
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          content: `Investigation query failed: ${err.message || 'System error'}`,
          timestamp: new Date().toTimeString().split(' ')[0]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col bg-[#0B1120] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Investigation Chat Header */}
      <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <BotMessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              AI INVESTIGATION
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Temporal Event Graph Reasoning • Multi-Turn Coreference • Anti-Hallucination Guardrail
            </p>
          </div>
        </div>

        {contextPersonId && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
            <span className="text-slate-500">CONTEXT SUBJECT:</span>
            <span className="text-cyan-400 font-bold">{contextPersonId}</span>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-2xl space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-cyan-600 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-lg'
                  }`}
                >
                  <div className="whitespace-pre-line font-sans">{msg.content}</div>

                  <div
                    className={`mt-2 text-[10px] font-mono flex items-center gap-1 ${
                      isUser ? 'text-slate-900/80 justify-end' : 'text-slate-500 justify-start'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* Structured Evidence Cards (for AI responses) */}
                {msg.response && msg.response.sufficient_evidence && (
                  <div className="space-y-3 pt-1">
                    {/* Cross-Camera Journey Timeline if available */}
                    {msg.response.timeline && msg.response.timeline.length > 0 && (
                      <div className="bg-[#070B14] border border-slate-800 rounded-xl p-4 space-y-3">
                        <div className="text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5" />
                          <span>RECONSTRUCTED CROSS-CAMERA JOURNEY</span>
                        </div>
                        <div className="space-y-2">
                          {msg.response.timeline.map((step) => (
                            <div
                              key={step.step_number}
                              className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 transition-colors"
                            >
                              <div className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {step.step_number}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-semibold text-white font-mono">{step.camera_name}</span>
                                  <span className="text-[11px] font-mono text-cyan-400">{step.timestamp}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Evidence Thumbnails & Verification Badges */}
                    {msg.response.evidence && msg.response.evidence.length > 0 && (
                      <div className="bg-[#070B14] border border-slate-800 rounded-xl p-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>VERIFIED CCTV EVIDENCE CITATIONS</span>
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                            CONFIDENCE: {(msg.response.confidence * 100).toFixed(0)}%
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.response.evidence.map((ev) => (
                            <div
                              key={ev.id}
                              className="p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-colors flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                                  <span className="text-cyan-400 font-bold">{ev.id}</span>
                                  <span className="text-slate-400">{ev.timestamp.split(' ')[-1]}</span>
                                </div>
                                <div className="text-xs font-medium text-white mb-1">{ev.title}</div>
                                <div className="text-[10px] text-slate-400 line-clamp-2">{ev.notes}</div>
                              </div>

                              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedEvidence(ev)}
                                  className="flex-1 py-1 px-2 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Video className="w-3 h-3" />
                                  <span>[VIEW FRAME / CLIP]</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Shield className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono flex items-center gap-3">
              <Cpu className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Traversing Temporal Event Graph & verifying evidence frames...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggested Queries Strip */}
      <div className="px-6 py-2.5 bg-slate-950/60 border-t border-slate-800/80 overflow-x-auto flex items-center gap-2">
        <span className="text-[10px] font-mono uppercase text-slate-500 whitespace-nowrap">
          Suggested Queries:
        </span>
        {suggestedQueries.map((sq, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sq)}
            disabled={loading}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 text-[11px] font-mono whitespace-nowrap cursor-pointer transition-all disabled:opacity-50"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask natural language question (e.g. 'Where did the man in the blue shirt go?')..."
              className="w-full bg-[#070B14] border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-sans"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="p-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Evidence Viewer Modal */}
      <EvidenceModal
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />
    </div>
  );
};
