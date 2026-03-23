import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, TrendingUp, BarChart3, Shield, Zap, LineChart, ArrowRight, Activity } from 'lucide-react';
import { stocks } from '../../lib/mockData';

/* ── Ticker Tape ──────────────────────────────────────────────── */
function TickerTape() {
  const items = [...stocks, ...stocks];
  return (
    <div style={{
      overflow: 'hidden', width: '100%', borderTop: '1px solid var(--border-glass)',
      borderBottom: '1px solid var(--border-glass)', padding: '10px 0', background: 'rgba(10,14,23,0.8)',
    }}>
      <div style={{
        display: 'flex', gap: 40, whiteSpace: 'nowrap', animation: 'ticker-scroll 30s linear infinite', width: 'max-content',
      }}>
        {items.map((s, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{s.symbol}</strong>
            <span style={{ color: 'var(--text-secondary)' }}>${s.price.toFixed(2)}</span>
            <span style={{ color: s.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {s.change >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Animated Background ──────────────────────────────────────── */
function AnimatedBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = [];
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5, o: Math.random() * 0.5 + 0.1,
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6,214,160,${p.o})`; ctx.fill();
      });
      // draw lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(6,214,160,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

/* ── Mini Chart SVG ───────────────────────────────────────────── */
function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data); const min = Math.min(...data);
  const h = 40; const w = 120;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min)) * h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${points} ${w},${h}`} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Features Data ────────────────────────────────────────────── */
const features = [
  { icon: Brain, title: 'AI Price Prediction', desc: 'Neural networks analyze patterns to predict price movements with confidence intervals.' },
  { icon: Activity, title: 'Sentiment Analysis', desc: 'NLP models process news, social media, and analyst reports for real-time sentiment.' },
  { icon: Zap, title: 'Smart Trading Signals', desc: 'AI-generated BUY/SELL/HOLD signals with confidence scores and reasoning.' },
  { icon: BarChart3, title: 'Portfolio Analytics', desc: 'Track performance, allocation, and P&L with interactive charts and benchmarks.' },
  { icon: Shield, title: 'Risk Assessment', desc: 'Comprehensive risk scoring with volatility, beta, Sharpe ratio analysis.' },
  { icon: LineChart, title: 'Interactive Charts', desc: 'Professional candlestick charts with AI prediction overlays and indicators.' },
];

const steps = [
  { num: '01', title: 'Add Stocks', desc: 'Search and add stocks to your watchlist. Our AI begins analyzing immediately.' },
  { num: '02', title: 'AI Analyzes', desc: 'Our neural networks process price data, news sentiment, and market patterns.' },
  { num: '03', title: 'Get Insights', desc: 'Receive predictions, signals, and risk assessments to make informed decisions.' },
];

/* ── Landing Page ─────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 40px', borderBottom: '1px solid var(--border-glass)',
        background: 'rgba(10,14,23,0.9)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingUp size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700 }}>Neuro<span className="gradient-text">Trader</span></span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/login')} style={{
            padding: '8px 20px', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)',
            border: '1px solid var(--border-primary)', fontSize: 14, fontWeight: 500,
            transition: 'var(--transition-base)',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >Log In</button>
          <button onClick={() => navigate('/signup')} style={{
            padding: '8px 20px', borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-primary)', color: '#fff', fontSize: 14, fontWeight: 600,
          }}>Get Started</button>
        </div>
      </nav>

      {/* Ticker */}
      <TickerTape />

      {/* Hero */}
      <section style={{ position: 'relative', padding: '100px 40px 80px', textAlign: 'center', overflow: 'hidden' }}>
        <AnimatedBg />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
            borderRadius: 'var(--radius-full)', background: 'var(--accent-cyan-dim)',
            border: '1px solid rgba(6,214,160,0.2)', marginBottom: 24, fontSize: 13, fontWeight: 500,
            color: 'var(--accent-cyan)',
          }}>
            <Zap size={14} /> Powered by Neural Networks
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 72px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24,
            letterSpacing: '-0.02em',
          }}>
            Trade Smarter with{' '}
            <span className="gradient-text-hero">Artificial Intelligence</span>
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7 }}>
            AI-powered stock analysis with real-time predictions, sentiment tracking, smart trading signals,
            and comprehensive portfolio analytics.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)', padding: 4, maxWidth: 400, width: '100%',
            }}>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email"
                style={{ flex: 1, padding: '12px 16px', fontSize: 15, color: 'var(--text-primary)', background: 'none' }} />
              <button onClick={() => navigate('/signup')} style={{
                padding: '12px 24px', borderRadius: 'var(--radius-sm)', background: 'var(--gradient-primary)',
                color: '#fff', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6,
                whiteSpace: 'nowrap',
              }}>
                Start Free <ArrowRight size={16} />
              </button>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>No credit card required · Free tier available</p>
        </motion.div>

        {/* Stats strip */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
          style={{
            display: 'flex', justifyContent: 'center', gap: 48, marginTop: 60, flexWrap: 'wrap',
            position: 'relative', zIndex: 1,
          }}>
          {[
            { label: 'Prediction Accuracy', value: '73.2%' },
            { label: 'Stocks Tracked', value: '5,000+' },
            { label: 'Signals Generated', value: '12K/day' },
            { label: 'Active Users', value: '25K+' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-mono)' }} className="gradient-text">{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, marginBottom: 16 }}>
            AI-Powered <span className="gradient-text">Trading Intelligence</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 17, maxWidth: 550, margin: '0 auto' }}>
            Everything you need to make data-driven trading decisions, powered by cutting-edge machine learning.
          </p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{
                padding: 28, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)', transition: 'var(--transition-base)', cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(6,214,160,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: 'var(--accent-cyan-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <f.icon size={24} color="var(--accent-cyan)" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 40px', maxWidth: 900, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, marginBottom: 16 }}>
            How It <span className="gradient-text">Works</span>
          </h2>
        </motion.div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {steps.map((s, i) => (
            <motion.div key={s.num} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              style={{
                display: 'flex', gap: 28, alignItems: 'flex-start', padding: '28px 0',
                borderBottom: i < steps.length - 1 ? '1px solid var(--border-glass)' : 'none',
              }}
            >
              <div style={{
                fontSize: 36, fontWeight: 900, fontFamily: 'var(--font-mono)',
                background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                minWidth: 60,
              }}>{s.num}</div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{s.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 40px', textAlign: 'center', margin: '0 40px 40px',
        borderRadius: 'var(--radius-xl)', background: 'var(--gradient-card)',
        border: '1px solid var(--border-primary)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -100, right: -100, width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(6,214,160,0.1) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <h2 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 800, marginBottom: 16, position: 'relative' }}>
          Ready to <span className="gradient-text">Trade Smarter</span>?
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 32, maxWidth: 500, margin: '0 auto 32px', position: 'relative' }}>
          Join thousands of traders using AI to make better decisions.
        </p>
        <button onClick={() => navigate('/signup')} style={{
          padding: '14px 32px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)',
          color: '#fff', fontWeight: 700, fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 8,
          position: 'relative',
        }}>
          Get Started for Free <ArrowRight size={18} />
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px', borderTop: '1px solid var(--border-glass)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={18} color="var(--accent-cyan)" />
          <span style={{ fontWeight: 700 }}>NeuroTrader</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>© 2026</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['About', 'Features', 'Pricing', 'API', 'Contact'].map((l) => (
            <a key={l} href="#" style={{ color: 'var(--text-muted)', fontSize: 13, transition: 'var(--transition-base)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
