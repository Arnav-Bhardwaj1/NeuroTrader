import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BrainCircuit,
  Play,
  Plus,
  Trash2,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  BarChart3,
  History,
  Info,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { StrategyBacktester, Strategy, StrategyRule, BacktestResults } from '../lib/StrategyBacktester';
import { stockCandlestickData, stocks } from '../lib/mockData';
import './StrategyPage.css';

const StrategyPage: React.FC = () => {
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [strategy, setStrategy] = useState<Strategy>({
    name: 'New Momentum Strategy',
    entryRules: [
      { indicator: 'RSI', period: 14, operator: '<', value: 30 }
    ],
    exitRules: [
      { indicator: 'RSI', period: 14, operator: '>', value: 70 }
    ]
  });
  const [results, setResults] = useState<BacktestResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runBacktest = () => {
    setIsRunning(true);
    // Simulate processing time
    setTimeout(() => {
      const data = stockCandlestickData[selectedStock] || [];
      const res = StrategyBacktester.runBacktest(data, strategy);
      setResults(res);
      setIsRunning(false);
    }, 800);
  };

  const addRule = (type: 'entry' | 'exit') => {
    const newRule: StrategyRule = { indicator: 'SMA', period: 20, operator: '>', value: 150 };
    if (type === 'entry') {
      setStrategy({ ...strategy, entryRules: [...strategy.entryRules, newRule] });
    } else {
      setStrategy({ ...strategy, exitRules: [...strategy.exitRules, newRule] });
    }
  };

  const removeRule = (type: 'entry' | 'exit', index: number) => {
    if (type === 'entry') {
      const entryRules = [...strategy.entryRules];
      entryRules.splice(index, 1);
      setStrategy({ ...strategy, entryRules });
    } else {
      const exitRules = [...strategy.exitRules];
      exitRules.splice(index, 1);
      setStrategy({ ...strategy, exitRules });
    }
  };

  const updateRule = (type: 'entry' | 'exit', index: number, field: keyof StrategyRule, value: any) => {
    if (type === 'entry') {
      const entryRules = [...strategy.entryRules];
      entryRules[index] = { ...entryRules[index], [field]: value };
      setStrategy({ ...strategy, entryRules });
    } else {
      const exitRules = [...strategy.exitRules];
      exitRules[index] = { ...exitRules[index], [field]: value };
      setStrategy({ ...strategy, exitRules });
    }
  };

  return (
    <div className="strategy-page">
      <header className="page-header">
        <div className="header-content">
          <h1><BrainCircuit size={28} className="icon-gradient" /> NeuroStrategy</h1>
          <p className="subtitle">AI-Powered Strategy Builder & Backtester</p>
        </div>
        <button
          className={`run-button ${isRunning ? 'running' : ''}`}
          onClick={runBacktest}
          disabled={isRunning}
        >
          {isRunning ? <div className="loader" /> : <Play size={20} />}
          <span>{isRunning ? 'Analyzing Market...' : 'Run Backtest'}</span>
        </button>
      </header>

      <div className="strategy-grid">
        {/* Left Column: Configuration */}
        <div className="config-section">
          <div className="glass-card strategy-setup">
            <h3><BarChart3 size={20} /> Setup</h3>
            <div className="field-group">
              <label>Select Asset</label>
              <select value={selectedStock} onChange={(e) => setSelectedStock(e.target.value)}>
                {stocks.map(s => <option key={s.symbol} value={s.symbol}>{s.symbol} - {s.name}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label>Strategy Name</label>
              <input
                type="text"
                value={strategy.name}
                onChange={(e) => setStrategy({ ...strategy, name: e.target.value })}
              />
            </div>
          </div>

          <div className="glass-card rules-container">
            <div className="rules-header">
              <h3><TrendingUp size={20} /> Entry Rules</h3>
              <button className="add-rule-btn" onClick={() => addRule('entry')}><Plus size={16} /></button>
            </div>
            <p className="rules-hint">Buy when ALL conditions are met</p>
            <div className="rules-list">
              {strategy.entryRules.map((rule, idx) => (
                <RuleItem
                  key={`entry-${idx}`}
                  rule={rule}
                  onRemove={() => removeRule('entry', idx)}
                  onUpdate={(f, v) => updateRule('entry', idx, f, v)}
                />
              ))}
            </div>
          </div>

          <div className="glass-card rules-container">
            <div className="rules-header">
              <h3><TrendingDown size={20} /> Exit Rules</h3>
              <button className="add-rule-btn" onClick={() => addRule('exit')}><Plus size={16} /></button>
            </div>
            <p className="rules-hint">Sell when ANY condition is met</p>
            <div className="rules-list">
              {strategy.exitRules.map((rule, idx) => (
                <RuleItem
                  key={`exit-${idx}`}
                  rule={rule}
                  onRemove={() => removeRule('exit', idx)}
                  onUpdate={(f, v) => updateRule('exit', idx, f, v)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="results-section">
          {results ? (
            <div className="results-content">
              <div className="stats-row">
                <StatCard
                  label="Total Return"
                  value={`${results.totalReturnPercent.toFixed(2)}%`}
                  trend={results.totalReturn >= 0 ? 'up' : 'down'}
                  subtext={`$${results.totalReturn.toLocaleString()}`}
                />
                <StatCard
                  label="Win Rate"
                  value={`${results.winRate.toFixed(1)}%`}
                />
                <StatCard
                  label="Max Drawdown"
                  value={`${results.maxDrawdown.toFixed(2)}%`}
                  trend="down"
                />
                <StatCard
                  label="Total Trades"
                  value={results.trades.length}
                />
              </div>

              <div className="glass-card chart-container">
                <h3>Equity Curve</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={results.equityCurve}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3c" vertical={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                        formatter={(value: any) => [`$${parseFloat(value).toLocaleString()}`, 'Portfolio Value']}
                      />
                      <Area type="monotone" dataKey="value" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card trade-log">
                <h3><History size={20} /> Trade History</h3>
                <div className="log-table-wrapper">
                  <table className="log-table">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Date</th>
                        <th>Price</th>
                        <th>Shares</th>
                        <th>Total</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.trades.map((trade, idx) => {
                        const isSell = trade.type === 'SELL';
                        let profit: number | null = null;
                        if (isSell && idx > 0) {
                          profit = trade.total - results.trades[idx - 1].total;
                        }

                        return (
                          <tr key={idx}>
                            <td><span className={`badge ${trade.type.toLowerCase()}`}>{trade.type}</span></td>
                            <td>{trade.time}</td>
                            <td>${trade.price}</td>
                            <td>{trade.shares}</td>
                            <td>${trade.total.toLocaleString()}</td>
                            <td className={profit !== null ? (profit >= 0 ? 'text-up' : 'text-down') : ''}>
                              {profit !== null ? `${profit >= 0 ? '+' : ''}${profit.toFixed(2)}` : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-results glass-card">
              <div className="empty-state">
                <BrainCircuit size={64} className="pulse-icon" />
                <h2>Ready for Simulation</h2>
                <p>Define your strategy rules and asset on the left, then click <strong>Run Backtest</strong> to see AI-driven performance analytics.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RuleItem: React.FC<{
  rule: StrategyRule;
  onRemove: () => void;
  onUpdate: (field: keyof StrategyRule, value: any) => void;
}> = ({ rule, onRemove, onUpdate }) => {
  return (
    <motion.div
      className="rule-item"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="rule-content">
        <select value={rule.indicator} onChange={(e) => onUpdate('indicator', e.target.value)}>
          <option value="SMA">SMA</option>
          <option value="EMA">EMA</option>
          <option value="RSI">RSI</option>
        </select>
        <span className="rule-label">p:</span>
        <input
          type="number"
          value={rule.period}
          className="period-input"
          onChange={(e) => onUpdate('period', parseInt(e.target.value))}
        />
        <select value={rule.operator} onChange={(e) => onUpdate('operator', e.target.value)}>
          <option value=">">{'>'}</option>
          <option value="<">{'<'}</option>
          <option value="CROSSES_ABOVE">Crosses Above</option>
          <option value="CROSSES_BELOW">Crosses Below</option>
        </select>
        <input
          type="number"
          value={rule.value}
          className="value-input"
          onChange={(e) => onUpdate('value', parseFloat(e.target.value))}
        />
      </div>
      <button className="remove-rule-btn" onClick={onRemove}><Trash2 size={14} /></button>
    </motion.div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; trend?: 'up' | 'down'; subtext?: string }> = ({ label, value, trend, subtext }) => (
  <div className="stat-card glass-card">
    <span className="stat-label">{label}</span>
    <div className="stat-value-group">
      <span className="stat-value">{value}</span>
      {trend && (
        trend === 'up' ? <TrendingUp size={16} className="text-up" /> : <TrendingDown size={16} className="text-down" />
      )}
    </div>
    {subtext && <span className="stat-subtext">{subtext}</span>}
  </div>
);

export default StrategyPage;
