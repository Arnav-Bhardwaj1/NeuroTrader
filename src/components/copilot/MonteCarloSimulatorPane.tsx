import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Zap,
  Sliders,
  BarChart3,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  NeuroCopilotEngine,
  type MonteCarloSimulation,
  type MacroShockScenario
} from '../../lib/NeuroCopilotEngine';

export const MonteCarloSimulatorPane: React.FC = () => {
  const [initialCapital, setInitialCapital] = useState<number>(100000);
  const [horizonDays, setHorizonDays] = useState<number>(30);
  const [volatility, setVolatility] = useState<number>(0.22);
  const [drift, setDrift] = useState<number>(0.12);
  const [selectedShockId, setSelectedShockId] = useState<string>('none');

  const macroScenarios = useMemo(() => NeuroCopilotEngine.getMacroScenarios(), []);

  const activeShock: MacroShockScenario | undefined = useMemo(() => {
    return macroScenarios.find(s => s.id === selectedShockId);
  }, [selectedShockId, macroScenarios]);

  const simulation: MonteCarloSimulation = useMemo(() => {
    return NeuroCopilotEngine.runMonteCarlo(
      initialCapital,
      horizonDays,
      1000,
      volatility,
      drift,
      activeShock
    );
  }, [initialCapital, horizonDays, volatility, drift, activeShock]);

  return (
    <div className="monte-carlo-container">
      {/* Top Controls Grid */}
      <div className="mc-controls-grid glass-card">
        <div className="mc-control-item">
          <label>Portfolio Value ($)</label>
          <input
            type="number"
            value={initialCapital}
            onChange={e => setInitialCapital(Number(e.target.value))}
            step={10000}
          />
        </div>

        <div className="mc-control-item">
          <label>Horizon (Days)</label>
          <select value={horizonDays} onChange={e => setHorizonDays(Number(e.target.value))}>
            <option value={10}>10 Days (Short Term)</option>
            <option value={30}>30 Days (1 Month)</option>
            <option value={60}>60 Days (2 Months)</option>
            <option value={90}>90 Days (Quarterly)</option>
          </select>
        </div>

        <div className="mc-control-item">
          <label><Sliders size={14} /> Annual Volatility ({(volatility * 100).toFixed(0)}%)</label>
          <input
            type="range"
            min="0.10"
            max="0.60"
            step="0.02"
            value={volatility}
            onChange={e => setVolatility(parseFloat(e.target.value))}
          />
        </div>

        <div className="mc-control-item">
          <label><Activity size={14} /> Expected Drift ({(drift * 100).toFixed(0)}%)</label>
          <input
            type="range"
            min="-0.20"
            max="0.40"
            step="0.02"
            value={drift}
            onChange={e => setDrift(parseFloat(e.target.value))}
          />
        </div>

        <div className="mc-control-item shock-selector">
          <label><Zap size={14} className="text-amber" /> Inject Macro Stress Shock</label>
          <select value={selectedShockId} onChange={e => setSelectedShockId(e.target.value)}>
            <option value="none">No Shock (Standard Brownian Motion)</option>
            {macroScenarios.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Shock Banner if active */}
      {activeShock && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="shock-active-banner"
        >
          <Zap size={18} className="text-amber icon-pulse" />
          <div>
            <strong>Active Stress Shock: {activeShock.label}</strong>
            <p>{activeShock.description} (Equity Impact: {activeShock.equityShockPct}%, Volatility Multiplier: {activeShock.volatilityMultiplier}x)</p>
          </div>
        </motion.div>
      )}

      {/* Key Risk Metrics Banner */}
      <div className="mc-metrics-row">
        <div className="mc-metric-card">
          <span className="metric-title">Expected Mean Value</span>
          <span className="metric-value text-cyan">${simulation.meanFinalValue.toLocaleString()}</span>
          <span className="metric-sub">P50 Median: ${simulation.medianFinalValue.toLocaleString()}</span>
        </div>

        <div className="mc-metric-card">
          <span className="metric-title">95% Value at Risk (VaR)</span>
          <span className="metric-value text-amber">${simulation.var95.toLocaleString()}</span>
          <span className="metric-sub">Max capital loss at 95% confidence</span>
        </div>

        <div className="mc-metric-card">
          <span className="metric-title">Conditional VaR (CVaR / Expected Tail Loss)</span>
          <span className="metric-value text-red">${simulation.cvar95.toLocaleString()}</span>
          <span className="metric-sub">Average loss beyond 95th percentile</span>
        </div>

        <div className="mc-metric-card">
          <span className="metric-title">Tail Drawdown Prob (&gt;12%)</span>
          <span className="metric-value text-violet">{simulation.maxDrawdownProbability}%</span>
          <span className="metric-sub">Sharpe: {simulation.sharpeRatio} | Sortino: {simulation.sortinoRatio}</span>
        </div>
      </div>

      {/* Chart Section: Stochastic Trajectories & Outcome Histogram */}
      <div className="mc-charts-grid">
        <div className="mc-chart-box glass-card">
          <div className="chart-header">
            <h4>
              <Play size={16} className="text-green" /> 1,000 Path Stochastic Trajectory Envelopes
            </h4>
            <span className="tag">Horizon: {simulation.horizonDays} Days</span>
          </div>
          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={simulation.trajectories} margin={{ top: 15, right: 15, bottom: 5, left: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" label={{ value: 'Days Ahead', position: 'insideBottom', offset: -4, fill: '#64748b', fontSize: 10 }} stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="p95" stroke="none" fill="rgba(6, 214, 160, 0.15)" name="95th Percentile" />
                <Area type="monotone" dataKey="p75" stroke="none" fill="rgba(59, 130, 246, 0.2)" name="75th Percentile" />
                <Line type="monotone" dataKey="p50" stroke="var(--accent-cyan)" strokeWidth={2.5} dot={false} name="Median (P50)" />
                <Area type="monotone" dataKey="p25" stroke="none" fill="rgba(245, 158, 11, 0.2)" name="25th Percentile" />
                <Area type="monotone" dataKey="p5" stroke="none" fill="rgba(239, 68, 68, 0.25)" name="5th Percentile" />
                <Line type="monotone" dataKey="worstPath" stroke="var(--accent-red)" strokeDasharray="3 3" strokeWidth={1.5} dot={false} name="Worst Shock Path" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio End Value Probability Histogram */}
        <div className="mc-chart-box glass-card">
          <div className="chart-header">
            <h4>
              <BarChart3 size={16} className="text-violet" /> Terminal Portfolio Distribution
            </h4>
            <span className="tag">Frequency Bins</span>
          </div>
          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={simulation.histogramData} margin={{ top: 15, right: 15, bottom: 25, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="range" stroke="#64748b" tick={{ fontSize: 9, angle: -25, textAnchor: 'end' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="var(--accent-cyan)" name="Simulations Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonteCarloSimulatorPane;
