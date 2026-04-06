import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  TrendingUp,
  Brain,
  Calendar,
  Search,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Clock,
  Target,
  ShieldCheck
} from 'lucide-react';


import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { JournalService } from '../lib/JournalService';
import type { TradeEntry, JournalStats, PsychologyInsight } from '../lib/JournalService';

import './JournalPage.css';

const JournalPage: React.FC = () => {
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [insight, setInsight] = useState<PsychologyInsight | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');

  useEffect(() => {
    setTrades(JournalService.getTrades());
    setStats(JournalService.getStats());
    setInsight(JournalService.getAiInsight());
  }, []);

  const filteredTrades = trades.filter(t => {
    const matchesSearch = t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.setup.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'ALL' || t.status === filterType;
    return matchesSearch && matchesFilter;
  });

  if (!stats || !insight) return <div className="loading-state">Loading NeuroJournal...</div>;

  const equityData = JournalService.getEquityCurve();

  return (
    <motion.div
      className="journal-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <header className="page-header">
        <div className="header-content">
          <h1><BookOpen size={36} className="icon-gradient" /> NeuroJournal</h1>
          <p className="subtitle">AI-Driven Trade Analysis & Performance Tracking</p>
        </div>
        <div className="header-actions">
          <button className="glass-button secondary">
            <Calendar size={18} /> Export PDF
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <StatWidget
          label="Total P&L"
          value={`$${stats.totalPnL.toLocaleString()}`}
          trend={stats.totalPnL >= 0 ? 'up' : 'down'}
          icon={<TrendingUp size={20} />}
        />
        <StatWidget
          label="Win Rate"
          value={`${stats.winRate}%`}
          subtext={`${stats.totalTrades} Total Trades`}
          icon={<Target size={20} />}
        />
        <StatWidget
          label="Profit Factor"
          value={stats.profitFactor.toString()}
          subtext="Total Gain / Total Loss"
          icon={<Zap size={20} />}
        />
        <StatWidget
          label="Expectancy"
          value={`$${stats.expectancy}`}
          subtext="Expected Value per Trade"
          icon={<ShieldCheck size={20} />}
        />
      </div>

      <motion.div
        className="ai-insight-card"
        whileHover={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className="insight-icon-wrapper">
          <Brain size={32} />
        </div>
        <div className="insight-content">
          <div className="insight-badge-row">
            <span className={`insight-type-tag ${insight.type.toLowerCase()}`}>
              AI PSYCHOLOGY INSIGHT
            </span>
          </div>
          <h3>{insight.title}</h3>
          <p>{insight.description}</p>
        </div>
        <div className="insight-score-badge">
          NeuroScore: {insight.score}
        </div>
      </motion.div>

      <div className="journal-layout">
        <div className="chart-section">
          <div className="glass-card chart-container">
            <h3><BarChart3 size={20} className="text-accent" /> Equity Growth (Mock)</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis
                    domain={['dataMin - 500', 'dataMax + 500']}
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--accent-primary)"
                    fillOpacity={1}
                    fill="url(#equityGradient)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card chart-container">
            <h3><BarChart3 size={20} className="text-accent" /> P&L Distribution</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trades.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="symbol" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {trades.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="trade-list-section">
          <div className="glass-card trade-log-container">
            <div className="log-header">
              <h3>Recent Trades</h3>
              <div className="log-actions">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search symbols..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="filter-tabs">
              <button
                className={`filter-tab ${filterType === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterType('ALL')}
              >All</button>
              <button
                className={`filter-tab ${filterType === 'WIN' ? 'active' : ''}`}
                onClick={() => setFilterType('WIN')}
              >Wins</button>
              <button
                className={`filter-tab ${filterType === 'LOSS' ? 'active' : ''}`}
                onClick={() => setFilterType('LOSS')}
              >Losses</button>
            </div>

            <div className="trades-scroll">
              <AnimatePresence mode="popLayout">
                {filteredTrades.map((trade) => (
                  <TradeCard key={trade.id} trade={trade} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StatWidget: React.FC<{
  label: string;
  value: string;
  trend?: 'up' | 'down';
  subtext?: string;
  icon: React.ReactNode;
}> = ({ label, value, trend, subtext, icon }) => (
  <div className="glass-card stat-card">
    <div className="stat-icon">{icon}</div>
    <span className="stat-label">{label}</span>
    <div className="stat-value">{value}</div>
    {trend && (
      <div className={`stat-trend ${trend === 'up' ? 'text-up' : 'text-down'}`}>
        {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        <span>{trend === 'up' ? 'Profitable' : 'Drawdown'}</span>
      </div>
    )}
    {subtext && <div className="stat-subtext">{subtext}</div>}
  </div>
);

const TradeCard: React.FC<{ trade: TradeEntry }> = ({ trade }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="glass-card trade-card"
    >
      <div className="trade-card-header">
        <div className="trade-id-group">
          <span className="symbol-tag">{trade.symbol}</span>
          <span className={`type-badge ${trade.type.toLowerCase()}`}>{trade.type}</span>
        </div>
        <div className={`pnl-value ${trade.pnl >= 0 ? 'text-up' : 'text-down'}`}>
          {trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl).toLocaleString()}
        </div>
      </div>

      <div className="trade-card-details">
        <div className="detail-item">
          <Clock size={12} /> {trade.entryTime}
        </div>
        <div className="detail-item text-right">
          <TrendingUp size={12} /> {trade.pnlPercentage}%
        </div>
      </div>

      <div className="trade-card-footer">
        <span className="setup-tag">{trade.setup}</span>
        <span className="trade-date">{trade.exitTime}</span>
      </div>
    </motion.div>
  );
};

export default JournalPage;
