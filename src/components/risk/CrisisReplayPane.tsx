import React, { useState } from 'react';
import {
  ShieldAlert,
  TrendingDown,
  History
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  NeuroRiskEngine,
  type CrisisScenario
} from '../../lib/NeuroRiskEngine';

export const CrisisReplayPane: React.FC = () => {
  const [scenarios] = useState<CrisisScenario[]>(() => NeuroRiskEngine.getCrisisScenarios());
  const [selectedScenario, setSelectedScenario] = useState<CrisisScenario>(scenarios[0]);

  return (
    <div className="crisis-pane-container">
      {/* Header Banner */}
      <div className="crisis-header glass-card">
        <div className="title-box">
          <h3>
            <ShieldAlert size={20} className="text-red icon-pulse" /> Historical Market Crisis Stress Replay Sandbox
          </h3>
          <p className="text-muted">Simulate current portfolio performance under extreme historical market shocks and crash events.</p>
        </div>

        <div className="crisis-selector">
          <label>Select Crisis Scenario:</label>
          <select value={selectedScenario.id} onChange={e => setSelectedScenario(scenarios.find(s => s.id === e.target.value) || scenarios[0])}>
            {scenarios.map(s => (
              <option key={s.id} value={s.id}>{s.label} ({s.period})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Scenario Metrics Banner */}
      <div className="crisis-metrics-grid">
        <div className="c-card">
          <span className="card-lbl">Estimated Portfolio Drawdown</span>
          <span className="card-val text-red">{selectedScenario.estimatedPortfolioDrawdownPct}%</span>
          <span className="card-sub">Loss: <strong>-${selectedScenario.estimatedPortfolioLossUsd.toLocaleString()}</strong></span>
        </div>

        <div className="c-card">
          <span className="card-lbl">Historical Market Drop</span>
          <span className="card-val text-amber">{selectedScenario.historicalMarketDropPct}%</span>
          <span className="card-sub">SPY Benchmark Drop</span>
        </div>

        <div className="c-card">
          <span className="card-lbl">Estimated Recovery Horizon</span>
          <span className="card-val text-cyan">{selectedScenario.recoveryDays} Days</span>
          <span className="card-sub">Time to Breakeven</span>
        </div>

        <div className="c-card">
          <span className="card-lbl">Crisis Shock Event</span>
          <span className="card-val text-violet">{selectedScenario.label}</span>
          <span className="card-sub">{selectedScenario.period}</span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="crisis-charts-grid">
        {/* Left: Crisis Drawdown Trajectory Chart */}
        <div className="chart-card glass-card">
          <div className="card-title-row">
            <h4>
              <TrendingDown size={16} className="text-red" /> Simulated Portfolio Drawdown Trajectory
            </h4>
            <span className="tag">{selectedScenario.label}</span>
          </div>

          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={selectedScenario.drawdownTrajectory} margin={{ top: 15, right: 15, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" label={{ value: 'Days Since Crisis Onset', position: 'insideBottom', offset: -4, fill: '#64748b', fontSize: 10 }} stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="portfolioValue" stroke="var(--accent-red)" strokeWidth={2.5} dot={false} name="Portfolio Equity ($)" />
                <Line type="monotone" dataKey="benchmarkValue" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="SPY Benchmark ($)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Asset Drawdown Breakdown Table */}
        <div className="breakdown-card glass-card">
          <div className="card-title-row">
            <h4>
              <History size={16} className="text-amber" /> Asset Drawdown Impact Breakdown
            </h4>
            <span className="tag">{selectedScenario.assetDrawdowns.length} Assets</span>
          </div>

          <div className="asset-losses-list">
            {selectedScenario.assetDrawdowns.map(asset => (
              <div key={asset.symbol} className="loss-row">
                <div className="l-info">
                  <span className="l-symbol">{asset.symbol}</span>
                  <span className="l-sub">Max Peak-to-Trough</span>
                </div>

                <div className="l-bar-col">
                  <div className="l-bar">
                    <div className="l-fill" style={{ width: `${Math.abs(asset.drawdownPct)}%` }} />
                  </div>
                </div>

                <div className="l-pnl-col">
                  <span className="l-pct text-red">{asset.drawdownPct}%</span>
                  <span className="l-usd">-${asset.lossUsd.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrisisReplayPane;
