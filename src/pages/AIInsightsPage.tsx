import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Send, Loader2, Target, Zap,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { signals, stocks } from '../lib/mockData';
import { getAIMarketSummary, getAIChatResponse } from '../lib/mockAI';
import type { ChatMessage } from '../types';

/* ── Prediction Accuracy Data ─────────────────────────────────── */
const accuracyData = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  accuracy: 55 + Math.random() * 30 + (i / 30) * 10,
}));

export default function AIInsightsPage() {
  const [summary, setSummary] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'assistant', content: "I'm your AI market analyst. Ask me about market conditions, stock outlooks, sector trends, or trading strategies.", timestamp: 'now' },
  ]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sentimentHeatmapData = useState(() => stocks.slice(0, 8).map(s => ({
    ...s,
    sent: (Math.random() * 2 - 1)
  })))[0];

  useEffect(() => { getAIMarketSummary().then(setSummary); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMsg = async (text: string) => {
    if (!text.trim() || chatLoading) return;
    setMessages(m => [...m, { id: Date.now().toString(), role: 'user', content: text, timestamp: 'now' }]);
    setInput(''); setChatLoading(true);
    const resp = await getAIChatResponse(text);
    setMessages(m => [...m, { id: (Date.now() + 1).toString(), role: 'assistant', content: resp, timestamp: 'now' }]);
    setChatLoading(false);
  };

  const suggestions = ['What sectors are outperforming?', 'Give me a bearish risk assessment', 'Which stocks have the strongest buy signals?'];

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
          <Brain size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, color: 'var(--accent-violet)' }} />
          AI Insights
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>AI-generated market analysis, signals, and predictions</p>
      </motion.div>

      {/* AI Market Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{
          padding: 24, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)', marginBottom: 20,
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'var(--accent-violet-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Brain size={16} color="var(--accent-violet)" />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>AI Market Summary</h3>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Generated today</span>
        </div>
        {summary ? (
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
            {summary.split('**').map((part, i) =>
              i % 2 === 1 ? <strong key={i} style={{ color: 'var(--text-primary)' }}>{part}</strong> : part
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating analysis...
          </div>
        )}
      </motion.div>

      {/* 2 Column: Signals + Accuracy */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Top Signals */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{
            padding: 20, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
          }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={16} color="var(--accent-cyan)" /> Top AI Signals
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {signals.map(sig => {
              const c = sig.action === 'BUY' ? 'var(--accent-green)' : sig.action === 'SELL' ? 'var(--accent-red)' : 'var(--accent-amber)';
              return (
                <div key={sig.id} style={{
                  padding: '12px 14px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 700,
                        fontFamily: 'var(--font-mono)', background: `${c}20`, color: c,
                      }}>{sig.action}</span>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{sig.symbol}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sig.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: c }}>{sig.confidence}%</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{sig.reasoning}</p>
                  <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                    <span>Entry: <span className="mono">${sig.price.toFixed(2)}</span></span>
                    <span>Target: <span className="mono" style={{ color: c }}>${sig.targetPrice.toFixed(2)}</span></span>
                    <span>{sig.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Prediction Accuracy + Sentiment Heatmap */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{
              padding: 20, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
            }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={16} color="var(--accent-blue)" /> Prediction Accuracy
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(55,65,81,0.2)" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#64748B' }} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} domain={[50, 100]} unit="%" />
                <Tooltip contentStyle={{ background: '#1a2035', border: '1px solid rgba(55,65,81,0.5)', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="accuracy" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Sentiment Heatmap */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{
              padding: 20, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
            }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Sentiment Heatmap</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {sentimentHeatmapData.map(s => {
                const sent = s.sent;
                const isPos = sent > 0;
                const intensity = Math.abs(sent);
                const bg = isPos
                  ? `rgba(0,255,136,${0.05 + intensity * 0.2})`
                  : `rgba(255,59,92,${0.05 + intensity * 0.2})`;
                return (
                  <div key={s.symbol} style={{
                    padding: '10px 8px', borderRadius: 'var(--radius-sm)', background: bg,
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{s.symbol}</div>
                    <div style={{
                      fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-mono)',
                      color: isPos ? 'var(--accent-green)' : 'var(--accent-red)',
                    }}>
                      {isPos ? '+' : ''}{(sent * 100).toFixed(0)}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* AI Chat */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{
          padding: 20, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
        }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Brain size={16} color="var(--accent-cyan)" /> AI Market Chat
        </h3>
        <div style={{ maxHeight: 300, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
          {messages.map(m => (
            <div key={m.id} style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '70%', padding: '10px 14px', borderRadius: 12,
              background: m.role === 'user' ? 'var(--accent-cyan-dim)' : 'var(--bg-tertiary)',
              border: `1px solid ${m.role === 'user' ? 'rgba(6,214,160,0.2)' : 'var(--border-glass)'}`,
              fontSize: 13, lineHeight: 1.7,
            }}>{m.content}</div>
          ))}
          {chatLoading && (
            <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: 12, background: 'var(--bg-tertiary)' }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-cyan)' }} />
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        {messages.length <= 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => sendMsg(s)} style={{
                padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-glass)', fontSize: 12, color: 'var(--text-secondary)',
                transition: 'var(--transition-fast)',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-glass)'}
              >{s}</button>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMsg(input)}
            placeholder="Ask about the market..."
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)',
              fontSize: 13, color: 'var(--text-primary)',
            }} />
          <button onClick={() => sendMsg(input)} disabled={chatLoading || !input.trim()}
            style={{
              padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)',
              color: '#fff', opacity: chatLoading || !input.trim() ? 0.5 : 1,
            }}>
            <Send size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
