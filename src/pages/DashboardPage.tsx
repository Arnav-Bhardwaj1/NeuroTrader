import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, TrendingUp, Brain, Trophy, ArrowUpRight, ArrowDownRight,
  Zap, Activity, AlertTriangle, Eye, Target,
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { stocks, marketIndices, signals, sectorPerformance, activityFeed, getPortfolioStats } from '../lib/mockData';
import { formatCurrency, formatPercent, formatVolume } from '../lib/utils';

/* ── Animated Counter ─────────────────────────────────────────── */
function AnimCounter({ target, prefix = '', suffix = '', decimals = 0 }: { target: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0; const dur = 1200; const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / dur, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return <span className="mono">{prefix}{value.toFixed(decimals)}{suffix}</span>;
}

/* ── Sparkline ────────────────────────────────────────────────── */
function Sparkline({ data, color, width = 80, height = 28 }: { data: number[]; color: string; width?: number; height?: number }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={chartData}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ── Dashboard Page ────────────────────────────────────────────── */
export default function DashboardPage() {
  const navigate = useNavigate();
  const stats = getPortfolioStats();
  const watchlist = stocks.slice(0, 6);

  const statCards = [
    { label: 'Portfolio Value', value: stats.totalValue, prefix: '$', decimals: 2, icon: Briefcase, color: 'var(--accent-cyan)' },
    { label: "Today's P&L", value: stats.dayChange, prefix: stats.dayChange >= 0 ? '+$' : '-$', decimals: 2, icon: TrendingUp, color: stats.dayChange >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' },
    { label: 'AI Signals Active', value: signals.length, prefix: '', decimals: 0, icon: Brain, color: 'var(--accent-violet)' },
    { label: 'Win Rate', value: 73.2, prefix: '', suffix: '%', decimals: 1, icon: Trophy, color: 'var(--accent-amber)' },
  ];

  const actIcon = (type: string) => {
    switch (type) {
      case 'signal': return <Zap size={14} color="var(--accent-cyan)" />;
      case 'sentiment': return <Brain size={14} color="var(--accent-violet)" />;
      case 'alert': return <AlertTriangle size={14} color="var(--accent-amber)" />;
      case 'prediction': return <Target size={14} color="var(--accent-blue)" />;
      case 'portfolio': return <Briefcase size={14} color="var(--accent-green)" />;
      default: return <Activity size={14} color="var(--text-muted)" />;
    }
  };

  return (
    <div>
      {/* Market Indices Strip */}
      <div style={{
        display: 'flex', gap: 16, marginBottom: 24, overflowX: 'auto', paddingBottom: 4,
      }}>
        {marketIndices.map((idx) => (
          <motion.div key={idx.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{
              flex: '1 0 200px', padding: '14px 18px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{idx.name}</div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{idx.value.toLocaleString()}</div>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: idx.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)} ({formatPercent(idx.changePercent)})
              </div>
            </div>
            <Sparkline data={idx.sparkline} color={idx.change >= 0 ? '#00FF88' : '#FF3B5C'} />
          </motion.div>
        ))}
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              padding: '20px 22px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)', transition: 'var(--transition-base)',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = card.color}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-primary)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{card.label}</span>
              <div style={{
                width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${card.color}15`,
              }}>
                <card.icon size={18} color={card.color} />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>
              <AnimCounter target={Math.abs(card.value)} prefix={card.prefix} suffix={card.suffix} decimals={card.decimals} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3-Column Grid: Watchlist | Signals | Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {/* Watchlist */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{
            padding: 20, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
          }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Watchlist</h3>
            <Eye size={16} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {watchlist.map((s) => (
              <button key={s.symbol} onClick={() => navigate(`/stocks/${s.symbol}`)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 8px', borderRadius: 'var(--radius-sm)', transition: 'var(--transition-fast)',
                  width: '100%', textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{s.symbol}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.name}</div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>${s.price.toFixed(2)}</div>
                    <div style={{
                      fontSize: 11, fontFamily: 'var(--font-mono)',
                      color: s.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                      display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end',
                    }}>
                      {s.change >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                      {formatPercent(s.changePercent)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* AI Signals */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{
            padding: 20, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
          }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>AI Signals</h3>
            <Brain size={16} color="var(--accent-violet)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {signals.slice(0, 5).map((sig) => {
              const actionColor = sig.action === 'BUY' ? 'var(--accent-green)' : sig.action === 'SELL' ? 'var(--accent-red)' : 'var(--accent-amber)';
              return (
                <div key={sig.id} style={{
                  padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 700,
                      fontFamily: 'var(--font-mono)', background: `${actionColor}20`, color: actionColor,
                    }}>{sig.action}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{sig.symbol}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sig.timestamp}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600, color: actionColor }}>{sig.confidence}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{
            padding: 20, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
          }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>AI Activity</h3>
            <Activity size={16} color="var(--accent-cyan)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activityFeed.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--bg-tertiary)', flexShrink: 0, marginTop: 2,
                }}>
                  {actIcon(item.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, lineHeight: 1.4 }}>{item.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.detail} · {item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Sector Heatmap */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        style={{
          marginTop: 16, padding: 20, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
        }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Sector Performance</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
          {sectorPerformance.map((s) => {
            const isPositive = s.change >= 0;
            const intensity = Math.min(Math.abs(s.change) / 3, 1);
            const bg = isPositive
              ? `rgba(0, 255, 136, ${0.05 + intensity * 0.15})`
              : `rgba(255, 59, 92, ${0.05 + intensity * 0.15})`;
            const border = isPositive
              ? `rgba(0, 255, 136, ${0.1 + intensity * 0.2})`
              : `rgba(255, 59, 92, ${0.1 + intensity * 0.2})`;
            return (
              <div key={s.sector} style={{
                padding: '14px 12px', borderRadius: 'var(--radius-md)', background: bg,
                border: `1px solid ${border}`, textAlign: 'center', transition: 'var(--transition-base)',
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{s.sector}</div>
                <div style={{
                  fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)',
                  color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)',
                }}>
                  {formatPercent(s.change)}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
