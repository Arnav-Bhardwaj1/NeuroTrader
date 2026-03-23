import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { setError('Please fill in all fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    const ok = await signup(name, email, password);
    if (ok) navigate('/dashboard');
    else { setError('Registration failed'); setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '15%', right: '25%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', left: '25%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,214,160,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

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
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Create your account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Start trading with AI-powered insights</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-red-dim)', color: 'var(--accent-red)', fontSize: 13 }}>{error}</div>}
          {[
            { icon: User, value: name, set: setName, placeholder: 'Full name', type: 'text' },
            { icon: Mail, value: email, set: setEmail, placeholder: 'Email address', type: 'email' },
            { icon: Lock, value: password, set: setPassword, placeholder: 'Password (min 6 chars)', type: 'password' },
          ].map((f) => (
            <div key={f.placeholder} style={{ position: 'relative' }}>
              <f.icon size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                style={{
                  width: '100%', padding: '14px 14px 14px 44px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                  fontSize: 14, color: 'var(--text-primary)', transition: 'var(--transition-base)',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border-primary)'}
              />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{
            padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)',
            color: '#fff', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1,
          }}>
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <>Create Account <ArrowRight size={16} /></>}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
