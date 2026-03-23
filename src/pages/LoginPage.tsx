import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    const ok = await login(email, password);
    if (ok) navigate('/dashboard');
    else { setError('Invalid credentials'); setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: 20,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: '10%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,214,160,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{
          width: '100%', maxWidth: 420, padding: 40, borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-glass)', backdropFilter: 'blur(24px)', border: '1px solid var(--border-glass)',
        }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="#fff" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700 }}>Neuro<span className="gradient-text">Trader</span></span>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Sign in to your trading dashboard</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-red-dim)', color: 'var(--accent-red)', fontSize: 13 }}>{error}</div>
          )}
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address"
              style={{
                width: '100%', padding: '14px 14px 14px 44px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                fontSize: 14, color: 'var(--text-primary)', transition: 'var(--transition-base)',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-primary)'}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
              style={{
                width: '100%', padding: '14px 14px 14px 44px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                fontSize: 14, color: 'var(--text-primary)', transition: 'var(--transition-base)',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-primary)'}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)',
            color: '#fff', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1,
          }}>
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <>Sign In <ArrowRight size={16} /></>}
          </button>
        </form>

        {/* Social login */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-primary)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-primary)' }} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {['Google', 'GitHub'].map(p => (
            <button key={p} onClick={() => { login('demo@neurotrader.ai', 'demo'); navigate('/dashboard'); }}
              style={{
                flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)', fontSize: 14, fontWeight: 500,
                color: 'var(--text-secondary)', transition: 'var(--transition-base)',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-primary)'}
            >{p}</button>
          ))}
        </div>
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
