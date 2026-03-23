import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpRight, ArrowDownRight, LayoutGrid, List, Filter } from 'lucide-react';
import { stocks } from '../lib/mockData';
import { formatPercent, formatVolume } from '../lib/utils';

export default function StocksPage() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change'>('symbol');
  const navigate = useNavigate();

  const sectors = ['All', ...new Set(stocks.map(s => s.sector))];

  const filtered = stocks
    .filter(s => sectorFilter === 'All' || s.sector === sectorFilter)
    .filter(s => s.symbol.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price') return b.price - a.price;
      if (sortBy === 'change') return b.changePercent - a.changePercent;
      return a.symbol.localeCompare(b.symbol);
    });

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Stocks</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Browse and analyze stocks with AI-powered insights</p>
      </motion.div>

      {/* Controls */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stocks..."
            style={{
              width: '100%', padding: '10px 12px 10px 38px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', fontSize: 13,
              color: 'var(--text-primary)',
            }} />
        </div>

        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 3 }}>
          {sectors.map(s => (
            <button key={s} onClick={() => setSectorFilter(s)} style={{
              padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500,
              background: sectorFilter === s ? 'var(--bg-card)' : 'transparent',
              color: sectorFilter === s ? 'var(--accent-cyan)' : 'var(--text-muted)',
              transition: 'var(--transition-fast)', whiteSpace: 'nowrap',
            }}>{s}</button>
          ))}
        </div>

        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
          style={{
            padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)', fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer',
          }}>
          <option value="symbol">Sort: Symbol</option>
          <option value="price">Sort: Price</option>
          <option value="change">Sort: Change</option>
        </select>

        <div style={{ display: 'flex', gap: 4 }}>
          {[{ key: 'grid' as const, icon: LayoutGrid }, { key: 'list' as const, icon: List }].map(v => (
            <button key={v.key} onClick={() => setView(v.key)} style={{
              padding: 8, borderRadius: 'var(--radius-sm)',
              background: view === v.key ? 'var(--accent-cyan-dim)' : 'transparent',
              color: view === v.key ? 'var(--accent-cyan)' : 'var(--text-muted)',
            }}><v.icon size={18} /></button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map((s, i) => (
            <motion.button key={s.symbol} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigate(`/stocks/${s.symbol}`)}
              style={{
                padding: 20, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)', textAlign: 'left', width: '100%',
                transition: 'var(--transition-base)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(6,214,160,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{s.symbol}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.name}</div>
                </div>
                <span style={{
                  padding: '3px 8px', borderRadius: 'var(--radius-full)', fontSize: 10, fontWeight: 600,
                  background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                }}>{s.sector}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>${s.price.toFixed(2)}</span>
                <span style={{
                  fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono)',
                  color: s.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                  display: 'flex', alignItems: 'center', gap: 3,
                }}>
                  {s.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {formatPercent(s.changePercent)}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                Vol: {formatVolume(s.volume)} · MCap: {s.marketCap}
              </div>
            </motion.button>
          ))}
        </div>
      ) : (
        /* List View */
        <div style={{
          borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)', overflow: 'hidden',
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '120px 1fr 120px 120px 100px 100px',
            padding: '12px 20px', borderBottom: '1px solid var(--border-glass)',
            fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase',
          }}>
            <span>Symbol</span><span>Name</span><span style={{ textAlign: 'right' }}>Price</span>
            <span style={{ textAlign: 'right' }}>Change</span><span style={{ textAlign: 'right' }}>Volume</span>
            <span style={{ textAlign: 'right' }}>MCap</span>
          </div>
          {filtered.map((s, i) => (
            <motion.button key={s.symbol} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              onClick={() => navigate(`/stocks/${s.symbol}`)}
              style={{
                display: 'grid', gridTemplateColumns: '120px 1fr 120px 120px 100px 100px',
                padding: '14px 20px', width: '100%', textAlign: 'left',
                borderBottom: '1px solid var(--border-glass)', transition: 'var(--transition-fast)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 14 }}>{s.symbol}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.name}</span>
              <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600 }}>${s.price.toFixed(2)}</span>
              <span style={{
                textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
                color: s.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
              }}>{formatPercent(s.changePercent)}</span>
              <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{formatVolume(s.volume)}</span>
              <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{s.marketCap}</span>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
