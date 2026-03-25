import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid,
} from 'recharts';
import { holdings, transactions, getPortfolioStats, portfolioPerformanceData } from '../lib/mockData';
import { formatCurrency, formatPercent } from '../lib/utils';

const COLORS = ['#06D6A0', '#3B82F6', '#8B5CF6', '#FFB800', '#FF3B5C', '#00D4FF', '#FF6B6B', '#50E3C2'];

export default function PortfolioPage() {
  const navigate = useNavigate();
  const stats = getPortfolioStats();
  const [sortCol, setSortCol] = useState<'symbol' | 'value' | 'pnl'>('value');

  // Allocation data
  const sectorMap: Record<string, number> = {};
  holdings.forEach(h => { sectorMap[h.sector] = (sectorMap[h.sector] || 0) + h.shares * h.currentPrice; });
  const allocationData = Object.entries(sectorMap).map(([name, val]) => ({ name, value: +val.toFixed(2) }));

  const sortedHoldings = [...holdings].sort((a, b) => {
    const aVal = a.shares * a.currentPrice;
    const bVal = b.shares * b.currentPrice;
    if (sortCol === 'value') return bVal - aVal;
    if (sortCol === 'pnl') return (b.currentPrice - b.avgCost) * b.shares - (a.currentPrice - a.avgCost) * a.shares;
    return a.symbol.localeCompare(b.symbol);
  });

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Portfolio</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Track your holdings, performance, and allocation</p>
      </motion.div>

      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Value', value: formatCurrency(stats.totalValue), color: 'var(--accent-cyan)' },
          { label: "Today's P&L", value: `${stats.dayChange >= 0 ? '+' : ''}${formatCurrency(stats.dayChange)}`, color: stats.dayChange >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' },
          { label: 'Total Return', value: `${stats.totalReturn >= 0 ? '+' : ''}${formatCurrency(stats.totalReturn)}`, color: stats.totalReturn >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' },
          { label: 'Return %', value: formatPercent(stats.totalReturnPercent), color: stats.totalReturnPercent >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            style={{
              padding: 20, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
            }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Performance Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{
            padding: 20, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
          }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Performance vs S&P 500</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={portfolioPerformanceData.filter((_, i) => i % 3 === 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(55,65,81,0.2)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ background: '#1a2035', border: '1px solid rgba(55,65,81,0.5)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#94A3B8' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="portfolio" stroke="#06D6A0" strokeWidth={2} dot={false} name="Portfolio" />
              <Line type="monotone" dataKey="benchmark" stroke="#3B82F6" strokeWidth={2} dot={false} name="S&P 500" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Allocation Pie */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{
            padding: 20, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
          }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Sector Allocation</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={allocationData} cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                paddingAngle={3} dataKey="value" stroke="none">
                {allocationData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1a2035', border: '1px solid rgba(55,65,81,0.5)', borderRadius: 8, fontSize: 12 }}
                formatter={(value: any) => formatCurrency(Number(value))}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Holdings Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{
          borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)', overflow: 'hidden', marginBottom: 20,
        }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>Holdings</h3>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['symbol', 'value', 'pnl'] as const).map(s => (
              <button key={s} onClick={() => setSortCol(s)} style={{
                padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 500,
                background: sortCol === s ? 'var(--accent-cyan-dim)' : 'transparent',
                color: sortCol === s ? 'var(--accent-cyan)' : 'var(--text-muted)',
                textTransform: 'capitalize',
              }}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: '90px 1fr 80px 100px 100px 100px 100px',
          padding: '10px 20px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', borderBottom: '1px solid var(--border-glass)',
        }}>
          <span>Symbol</span><span>Name</span><span style={{ textAlign: 'right' }}>Shares</span>
          <span style={{ textAlign: 'right' }}>Avg Cost</span><span style={{ textAlign: 'right' }}>Price</span>
          <span style={{ textAlign: 'right' }}>P&L</span><span style={{ textAlign: 'right' }}>P&L %</span>
        </div>
        {sortedHoldings.map(h => {
          const pnl = (h.currentPrice - h.avgCost) * h.shares;
          const pnlPct = ((h.currentPrice - h.avgCost) / h.avgCost) * 100;
          const isPos = pnl >= 0;
          return (
            <button key={h.symbol} onClick={() => navigate(`/stocks/${h.symbol}`)}
              style={{
                display: 'grid', gridTemplateColumns: '90px 1fr 80px 100px 100px 100px 100px',
                padding: '14px 20px', width: '100%', textAlign: 'left',
                borderBottom: '1px solid var(--border-glass)', transition: 'var(--transition-fast)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 14 }}>{h.symbol}</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{h.name}</span>
              <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{h.shares}</span>
              <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>${h.avgCost.toFixed(2)}</span>
              <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>${h.currentPrice.toFixed(2)}</span>
              <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: isPos ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {isPos ? '+' : ''}{formatCurrency(pnl)}
              </span>
              <span style={{
                textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
                color: isPos ? 'var(--accent-green)' : 'var(--accent-red)',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3,
              }}>
                {isPos ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {formatPercent(pnlPct)}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Transactions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        style={{
          padding: 20, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
        }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Recent Transactions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {transactions.map(t => (
            <div key={t.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  padding: '3px 8px', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  background: t.action === 'BUY' ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
                  color: t.action === 'BUY' ? 'var(--accent-green)' : 'var(--accent-red)',
                }}>{t.action}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.symbol}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.shares} shares @ ${t.price.toFixed(2)}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{formatCurrency(t.total)}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
