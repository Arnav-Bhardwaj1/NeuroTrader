import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Key, Moon, Sun, Monitor, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Moon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & API', icon: Shield },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Settings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Manage your account, preferences, and API connections.</p>
        </div>
        {saved && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-green)', fontSize: 13, fontWeight: 600 }}>
            <CheckCircle2 size={16} /> Changes saved
          </motion.div>
        )}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'start' }}>

        {/* Settings Navigation */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                borderRadius: 'var(--radius-md)', transition: 'var(--transition-fast)',
                background: activeTab === t.id ? 'var(--bg-card)' : 'transparent',
                color: activeTab === t.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === t.id ? 'var(--border-primary)' : 'transparent'}`,
                fontWeight: activeTab === t.id ? 600 : 500, fontSize: 14,
              }}>
              <t.icon size={18} /> {t.label}
            </button>
          ))}
        </motion.div>

        {/* Content Area */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            padding: 28, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)'
          }}>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingBottom: 24, borderBottom: '1px solid var(--border-glass)' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 'var(--radius-full)', background: 'var(--gradient-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff'
                }}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{user?.name || 'Neuro Trader'}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>{user?.email || 'trader@neurotrader.ai'}</p>
                  <button style={{ padding: '6px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Change Avatar</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Full Name</label>
                  <input defaultValue={user?.name || ''} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Email Address</label>
                  <input defaultValue={user?.email || ''} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontSize: 14 }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Bio (Optional)</label>
                  <textarea rows={3} placeholder="Tell us a little about your trading experience..." style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontSize: 14, resize: 'vertical' }} />
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Appearance</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[{ id: 'system', icon: Monitor, label: 'System' }, { id: 'dark', icon: Moon, label: 'Dark' }, { id: 'light', icon: Sun, label: 'Light' }].map(theme => (
                    <button key={theme.id} style={{
                      padding: '16px', borderRadius: 'var(--radius-md)', background: theme.id === 'dark' ? 'var(--accent-cyan-dim)' : 'var(--bg-tertiary)',
                      border: `1px solid ${theme.id === 'dark' ? 'var(--accent-cyan)' : 'var(--border-primary)'}`,
                      color: theme.id === 'dark' ? 'var(--accent-cyan)' : 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
                    }}>
                      <theme.icon size={20} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <hr style={{ border: 0, borderTop: '1px solid var(--border-glass)' }} />

              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Date & Currency</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Default Currency</label>
                    <select style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontSize: 14 }}>
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Timezone</label>
                    <select style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontSize: 14 }}>
                      <option>Eastern Time (ET)</option>
                      <option>Pacific Time (PT)</option>
                      <option>UTC</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Notification Preferences</h3>

              {[
                { title: 'Trade Executions', desc: 'Get notified when paper or real trades execute.' },
                { title: 'Price Alerts', desc: 'Push notifications for items on your watchlist hitting target prices.' },
                { title: 'AI Signals', desc: 'New "Strong Buy" or "Strong Sell" signals generated by Neuro AI.' },
                { title: 'Daily Summary', desc: 'A morning digest of your portfolio performance and market news.' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                  {/* Mock Toggle */}
                  <div style={{ width: 40, height: 22, background: i < 3 ? 'var(--accent-cyan)' : 'var(--border-primary)', borderRadius: 11, padding: 2, position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: 18, height: 18, background: '#fff', borderRadius: '50%', transform: `translateX(${i < 3 ? 18 : 0}px)`, transition: '0.2s' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Password Reset</h3>
                <button style={{ padding: '10px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Send Password Reset Email</button>
              </div>

              <hr style={{ border: 0, borderTop: '1px solid var(--border-glass)' }} />

              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Brokerage API Connections</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Connect your real brokerage accounts to execute trades directly from NeuroTrader signals.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['Alpaca', 'Interactive Brokers', 'Robinhood'].map((broker, i) => (
                    <div key={broker} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Key size={14} color="var(--accent-violet)" />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{broker}</span>
                      </div>
                      <button style={{ padding: '6px 14px', background: i === 0 ? 'rgba(0, 255, 136, 0.1)' : 'transparent', color: i === 0 ? 'var(--accent-green)' : 'var(--text-muted)', border: `1px solid ${i === 0 ? 'var(--accent-green)' : 'var(--border-primary)'}`, borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600 }}>
                        {i === 0 ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleSave} style={{ padding: '10px 24px', background: 'var(--gradient-primary)', color: '#fff', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600 }}>
              Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
