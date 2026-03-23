import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowUpRight, ArrowDownRight, Brain, MessageSquare, FileText,
  Shield, BarChart3, Loader2, Send, TrendingUp, TrendingDown, Minus,
} from 'lucide-react';
import { createChart, ColorType } from 'lightweight-charts';
import { stocks, stockCandlestickData } from '../lib/mockData';
import { getAIPrediction, getAISentiment, getAIRisk, getAIChatResponse } from '../lib/mockAI';
import { formatCurrency, formatVolume, formatPercent } from '../lib/utils';
import type { PredictionData, SentimentData, RiskData, ChatMessage } from '../types';

/* ── Candlestick Chart Component ──────────────────────────────── */
function CandlestickChart({ symbol, range }: { symbol: string; range: string }) {
  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!chartRef.current) return;
    const data = stockCandlestickData[symbol];
    if (!data) return;

    const rangeMap: Record<string, number> = { '1D': 1, '1W': 5, '1M': 22, '3M': 66, '1Y': 252, 'ALL': 9999 };
    const days = rangeMap[range] || 252;
    const sliced = data.slice(-days);

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 400,
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#94A3B8' },
      grid: { vertLines: { color: 'rgba(55,65,81,0.2)' }, horzLines: { color: 'rgba(55,65,81,0.2)' } },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: 'rgba(55,65,81,0.3)' },
      timeScale: { borderColor: 'rgba(55,65,81,0.3)', timeVisible: true },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00FF88', downColor: '#FF3B5C',
      borderUpColor: '#00FF88', borderDownColor: '#FF3B5C',
      wickUpColor: '#00FF88', wickDownColor: '#FF3B5C',
    });
    candleSeries.setData(sliced.map(d => ({ time: d.time, open: d.open, high: d.high, low: d.low, close: d.close })));

    const volumeSeries = chart.addHistogramSeries({
      color: 'rgba(6,214,160,0.2)',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });
    volumeSeries.setData(sliced.map(d => ({
      time: d.time, value: d.volume,
      color: d.close >= d.open ? 'rgba(0,255,136,0.15)' : 'rgba(255,59,92,0.15)',
    })));

    chart.timeScale().fitContent();
    const ro = new ResizeObserver(() => { if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth }); });
    ro.observe(chartRef.current);
    return () => { chart.remove(); ro.disconnect(); };
  }, [symbol, range]);

  return <div ref={chartRef} style={{ width: '100%' }} />;
}

/* ── AI Chat ──────────────────────────────────────────────────── */
function AIChat({ symbol }: { symbol: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'assistant', content: `Hi! I'm your AI analyst for **${symbol}**. Ask me anything about this stock — price targets, risk analysis, news sentiment, or trading strategy.`, timestamp: 'now' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const suggestions = [`What's the outlook for ${symbol}?`, `Is ${symbol} a buy right now?`, `Analyze ${symbol} risk factors`];

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: 'now' };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    const response = await getAIChatResponse(text);
    setMessages(m => [...m, { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: 'now' }]);
    setLoading(false);
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map(m => (
          <div key={m.id} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%', padding: '10px 14px', borderRadius: 12,
            background: m.role === 'user' ? 'var(--accent-cyan-dim)' : 'var(--bg-tertiary)',
            border: `1px solid ${m.role === 'user' ? 'rgba(6,214,160,0.2)' : 'var(--border-glass)'}`,
            fontSize: 13, lineHeight: 1.6,
          }}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: 12, background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)' }}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-cyan)' }} />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => send(s)} style={{
              padding: '6px 12px', borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-glass)', fontSize: 11, color: 'var(--text-secondary)',
              transition: 'var(--transition-fast)',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-glass)'}
            >{s}</button>
          ))}
        </div>
      )}
      {/* Input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
          placeholder="Ask about this stock..."
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)',
            fontSize: 13, color: 'var(--text-primary)',
          }} />
        <button onClick={() => send(input)} disabled={loading || !input.trim()}
          style={{
            padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)',
            color: '#fff', opacity: loading || !input.trim() ? 0.5 : 1,
          }}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

/* ── Prediction Panel ─────────────────────────────────────────── */
function PredictionPanel({ symbol }: { symbol: string }) {
  const [data, setData] = useState<PredictionData | null>(null);
  useEffect(() => { getAIPrediction(symbol).then(setData); }, [symbol]);
  if (!data) return <div style={{ padding: 20, textAlign: 'center' }}><Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-cyan)' }} /></div>;
  const stock = stocks.find(s => s.symbol === symbol);
  const DirIcon = data.direction === 'bullish' ? TrendingUp : data.direction === 'bearish' ? TrendingDown : Minus;
  const dirColor = data.direction === 'bullish' ? 'var(--accent-green)' : data.direction === 'bearish' ? 'var(--accent-red)' : 'var(--accent-amber)';
  return (
    <div style={{ padding: '4px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 'var(--radius-md)',
        background: `${dirColor}10`, border: `1px solid ${dirColor}30`,
      }}>
        <DirIcon size={22} color={dirColor} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: dirColor, textTransform: 'capitalize' }}>{data.direction}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>AI Prediction — {data.timeframe}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Target Price</div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-mono)', color: dirColor }}>${data.targetPrice.toFixed(2)}</div>
        </div>
        <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Confidence</div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{data.confidence}%</div>
        </div>
      </div>
      {stock && (
        <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Expected Return</div>
          <div style={{
            fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)',
            color: data.targetPrice > stock.price ? 'var(--accent-green)' : 'var(--accent-red)',
          }}>
            {formatPercent(((data.targetPrice - stock.price) / stock.price) * 100)}
          </div>
        </div>
      )}
      {/* Confidence Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Confidence Level</span>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{data.confidence}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${data.confidence}%` }} transition={{ duration: 1, ease: 'easeOut' }}
            style={{ height: '100%', background: 'var(--gradient-primary)', borderRadius: 3 }} />
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, padding: '8px 0' }}>{data.reasoning}</div>
    </div>
  );
}

/* ── Sentiment Panel ──────────────────────────────────────────── */
function SentimentPanel({ symbol }: { symbol: string }) {
  const [data, setData] = useState<SentimentData | null>(null);
  useEffect(() => { getAISentiment(symbol).then(setData); }, [symbol]);
  if (!data) return <div style={{ padding: 20, textAlign: 'center' }}><Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-cyan)' }} /></div>;
  const labelColor = data.label === 'Bullish' ? 'var(--accent-green)' : data.label === 'Bearish' ? 'var(--accent-red)' : 'var(--accent-amber)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 0' }}>
      {/* Overall */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px',
        borderRadius: 'var(--radius-md)', background: `${labelColor}10`, border: `1px solid ${labelColor}30`,
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Overall Sentiment</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: labelColor }}>{data.label}</div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-mono)', color: labelColor }}>
          {data.overall > 0 ? '+' : ''}{(data.overall * 100).toFixed(0)}
        </div>
      </div>
      {/* Breakdown */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Sentiment Breakdown</div>
        {data.breakdown.map(b => {
          const c = b.score > 0.1 ? 'var(--accent-green)' : b.score < -0.1 ? 'var(--accent-red)' : 'var(--accent-amber)';
          const pct = ((b.score + 1) / 2) * 100;
          return (
            <div key={b.category} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{b.category}</span>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: c }}>{b.score > 0 ? '+' : ''}{b.score.toFixed(2)}</span>
              </div>
              <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                  style={{ height: '100%', background: c, borderRadius: 2 }} />
              </div>
            </div>
          );
        })}
      </div>
      {/* Headlines */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Recent Headlines</div>
        {data.headlines.slice(0, 4).map((h, i) => {
          const hc = h.sentiment > 0.1 ? 'var(--accent-green)' : h.sentiment < -0.1 ? 'var(--accent-red)' : 'var(--accent-amber)';
          return (
            <div key={i} style={{
              padding: '8px 10px', marginBottom: 6, borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)',
            }}>
              <div style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 4 }}>{h.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                <span>{h.source} · {h.time}</span>
                <span style={{ color: hc, fontFamily: 'var(--font-mono)' }}>{h.sentiment > 0 ? '+' : ''}{h.sentiment.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Risk Panel ───────────────────────────────────────────────── */
function RiskPanel({ symbol }: { symbol: string }) {
  const [data, setData] = useState<RiskData | null>(null);
  useEffect(() => { getAIRisk(symbol).then(setData); }, [symbol]);
  if (!data) return <div style={{ padding: 20, textAlign: 'center' }}><Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-cyan)' }} /></div>;
  const riskColor = data.riskLevel === 'Low' ? 'var(--accent-green)' : data.riskLevel === 'Medium' ? 'var(--accent-amber)' : 'var(--accent-red)';
  const gaugeAngle = (data.compositeScore / 100) * 180 - 90;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 0' }}>
      {/* Gauge */}
      <div style={{ textAlign: 'center', padding: '12px 0' }}>
        <svg viewBox="0 0 200 120" width="200" style={{ margin: '0 auto' }}>
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--bg-tertiary)" strokeWidth="14" strokeLinecap="round" />
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={`url(#riskGrad)`} strokeWidth="14" strokeLinecap="round"
            strokeDasharray={`${(data.compositeScore / 100) * 251.2} 251.2`} />
          <defs><linearGradient id="riskGrad"><stop offset="0%" stopColor="var(--accent-green)" /><stop offset="50%" stopColor="var(--accent-amber)" /><stop offset="100%" stopColor="var(--accent-red)" /></linearGradient></defs>
          <text x="100" y="90" textAnchor="middle" fill={riskColor} fontSize="28" fontWeight="900" fontFamily="var(--font-mono)">{data.compositeScore}</text>
          <text x="100" y="110" textAnchor="middle" fill="var(--text-muted)" fontSize="11">{data.riskLevel} Risk</text>
        </svg>
      </div>
      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: 'Volatility', value: `${data.volatility}%` },
          { label: 'Beta', value: data.beta.toFixed(2) },
          { label: 'Sharpe Ratio', value: data.sharpe.toFixed(2) },
          { label: 'Max Drawdown', value: `-${data.maxDrawdown}%` },
        ].map(m => (
          <div key={m.label} style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Stock Detail Page ────────────────────────────────────────── */
export default function StockDetailPage() {
  const { symbol = 'AAPL' } = useParams();
  const navigate = useNavigate();
  const stock = stocks.find(s => s.symbol === symbol.toUpperCase());
  const [range, setRange] = useState('1Y');
  const [activeTab, setActiveTab] = useState<'chat' | 'prediction' | 'sentiment' | 'risk'>('prediction');

  if (!stock) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Stock not found. <button onClick={() => navigate('/stocks')} style={{ color: 'var(--accent-cyan)' }}>Back to stocks</button></div>;

  const isPos = stock.change >= 0;
  const tabs = [
    { key: 'prediction' as const, label: 'Prediction', icon: TrendingUp },
    { key: 'sentiment' as const, label: 'Sentiment', icon: FileText },
    { key: 'risk' as const, label: 'Risk', icon: Shield },
    { key: 'chat' as const, label: 'AI Chat', icon: MessageSquare },
  ];

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {/* Left: Chart + Stats */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800 }}>{stock.name}</h1>
            <span style={{
              padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--accent-cyan-dim)',
              color: 'var(--accent-cyan)', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)',
            }}>{stock.symbol}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: 36, fontWeight: 900, fontFamily: 'var(--font-mono)' }}>${stock.price.toFixed(2)}</span>
            <span style={{
              fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-mono)',
              color: isPos ? 'var(--accent-green)' : 'var(--accent-red)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {isPos ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
              {isPos ? '+' : ''}{stock.change.toFixed(2)} ({formatPercent(stock.changePercent)})
            </span>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{
            padding: 20, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)', marginBottom: 16,
          }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map(r => (
                <button key={r} onClick={() => setRange(r)} style={{
                  padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600,
                  fontFamily: 'var(--font-mono)', transition: 'var(--transition-fast)',
                  background: range === r ? 'var(--accent-cyan-dim)' : 'transparent',
                  color: range === r ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  border: `1px solid ${range === r ? 'rgba(6,214,160,0.3)' : 'transparent'}`,
                }}>{r}</button>
              ))}
            </div>
            <BarChart3 size={16} color="var(--text-muted)" />
          </div>
          <CandlestickChart symbol={symbol.toUpperCase()} range={range} />
        </motion.div>

        {/* Key Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{
            padding: 20, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
          }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Key Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            {[
              { label: 'Market Cap', value: stock.marketCap },
              { label: 'P/E Ratio', value: stock.pe.toFixed(1) },
              { label: 'Volume', value: formatVolume(stock.volume) },
              { label: '52W High', value: `$${stock.high52w.toFixed(2)}` },
              { label: '52W Low', value: `$${stock.low52w.toFixed(2)}` },
              { label: 'Sector', value: stock.sector },
            ].map(s => (
              <div key={s.label} style={{ padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right: AI Panel */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
        style={{
          width: 380, flexShrink: 0, padding: 20, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column',
          maxHeight: 'calc(100vh - 120px)', position: 'sticky', top: 92,
        }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 3 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              flex: 1, padding: '8px 4px', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              background: activeTab === t.key ? 'var(--bg-card)' : 'transparent',
              color: activeTab === t.key ? 'var(--accent-cyan)' : 'var(--text-muted)',
              transition: 'var(--transition-fast)',
            }}>
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>
        {/* Panel Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {activeTab === 'prediction' && <PredictionPanel symbol={symbol.toUpperCase()} />}
          {activeTab === 'sentiment' && <SentimentPanel symbol={symbol.toUpperCase()} />}
          {activeTab === 'risk' && <RiskPanel symbol={symbol.toUpperCase()} />}
          {activeTab === 'chat' && <AIChat symbol={symbol.toUpperCase()} />}
        </div>
      </motion.div>
    </div>
  );
}
