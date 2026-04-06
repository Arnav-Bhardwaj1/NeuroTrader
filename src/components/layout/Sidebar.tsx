import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Newspaper, Settings, LogOut, TrendingUp, BarChart3, Briefcase, Brain, LayoutDashboard, ChevronLeft, ChevronRight, BrainCircuit, BookOpen } from 'lucide-react';

import { useAuth } from '../../lib/auth';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/watchlists', label: 'Watchlists', icon: Star },
  { path: '/stocks', label: 'Stocks', icon: BarChart3 },
  { path: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { path: '/ai-insights', label: 'AI Insights', icon: Brain },
  { path: '/news', label: 'News', icon: Newspaper },
  { path: '/strategy', label: 'Strategy', icon: BrainCircuit },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/settings', label: 'Settings', icon: Settings },

];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const w = collapsed ? 72 : 260;

  return (
    <motion.aside animate={{ width: w }} transition={{ duration: 0.25, ease: 'easeInOut' }}
      style={{
        height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 50,
        background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-primary)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 20px', display: 'flex', alignItems: 'center',
        gap: 10, justifyContent: collapsed ? 'center' : 'flex-start',
        borderBottom: '1px solid var(--border-glass)', minHeight: 64,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9, background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <TrendingUp size={18} color="#fff" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ fontSize: 18, fontWeight: 700, whiteSpace: 'nowrap' }}>
              Neuro<span className="gradient-text">Trader</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Market Status */}
      <div style={{
        padding: collapsed ? '12px 0' : '12px 20px', display: 'flex', alignItems: 'center',
        gap: 8, justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)',
          boxShadow: '0 0 8px var(--accent-green)', flexShrink: 0,
        }} />
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 500 }}>Market Open</motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: collapsed ? '12px 0' : '12px 16px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 'var(--radius-md)',
              background: isActive ? 'var(--accent-cyan-dim)' : 'transparent',
              color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontSize: 14, fontWeight: isActive ? 600 : 400,
              transition: 'all 0.2s ease', textDecoration: 'none',
              position: 'relative',
            })}
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                {isActive && (
                  <motion.div layoutId="activeNav" style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: 3, height: 20, borderRadius: 2, background: 'var(--accent-cyan)',
                  }} />
                )}
                <item.icon size={20} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ whiteSpace: 'nowrap' }}>{item.label}</motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(!collapsed)} style={{
        padding: 12, margin: '0 8px', borderRadius: 'var(--radius-md)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', transition: 'var(--transition-base)',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* User */}
      <div style={{
        padding: collapsed ? '16px 0' : '16px 16px', borderTop: '1px solid var(--border-glass)',
        display: 'flex', alignItems: 'center', gap: 12, justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 'var(--radius-full)',
          background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Trader'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || 'trader@neurotrader.ai'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!collapsed && (
          <button onClick={() => { logout(); navigate('/'); }} style={{ color: 'var(--text-muted)', padding: 4 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-red)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </motion.aside>
  );
}
