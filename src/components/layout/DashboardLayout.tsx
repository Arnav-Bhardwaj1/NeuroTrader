import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Search, Bell } from 'lucide-react';
import { stocks } from '../../lib/mockData';

export default function DashboardLayout() {
  const [search, setSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const filtered = search.length > 0
    ? stocks.filter(s => s.symbol.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5)
    : [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top Bar */}
        <header style={{
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', borderBottom: '1px solid var(--border-glass)',
          background: 'rgba(10,14,23,0.8)', backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 40,
        }}>
          {/* Search */}
          <div style={{ position: 'relative', width: 360 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)} onBlur={() => setTimeout(() => setShowResults(false), 200)}
              placeholder="Search stocks (e.g. AAPL, Tesla)..."
              style={{
                width: '100%', padding: '10px 12px 10px 38px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                fontSize: 13, color: 'var(--text-primary)', transition: 'var(--transition-base)',
              }}
              onMouseDown={e => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
            />
            {showResults && filtered.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
                background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)', overflow: 'hidden', zIndex: 100,
                boxShadow: 'var(--shadow-lg)',
              }}>
                {filtered.map(s => (
                  <button key={s.symbol} onClick={() => { navigate(`/stocks/${s.symbol}`); setSearch(''); setShowResults(false); }}
                    style={{
                      width: '100%', padding: '10px 14px', display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', textAlign: 'left', transition: 'var(--transition-fast)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 13, fontFamily: 'var(--font-mono)' }}>{s.symbol}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 8 }}>{s.name}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: s.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                      ${s.price.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button style={{ position: 'relative', color: 'var(--text-muted)', padding: 8 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <Bell size={18} />
              <div style={{
                position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%',
                background: 'var(--accent-red)', boxShadow: '0 0 6px var(--accent-red)',
              }} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: 28, overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
