import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowUpRight, ArrowDownRight, Trash2, Edit2, Play, LayoutGrid, List } from 'lucide-react';
import { stocks } from '../lib/mockData';
import { formatPercent, formatVolume } from '../lib/utils';

interface Watchlist {
  id: string;
  name: string;
  symbols: string[];
}

const mockWatchlists: Watchlist[] = [
  { id: '1', name: 'Tech Giants', symbols: ['AAPL', 'MSFT', 'GOOGL', 'NVDA'] },
  { id: '2', name: 'Dividend Yield', symbols: ['JNJ', 'PG', 'KO'] },
  { id: '3', name: 'High Growth', symbols: ['TSLA', 'META', 'NFLX'] },
];

export default function WatchlistPage() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>(mockWatchlists);
  const [activeListId, setActiveListId] = useState<string>(mockWatchlists[0].id);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  const activeList = watchlists.find(w => w.id === activeListId);
  const activeStocks = activeList 
    ? stocks.filter(s => activeList.symbols.includes(s.symbol))
    : [];

  const handleCreateList = () => {
    const name = prompt('Enter new watchlist name:');
    if (name && name.trim()) {
      const newList = { id: Date.now().toString(), name, symbols: [] };
      setWatchlists([...watchlists, newList]);
      setActiveListId(newList.id);
    }
  };

  const handleDeleteList = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this watchlist?')) {
      const updated = watchlists.filter(w => w.id !== id);
      setWatchlists(updated);
      if (activeListId === id && updated.length > 0) {
        setActiveListId(updated[0].id);
      }
    }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Watchlists</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Track and manage your custom lists of stocks</p>
        </div>
        <button onClick={handleCreateList} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 'var(--radius-md)',
          background: 'var(--gradient-primary)', color: '#fff', fontSize: 13, fontWeight: 600,
        }}>
          <Plus size={16} /> New Watchlist
        </button>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Sidebar Lists */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          style={{
            padding: 16, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', gap: 8,
          }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', paddingLeft: 8 }}>Your Lists</h3>
          {watchlists.map(list => (
            <button key={list.id} onClick={() => setActiveListId(list.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px',
                borderRadius: 'var(--radius-md)', background: activeListId === list.id ? 'var(--accent-cyan-dim)' : 'transparent',
                color: activeListId === list.id ? 'var(--accent-cyan)' : 'var(--text-primary)',
                border: \`1px solid \${activeListId === list.id ? 'var(--accent-cyan)' : 'transparent'}\`,
                transition: 'var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{list.name}</span>
                <span style={{ fontSize: 11, color: activeListId === list.id ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>{list.symbols.length} symbols</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }} className="list-actions">
                 <button onClick={(e) => handleDeleteList(list.id, e)} style={{ padding: 4, color: 'var(--text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                   <Trash2 size={14} />
                 </button>
              </div>
            </button>
          ))}
          {watchlists.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
              No watchlists found.
            </div>
          )}
        </motion.div>

        {/* Content Area */}
        {activeList && (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={activeList.id} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
             
             {/* Header Tools */}
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                 {activeList.name} 
                 <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)', fontSize: 11, color: 'var(--text-muted)', border: '1px solid var(--border-glass)' }}>
                   {activeList.symbols.length} Items
                 </span>
               </h2>
               <div style={{ display: 'flex', gap: 8 }}>
                 <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', padding: 4, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                   {[{ key: 'grid' as const, icon: LayoutGrid }, { key: 'list' as const, icon: List }].map(v => (
                     <button key={v.key} onClick={() => setView(v.key)} style={{
                       padding: 6, borderRadius: 'var(--radius-sm)',
                       background: view === v.key ? 'var(--accent-cyan-dim)' : 'transparent',
                       color: view === v.key ? 'var(--accent-cyan)' : 'var(--text-muted)',
                     }}><v.icon size={16} /></button>
                   ))}
                 </div>
               </div>
             </div>

             {/* Grid View */}
             {view === 'grid' && activeStocks.length > 0 && (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                 <AnimatePresence>
                 {activeStocks.map((s, i) => (
                   <motion.button layout key={s.symbol} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                     onClick={() => navigate(\`/stocks/\${s.symbol}\`)}
                     style={{
                       padding: 20, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
                       border: '1px solid var(--border-primary)', textAlign: 'left',
                       transition: 'var(--transition-base)', display: 'flex', flexDirection: 'column', gap: 12,
                     }}
                     onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(6,214,160,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                     onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                   >
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div>
                         <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{s.symbol}</div>
                         <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.name}</div>
                       </div>
                       <Play size={18} color="var(--accent-cyan)" style={{ opacity: 0.8 }} />
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                       <span style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>\${s.price.toFixed(2)}</span>
                       <span style={{
                         fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono)',
                         color: s.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                         display: 'flex', alignItems: 'center', gap: 3,
                       }}>
                         {s.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                         {formatPercent(s.changePercent)}
                       </span>
                     </div>
                   </motion.button>
                 ))}
                 </AnimatePresence>
               </div>
             )}

             {/* List View */}
             {view === 'list' && activeStocks.length > 0 && (
                <div style={{ borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border-primary)', overflow: 'hidden' }}>
                    <div style={{
                      display: 'grid', gridTemplateColumns: '120px 1fr 120px 120px 100px',
                      padding: '12px 20px', borderBottom: '1px solid var(--border-glass)',
                      fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase',
                    }}>
                      <span>Symbol</span><span>Name</span><span style={{ textAlign: 'right' }}>Price</span>
                      <span style={{ textAlign: 'right' }}>Change</span><span style={{ textAlign: 'right' }}>Volume</span>
                    </div>
                    {activeStocks.map((s, i) => (
                      <motion.button layout key={s.symbol} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        onClick={() => navigate(\`/stocks/\${s.symbol}\`)}
                        style={{
                          display: 'grid', gridTemplateColumns: '120px 1fr 120px 120px 100px',
                          padding: '14px 20px', width: '100%', textAlign: 'left',
                          borderBottom: '1px solid var(--border-glass)', transition: 'var(--transition-fast)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 14 }}>{s.symbol}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.name}</span>
                        <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600 }}>\${s.price.toFixed(2)}</span>
                        <span style={{
                          textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
                          color: s.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                        }}>{formatPercent(s.changePercent)}</span>
                        <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{formatVolume(s.volume)}</span>
                      </motion.button>
                    ))}
                </div>
             )}

             {activeStocks.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-glass)' }}>
                   <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 12 }}>This watchlist is currently empty.</p>
                   <button onClick={() => navigate('/stocks')} style={{ padding: '8px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Browse Stocks</button>
                </div>
             )}
           </motion.div>
        )}
      </div>
    </div>
  );
}
