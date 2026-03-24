import { useState } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, TrendingDown, Clock, Filter, Zap } from 'lucide-react';
import { formatPercent } from '../lib/utils';
import { stocks } from '../lib/mockData';

const mockNews = [
  {
    id: '1', title: 'Federal Reserve Signals Potential Rate Cuts Later This Year',
    summary: 'Central bank officials indicated that if inflation data continues its downward trend, they may consider rate cuts by Q4.',
    source: 'Financial Times', time: '10 mins ago', category: 'Macroeconomics', impact: 'Bullish', sentimentScore: 0.8, symbols: ['SPY', 'QQQ']
  },
  {
    id: '2', title: 'Tech Sector Rallies as AI Adoption Accelerates',
    summary: 'Major cloud providers are seeing unprecedented demand for AI computing resources, driving up tech valuations globally.',
    source: 'TechCrunch', time: '1 hour ago', category: 'Technology', impact: 'Bullish', sentimentScore: 0.9, symbols: ['MSFT', 'GOOGL', 'NVDA']
  },
  {
    id: '3', title: 'Oil Prices Dip Amid Global Supply Concerns',
    summary: 'Unexpected buildup in crude inventories has led to a slight pullback in energy markets this morning.',
    source: 'Reuters', time: '2 hours ago', category: 'Energy', impact: 'Bearish', sentimentScore: -0.6, symbols: ['XOM', 'CVX']
  },
  {
    id: '4', title: 'Consumer Spending Shows Signs of Cooling',
    summary: 'Retail sales data fell short of expectations, pointing to potential headwinds for consumer discretionary stocks.',
    source: 'Bloomberg', time: '4 hours ago', category: 'Retail', impact: 'Bearish', sentimentScore: -0.4, symbols: ['AMZN', 'WMT']
  },
  {
    id: '5', title: 'Electric Vehicle Deliveries Beat Wall Street Estimates',
    summary: 'Leading EV manufacturers reported strong Q1 deliveries, shaking off concerns of slowing consumer demand in the sector.',
    source: 'WSJ', time: '5 hours ago', category: 'Automotive', impact: 'Bullish', sentimentScore: 0.7, symbols: ['TSLA', 'RIVN']
  },
];

const categories = ['All', 'Macroeconomics', 'Technology', 'Energy', 'Retail', 'Automotive'];

export default function NewsPage() {
  const [filter, setFilter] = useState('All');

  const filteredNews = mockNews.filter(n => filter === 'All' || n.category === filter);

  const getImpactColor = (impact: string) => {
    return impact === 'Bullish' ? 'var(--accent-green)' : impact === 'Bearish' ? 'var(--accent-red)' : 'var(--accent-amber)';
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Newspaper size={24} color="var(--accent-blue)" /> Market News
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Real-time news and AI sentiment analysis</p>
      </motion.div>

      {/* Top Headline */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{
          padding: 24, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)', marginBottom: 24, position: 'relative', overflow: 'hidden'
        }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: 'var(--accent-blue)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Top Story</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {mockNews[0].time}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 'var(--radius-sm)', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
            <Zap size={14} color="var(--accent-green)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-green)' }}>Highly Bullish</span>
          </div>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>{mockNews[0].title}</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{mockNews[0].summary}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Source: {mockNews[0].source}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {mockNews[0].symbols.map(sym => (
              <span key={sym} style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{sym}</span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: 12 }}>
          <Filter size={14} /> Category
        </div>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600,
            background: filter === c ? 'var(--accent-blue-dim)' : 'var(--bg-card)',
            color: filter === c ? 'var(--accent-blue)' : 'var(--text-secondary)',
            border: `1px solid ${filter === c ? 'rgba(59, 130, 246, 0.3)' : 'var(--border-primary)'}`,
            transition: 'var(--transition-fast)', whiteSpace: 'nowrap'
          }}>
            {c}
          </button>
        ))}
      </div>

      {/* News List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredNews.slice(1).map((news, i) => {
          const impactCol = getImpactColor(news.impact);
          return (
            <motion.div key={news.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * (i + 1) }}
              style={{
                padding: 20, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', gap: 12,
                transition: 'var(--transition-base)'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-glass-hover)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-primary)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {news.time}</span>
                  <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)', fontSize: 10, textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-secondary)' }}>{news.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: impactCol, fontSize: 12, fontWeight: 700 }}>
                  {news.impact === 'Bullish' ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {news.impact}
                </div>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{news.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{news.summary}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{news.source}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {news.symbols.map(sym => {
                    const stock = stocks.find(s => s.symbol === sym);
                    const isPos = stock ? stock.change >= 0 : true;
                    return (
                      <span key={sym} style={{
                        display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 'var(--radius-full)',
                        background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)'
                      }}>
                        {sym}
                        {stock && <span style={{ color: isPos ? 'var(--accent-green)' : 'var(--accent-red)' }}>{isPos ? '+' : ''}{formatPercent(stock.changePercent)}</span>}
                      </span>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div >
  );
}
